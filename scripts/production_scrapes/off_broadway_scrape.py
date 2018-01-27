#Jan 26, 2018-
# TODOS:
#   - grab director and production company names (Finished 1/27/18)
#   - add ability to match regex object rather than exact string match for character/role names
#   - exclude odd production of The Tempest with multiple Ariels
#   - exclude matches of role/character but actor is understudy

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import unicodecsv

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'Lear',
         'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool',
         'Prospero', 'Ariel']

role_patterns = re.compile(r'Macbeth|Othello|Iago|Romeo|Hamlet|Lear|Juliet|Lady Macbeth|Desdemona|Ophelia|Fool|Prospero|Ariel')

exclude = ['http://www.lortel.org/Archives/Production/2128']

url_base = 'http://www.lortel.org'

def get_production_info(meta):
    url = meta[2]
    opening_date = meta[1]
    theatre = meta[0]
    director = None
    producer = None
    html = requests.get(url_base + url).text
    soup = BeautifulSoup(html, 'html5lib')

    tables = soup.findAll('div', {'class', 'iobdb-body'})
    if tables:
        if len(tables[2].findAll('table')) > 1:
            cast_info = tables[2]
        else:
            cast_info = tables[3]

        #print(len(tables))
        #print(tables[2].get_text())
    if cast_info:
        crew = cast_info.findAll('table')[0].findAll('tr')
        actors = cast_info.findAll('table')[1].findAll('tr')

        for crew_member in crew:
            crew_columns = crew_member.findAll('td')
            #print(crew_columns)
            if len(crew_columns) < 3:
                continue

            position = crew_columns[2].get_text().strip()
            print(position)

            if not director:
                director = crew_columns[1].find('a').get_text() if position == 'Director' else None
            if not producer:
                producer = crew_columns[1].find('a').get_text() if position == 'Producer' else None



        director = director if director else 'director unknown'
        producer = producer if producer else 'unknown production company'

        if actors:
            for actor in actors:
                actor_columns = actor.findAll('td')
                if actor_columns:
                    if actor_columns[2].get_text() in roles and actor_columns[3].get_text() != 'UNDERSTUDY':
                        actor = str(actor_columns[1].find('a').get_text())
                        role = str(actor_columns[2].get_text())
                        #actor_info = [date, actor, actors[actor], crew['Director'], production_company, theatre]
                        #actor_info = url + '\t' + str(opening_date) + '\t' + str(actor_columns[2].get_text()) + '\t' + str(actor_columns[1].find('a').get_text())
                        actor_info = [opening_date, role, actor, director, producer, theatre]
                        actor_info = '\t'.join(actor_info)
                        data_file = open('data/test_data/off-performers.tsv', 'a')
                        data_file.write(actor_info + '\n')
                        data_file.close()


with open('data/off_broadway_production_urls.tsv') as actors:
    actors = unicodecsv.reader(actors, delimiter='\t')
    #for actor in actors:
        #get_actor_info(actor)
    p = Pool(10)
    records = p.map(get_production_info, actors)
    p.terminate()
    p.join()
