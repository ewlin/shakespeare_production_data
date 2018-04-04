import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import unicodecsv

role_patterns = re.compile(r'Miranda|Macbeth|Othello|Antony|'
                           r'Iago|Romeo|Hamlet|Lear|Juliet|Lady Macbeth|'
                           r'Desdemona|Ophelia|Fool|Prospero|Ariel|'
                           r'Cleopatra|Caesar|Richard|Emilia|Brutus')

base_url = 'http://www.shakespearesglobe.com'


'''
Deal with international, and non-standard productions:
Part of ... Globe to Globe festival
Performed in Hip Hop by the Q Brothers, Chicago Shakespeare Theatre & Richard Jordan Productions, from Chicago, USA.
'''

def get_production_info(meta):
    production_roles = []
    url = meta[3]
    html = requests.get(base_url + url).text
    soup = BeautifulSoup(html, 'html5lib')

    prod_info = soup.find('article', {'id': 'production'}).get_text()
    director = meta[2]

    special_performances_flag = re.search(r'Performed in ([^(by)]+) by (.+)(?=,\sfrom)', prod_info)
    language_performed_in = special_performances_flag.group(1) if special_performances_flag else 'English'
    production_company = special_performances_flag.group(2) if special_performances_flag else 'Shakespeare\'s Globe'

    cast = soup.find('ul', {'class': 'cast'}).findAll('li')#, string=role_patterns)
    # Loop through all actors/roles for a particular production
    for each_role in cast:
        if role_patterns.search(each_role.get_text()):
            actor_role_pair = each_role.get_text().strip().split('\n')
            production_roles.append(actor_role_pair)

    # Loop through all actor/role pairs in EVERY production
    # TSV columns: Date Role Actor Director Production_Company Theatre Language_Flag
    for each_actor in production_roles:
        if language_performed_in == 'English':
            globe_actors_file = open('data/globe_performers.tsv', 'a')
            #tsv_row_list = [meta[1], each_actor[0], each_actor[1], director, production_company, 'Shakespeare\'s Globe', language_performed_in]
            tsv_row_list = [meta[1], each_actor[0], each_actor[1].strip(), director,
                            production_company, 'Shakespeare\'s Globe']
            print(tsv_row_list)
            globe_actors_file.write('\t'.join(tsv_row_list).encode('utf-8') + '\n')
            globe_actors_file.close()


with open('data/urls/globe_urls.tsv') as productions:
    productions = unicodecsv.reader(productions, delimiter='\t')
    #for actor in actors:
        #get_actor_info(actor)
    p = Pool(10)
    records = p.map(get_production_info, productions)
    p.terminate()
    p.join()
