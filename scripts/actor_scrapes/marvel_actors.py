# -*- coding: utf-8 -*-

#TODO:

# 1) Need to fix films in filmography where not 4 columns (year or character is shared...)
# 2) Filmography on a different page


# rewrite to test for categories (if no birthday found, try Name then _(actor) )

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool, Manager
import re
import unicodecsv
from datetime import datetime
from operator import itemgetter

manager = Manager()

temp_arr = manager.list()
url_base = 'https://en.wikipedia.org'


'''
February 17, 1925
5 April 1929
'''

#franchise_titles = [r'Game of Thrones', r'The Lord of the Rings', r'The Hobbit', r'James Bond', r'Star Wars', r'Star Trek', r'Marvel', r'X-Men', r'X2', r'Spider-Man', r'Harry Potter']

franchise_titles = []

marvel_movies_meta = open('data/franchise_list.tsv')
marvel_movies = unicodecsv.reader(marvel_movies_meta, delimiter='\t')

for marvel_film in marvel_movies:
  franchise_titles.append(marvel_film[2])


print(franchise_titles)

def in_franchise(actor, text): 
  
  matched = []
  
  for franchise in franchise_titles:
    match = re.search(franchise, text)
    if match:
      matched.append(match.group(0))
  
  if matched:
    return actor + '\t' + ', '.join(matched)
      

  
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


