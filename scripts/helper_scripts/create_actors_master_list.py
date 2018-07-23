import unicodecsv
import glob
import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool, Manager
import re
from datetime import datetime
from operator import itemgetter

#files = ['data/theatricalia_performers.tsv', 'data/temp_to_clean.tsv', 'data/off_performers.tsv']
manager = Manager()

temp_arr = manager.list()
url_base = 'https://en.wikipedia.org/wiki/'
actors = glob.glob('data/ages/*.tsv')

actors_master = []

def normalize_date(date):
    #16th April 1934
    '''Attempts to transform date in string into a date obj
    '''
    # remove 'th, rd' type suffixes from dates
    d = re.search(r'(\d+)[a-z]+\s([A-Za-z]+)\s(\d{4})', date)
    if d:
        date = d.group(1) + ' ' + d.group(2) + ' ' + d.group(3)
    for format in ('%d %B %Y', '%B %d, %Y', '%d.%m.%Y', '%m/%d/%Y', '%Y-%m-%d', '%b %d, %Y', '%Y'):
        try:
            return datetime.strptime(date, format)
        except ValueError:
            pass
    return 'Not a proper date/wrongly formatted dates'


def stringify_date(date_obj):
    #print('date obj:')
    #print(date_obj)
    try:
        #return datetime.strftime(date_obj, '%Y-%m-%d')
        #return '{:%m/%d/%Y}'.format(date_obj)
        return date_obj.isoformat()
    except AttributeError:
        return 'not a date'

print(actors)

for actor_file in actors:
    role = open(actor_file)
    reader = unicodecsv.reader(role, delimiter='\t')
    #print(reader)
    for each_actor_role in reader:
        #print each_actor_role
        if each_actor_role[3] not in actors_master and each_actor_role[3] != 'actor':
            actors_master.append(each_actor_role[3])


print actors_master
print(len(actors_master))

