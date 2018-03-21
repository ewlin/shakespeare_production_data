import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import unicodecsv


role_patterns = re.compile(r'Miranda|Macbeth|Othello|Antony|'
                           r'Iago|Romeo|Hamlet|Lear|Juliet|Lady Macbeth|'
                           r'Desdemona|Ophelia|Fool|Prospero|Ariel|'
                           r'Cleopatra|Caesar|Richard|Emilia')

test_url = 'http://collections.shakespeare.org.uk/search/rsc-performances/ham191308-hamlet/view_as/list/search/everywhere:hamlet/page/7'

def scrape_production_page(url_meta):
    html = requests.get(url_meta[1]).text
    soup = BeautifulSoup(html, 'html5lib')

    credits = soup.find('div', {'class': 'single-details-content'}).find('ul', {'class': 'columns'})

    actors = []

    # TSV columns: Date Role Actor Director Production_Company Theatre /Language_Flag/

    opening = 'unknown opening date'
    director = 'director unknown'
    venue = 'unknown theatre'

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
                        #print(actor_name)
                        actors.append((role_name, actor_name[1] + ' ' + actor_name[0] if len(actor_name) > 1 else actor_name[0]))

            # code to make sure there's actually a value here?
            elif col_heading == 'Press night':
                opening = each_col.find('p').get_text()
            elif col_heading == 'Venue':
                venue = each_col.find('p').get_text()
            elif col_heading == 'Creative':
                crew = each_col.find('ul').findAll('li')
                for each_person in crew:
                    if each_person.find('p').get_text().strip() == 'Director':
                        director_names = each_person.findAll('p')[1].get_text().strip().strip(',').split(', ')
                        print(director_names)
                        director = director_names[1] + ' ' + director_names[0] if len(director_names) > 1 else director_names[0]

        print(actors)
        actors_meta = [[opening, actor[0], actor[1], director, u'Royal Shakespeare Company', venue] for actor in actors]
        tsv_file = open('data/rsc_performers.tsv', 'a')
        for each_row in actors_meta:
            line = ('\t').join(each_row)
            tsv_file.write(line.encode('utf-8') + '\n')
        tsv_file.close()

    #print(actors_meta)


#scrape_production_page(test_url)
with open('data/urls/rsc_urls.tsv') as productions:
    productions = unicodecsv.reader(productions, delimiter='\t')
    p = Pool(10)
    records = p.map(scrape_production_page, productions)
    p.terminate()
    p.join