def get_actor_info(actor_meta):
    # write to a different file instead:
    # e.g., data_file = open('data/actors_meta/master_actors_list.tsv', 'a')

    #data_file = open('data/ages/othello_ages.tsv', 'a')
    #print(actor_meta)
    actor_info = '\t'.join(actor_meta)

    actor_gender = 'unknown'
    is_actor = ''
    actor_ethnicity_cat = []
    actor_ethnicity = []

    def not_equal_line_break (to_compare):
      return to_compare != u'\n'

    if len(actor_meta) > 1:
        actor_name = actor_meta[1].strip('* ').title()
        #print(actor_name)
        character_name = actor_meta[0]
        full_wiki_url = url_base + '/wiki/' + '_'.join(actor_name.split(' '))
        html = requests.get(full_wiki_url).text
        soup = BeautifulSoup(html, 'html5lib')
        person_not_found = soup.find('table', {'id': 'noarticletext'})

        if not person_not_found:
            categories = soup.find('div', {'id': 'mw-normal-catlinks'}).find('ul').findAll('li')
            for each_category in categories:
                if re.search('disambiguation', each_category.get_text()):
                    # Fix logic here; if hits disambiguation page, needs to overwrite/rewrite 'categories'

                    new_url = url_base + '/wiki/' + '_'.join(actor_name.split(' ')) + '_(actor)'
                    #print(new_url)
                    html = requests.get(new_url).text
                    soup = BeautifulSoup(html, 'html5lib')
                    person_not_found = soup.find('table', {'id': 'noarticletext'})
                    break

        #REDO logic here. Use a tuple of patterns and do a try/except(?) of matching different patterns
        '''
        if not person_not_found: # and re.match(r'Lear', actor_meta[1]):
            actor_data = in_franchise(actor_name, soup.get_text())
            if (actor_data):
              actor_data = character_name + '\t' + actor_data
              data_file = open('data/franchise_data/actors_plus_franchises.tsv', 'a')
              data_file.write(actor_data.encode('utf-8') + '\n')
              data_file.close()
        '''     
        
        if not person_not_found:
          #franchise_titles = [r'Game of Thrones', r'The Lord of the Rings', r'The Hobbit', r'James Bond', r'Star Wars', r'Star Trek', r'Marvel', r'X-Men', r'X2', r'Spider-Man', r'Harry Potter']

          filmography_span = soup.find('span', id='Film') or soup.find('span', id='Films')
          if filmography_span and filmography_span.parent.find_next_sibling().name == 'table':
            print(actor_name, filmography_span.get_text())

            #something weird here with the code; grabbing other random tables? More specific in selections (id/class?)
            films_table = filmography_span.parent.find_next_sibling('table')
            #if next simbling NOT table, follow link? 
            print(filmography_span.parent.find_next_sibling().name)
            if films_table:
              films = films_table.find('tbody').findAll('tr')
              #if actor_name == 'Andrew Garfield' or actor_name == 'Elizabeth Olsen':
              #    print(films)
              
              max_cols_len = len(filter(not_equal_line_break, films[0]))
              print(max_cols_len)
              current_year = None
              
              #reduce redudant code; add marvel tv shows (Netflix + other)
              for film in films: 
                
                columns = filter(not_equal_line_break, list(film.children))
                
                current_year = re.search(r'[0-9]{4}', columns[0].get_text()) if re.search(r'[0-9]{4}', columns[0].get_text()) else current_year
                
                # Write some logic to deal with some columns that are shared across rows (same character or year for example)
                if len(columns) > 1 and len(columns) == max_cols_len:
                  if columns[1].find('a'):
                    film_title = columns[1].find('a').get_text()
                  else:
                    film_title = columns[1].get_text()
                elif len(columns) > 1 and len(columns) < max_cols_len:
                  #print('wrong number of cols')
                  #print(columns)
                  if not re.search(r'[0-9]{4}', columns[0].get_text()):
                    film_title = columns[0].get_text()
                  else: 
                    if columns[1].find('a'):
                      film_title = columns[1].find('a').get_text()
                    else:
                      film_title = columns[1].get_text()
                else: 
                  film_title = None
                
                
                if film_title:
                  for franchise in franchise_titles:
                    if film_title == franchise:
                      print(actor_name, film_title, current_year.group(0))
              
              #film_title = columns[1].get_text()
              #print(film_title)
                
          elif soup.find('span', id='Filmography'):
            filmography_span = soup.find('span', id='Filmography')
            print(actor_name, filmography_span.get_text())
            if filmography_span.parent.find_next_sibling().name == 'div' and filmography_span.parent.find_next_sibling().find('a'):
              print(filmography_span.parent.find_next_sibling().find('a').get_text())
              print(filmography_span.parent.find_next_sibling().find('a').get('href'))
              

            
          else: 
            #match the entire page? 
            print(actor_name, 'Need to Manually Search For Films/Odd Wiki Format')
            
            
            
            
            '''
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
                    is_actor = 'yes'

            #birth_date = re.search(r'(\d+\s\w+\s\d\d\d\d|\w+\s\d+\,\s\d\d\d\d)', soup.get_text())
            #better birthday search: looks for (born 12 October 1987) or (born January 23, 1980) or (born 1970)
            birth_date = re.search(r'\(born\s(\d+\s\w+\s\d{4}|\w+\s\d+\,\s\d{4}|\d{4})', soup.find('p').get_text())
            if birth_date:
                #print(actor_name, birth_date.group(0))
                formatted_bday = stringify_date(normalize_date(birth_date.group(1)))
                actor_info = formatted_bday + '\t' + actor_info
            else:
                birth_date = re.search(r'(\d+\s\w+\s\d{4}|\w+\s\d+\,\s\d{4})', soup.find('p').get_text())
                if birth_date:
                    formatted_bday = stringify_date(normalize_date(birth_date.group(0)))
                    actor_info = formatted_bday + '\t' + actor_info
                else:
                    actor_info = 'no birthday on article' + '\t' + actor_info

            ethnicity = ','.join(actor_ethnicity) if len(actor_ethnicity) else 'none'
            ethnic_cat = ','.join(actor_ethnicity_cat) if len(actor_ethnicity_cat) else 'none'
            is_actor = is_actor if is_actor else 'flagged'

        else:
            actor_info = 'person not found on wiki' + '\t' + actor_info
            ethnicity = 'unknown'
            ethnic_cat = 'unknown'
        '''
            
        #actor_info = actor_info + '\t' + actor_gender + '\t' + ethnicity + '\t' + is_actor + '\t' + ','.join(actor_ethnicity_cat)
        ##print(actor_info)
        ##print(actor_info.split('\t'))
        #temp_arr.append(actor_info.split('\t'))
        #data_file.write(actor_info.encode('utf-8') + '\n')
        #data_file.close()
        #print(actor_info + '\t' + actor_gender + '\t' + ','.join(actor_ethnicity) + '\t' + ','.join(actor_ethnicity_cat))
        #each_actor[3] = each_actor[3].strip('* ').title()
        #actor_info = '\t'.join(each_actor)


#write logic so don't rescrape data already found
#use wiki to scrape for gender (if first paragraph uses 'she' or 'her')
#scrape for ethnicity?

with open('data/franchise_data/actors_plus_franchises.tsv') as actors:
    actors = unicodecsv.reader(actors, delimiter='\t')

    # need to share state between processes for this to work
    # https://docs.python.org/3/library/multiprocessing.html#sharing-state-between-processes
    p = Pool(10)
    records = p.map(get_actor_info, actors)
    p.terminate()
    p.join()