# July 10, 2018- Rewrite this function so that it only takes input
def get_actor_info(actor_name):
    # write to a different file instead:
    # e.g., data_file = open('data/actors_meta/master_actors_list.tsv', 'a')

    #data_file = open('data/ages/othello_ages.tsv', 'a')
    '''
    actor_meta[0] = stringify_date(normalize_date(actor_meta[0]))
    actor_info = '\t'.join(actor_meta)



    if len(actor_meta) > 1:
    '''
    actors_data_file = open('data/master_actors_list.tsv', 'a')

    actor_gender = 'unknown'
    is_actor = ''
    actor_ethnicity_cat = []
    actor_ethnicity = []
    search_paragraph = ''
    photo_url = ''
    bday_data_source = ''
    age_is_est = 'false'

    actor_name = actor_name.strip('* ').title()
    #print(actor_name)
    full_wiki_url = url_base + '_'.join(actor_name.split(' '))
    html = requests.get(full_wiki_url).text
    soup = BeautifulSoup(html, 'html5lib')
    #print(soup)
    person_not_found = soup.find('table', {'id': 'noarticletext'})

    if not person_not_found:
        categories = soup.find('div', {'id': 'mw-normal-catlinks'}).find('ul').findAll('li')
        for each_category in categories:
            if re.search('disambiguation', each_category.get_text()):
                # Fix logic here; if hits disambiguation page, needs to overwrite/rewrite 'categories'

                new_url = url_base + '_'.join(actor_name.split(' ')) + '_(actor)'
                #print(new_url)
                html = requests.get(new_url).text
                soup = BeautifulSoup(html, 'html5lib')
                person_not_found = soup.find('table', {'id': 'noarticletext'})
                break

    #REDO logic here. Use a tuple of patterns and do a try/except(?) of matching different patterns
    if not person_not_found:
        categories = soup.find('div', {'id': 'mw-normal-catlinks'}).find('ul').findAll('li')
        # Fun times with categories
        for each_category in categories:
            category = each_category.get_text()
            if re.search(r'(Black|African-American)', category):
                actor_ethnicity.append('Black')

            if re.search(r'(Hispanic|Latin(a|o))', category):
                actor_ethnicity.append('Latino')

            if re.search(r'Asian', category):
                actor_ethnicity.append('Asian')

            if re.search(r'of\s(.+)\sdescent', category):
                actor_ethnicity_cat.append(re.search(r'of\s(.+)\sdescent', category).group(1))

            if re.search(r'((A|a)ctress(es)*)|((F|f)emale)', category):
                actor_gender = 'female'
            elif re.search(r'(M|m)ale', category):
                actor_gender = 'male'

            if re.search(r'([A|a]ctor)|([A|a]ctress)', category):
                is_actor = 'true'

        #birth_date = re.search(r'(\d+\s\w+\s\d\d\d\d|\w+\s\d+\,\s\d\d\d\d)', soup.get_text())
        #better birthday search: looks for (born 12 October 1987) or (born January 23, 1980) or (born 1970)
        #print(soup.find('p').get_text())
        #print(all_ps[0].get('class'))
        '''
        if (soup.find('p', {'class': 'mw-empty-elt'})):
            if soup.find('p', {'class': 'mw-empty-elt'}).find_next_sibling('p'):
                search_paragraph = soup.find('p', {'class': 'mw-empty-elt'}).find_next_sibling('p').get_text()
        else:
            search_paragraph = soup.find('p').get_text()
        '''
        # 7/18 rewrite search_paragraph better logic
        all_ps = soup.findAll('p')

        if all_ps[0].get('class') and  all_ps[0].get('class')[0] == 'mw-empty-elt':
            search_paragraph = all_ps[1].get_text()
        else:
            search_paragraph = all_ps[0].get_text()
        #print(search_paragraph)
        birth_date = re.search(r'\(born\s(\d+\s\w+\s\d{4}|\w+\s\d+\,\s\d{4})', search_paragraph)
        birth_year = re.search(r'\(born\s(\d{4})', search_paragraph)

        if birth_date:
            #print(actor_name, birth_date.group(0))
            formatted_bday = stringify_date(normalize_date(birth_date.group(1)))
            #actor_info = formatted_bday + '\t' + actor_info
            #print(actor_name, formatted_bday)
            bday_data_source = 'Wikipedia'
        elif not birth_date and birth_year:
            formatted_bday = stringify_date(normalize_date(birth_year.group(1)))
            #actor_info = formatted_bday + '\t' + actor_info
            #print(actor_name, formatted_bday, 'estimate')
            age_is_est = 'true'
            bday_data_source = 'Wikipedia'
        else:
            birth_date = re.search(r'(\d+\s\w+\s\d{4}|\w+\s\d+\,\s\d{4})', search_paragraph)
            if birth_date:
                formatted_bday = stringify_date(normalize_date(birth_date.group(0)))
                #print(actor_name, formatted_bday)
                bday_data_source = 'Wikipedia'
                #actor_info = formatted_bday + '\t' + actor_info
            else:
                formatted_bday = 'no birthday on article'
                #actor_info = 'no birthday on article' + '\t' + actor_info
                #print(actor_name, 'no birthday on article')

        ethnicity = ','.join(actor_ethnicity) if len(actor_ethnicity) else 'none'
        ethnic_cat = ','.join(actor_ethnicity_cat) if len(actor_ethnicity_cat) else 'none'
        is_actor = is_actor if is_actor else 'flagged'

        if soup.find('table', {'class': 'biography'}):
            if soup.find('table', {'class': 'biography'}).find('img'):
                photo_url = soup.find('table', {'class': 'biography'}).find('img').get('src')
                photo_url = photo_url.strip('//')
                #print(photo_url)

        actor_info = '\t'.join([actor_name, formatted_bday, actor_gender, ethnicity, age_is_est, bday_data_source, is_actor, photo_url, ethnic_cat]).encode('utf-8')

        #print('\t'.join([actor_name, formatted_bday, actor_gender, ethnicity, age_is_est, bday_data_source, is_actor, photo_url, ethnic_cat]).encode('utf-8'))
        print(actor_info)

        actors_data_file.write(actor_info + '\n')
        actors_data_file.close()

    else:
        #actor_info = 'person not found on wiki' + '\t' + actor_info
        ethnicity = 'unknown'
        ethnic_cat = 'unknown'
        age_is_est = 'unknown'
        formatted_bday = 'person not found on wiki'
        print(actor_name, 'person not found on wiki')

    #actor_info = actor_info + '\t' + actor_gender + '\t' + ethnicity + '\t' + is_actor + '\t' + ','.join(actor_ethnicity_cat)
    #print(actor_info)
    #print(actor_info.split('\t'))
    #temp_arr.append(actor_info.split('\t'))
    #data_file.write(actor_info.encode('utf-8') + '\n')
    #data_file.close()
    #print(actor_info + '\t' + actor_gender + '\t' + ','.join(actor_ethnicity) + '\t' + ','.join(actor_ethnicity_cat))

get_actor_info('Sara Topham')
get_actor_info('Vinette Robinson')
get_actor_info('Alec Baldwin')



p = Pool(10)
records = p.map(get_actor_info, actors_master)
p.terminate()
p.join()
