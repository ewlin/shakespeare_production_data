# -*- coding: utf-8 -*-

#Jan 26, 2018-
# TODOS:
#   - grab director and production company names (Finished 1/27/18)
#   - add ability to match regex object rather than exact string match for character/role names (Finished 1/27/18)
#   - exclude odd production of The Tempest with multiple Ariels (Finished 1/27)
#   - exclude matches of role/character but actor is understudy (Finished 1/27)

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

#weird production with lots of Ariels
exclude = ['http://www.lortel.org/Archives/Production/2128']

url_base = 'http://www.lortel.org'

def get_production_info(meta):
    url = meta[2]
    opening_date = meta[1]
    theatre = meta[0]
    director = None
    producer = None
    if url_base + url in exclude:
        return
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
                    role_match = role_patterns.search(actor_columns[2].get_text())
                    #if actor_columns[2].get_text() in roles and actor_columns[3].get_text() != 'UNDERSTUDY':
                    print(actor_columns[3].get_text())
                    if role_match and actor_columns[3].get_text().strip() != 'UNDERSTUDY':
                        actor = actor_columns[1].find('a').get_text()
                        role = actor_columns[2].get_text()
                        #actor_info = [date, actor, actors[actor], crew['Director'], production_company, theatre]
                        #actor_info = url + '\t' + str(opening_date) + '\t' + str(actor_columns[2].get_text()) + '\t' + str(actor_columns[1].find('a').get_text())
                        actor_info = [opening_date, role, actor, director, producer, theatre]
                        actor_info = '\t'.join(actor_info)
                        data_file = open('data/off_performers.tsv', 'a')
                        data_file.write(actor_info.encode('utf8') + '\n')
                        data_file.close()


with open('data/urls/off_broadway_production_urls.tsv') as productions:
    productions = unicodecsv.reader(productions, delimiter='\t')
    #for actor in actors:
        #get_actor_info(actor)
    p = Pool(10)
    records = p.map(get_production_info, productions)
    p.terminate()
    p.join()
