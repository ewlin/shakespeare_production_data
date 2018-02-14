import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import unicodecsv

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'Lear',
         'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool',
         'Prospero', 'Ariel', 'Miranda']

role_patterns = re.compile(r'Miranda|Macbeth|Othello|'
                           r'Iago|Romeo|Hamlet|Lear|Juliet|Lady Macbeth|'
                           r'Desdemona|Ophelia|Fool|Prospero|Ariel')

test_url = 'http://collections.shakespeare.org.uk/search/rsc-performances/ham198103-hamlet/view_as/list/search/everywhere:hamlet/page/7'

def scrape_production_page(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html5lib')

    credits = soup.find('div', {'class': 'single-details-content'}).find('ul', {'class': 'columns'})

    actors = []

    # TSV columns: Date Role Actor Director Production_Company Theatre /Language_Flag/

    if credits:
        columns = credits.findAll('li', recursive=False)
        for each_col in columns:
            col_heading = each_col.find('h3').get_text()
            if col_heading == 'Cast':
                cast = each_col.find('ul').findAll('li')
                for each_role in cast:
                    role_name = each_role.find('p').get_text().strip()
                    if re.search(role_patterns, role_name):
                        #kinda hacky line of code here
                        actor_name = each_role.findAll('p')[1].get_text().strip().strip(',').split(', ')
                        actors.append((role_name, actor_name[1] + ' ' + actor_name[0]))
            # code to make sure there's actually a value here?
            elif col_heading == 'Press night':
                opening = each_col.find('p').get_text()
            elif col_heading == 'Creative':
                crew = each_col.find('ul').findAll('li')
                for each_person in crew:
                    if each_person.find('p').get_text().strip() == 'Director':
                        director_first_last = each_person.findAll('p')[1].get_text().strip().strip(',').split(', ')
                        director = director_first_last[1] + ' ' + director_first_last[0]

    print(actors)
    print(opening)
    print(director)

scrape_production_page(test_url)
