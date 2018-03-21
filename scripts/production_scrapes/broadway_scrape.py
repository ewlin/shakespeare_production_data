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

test_url = ['', '/broadway-production/macbeth-494910', '']


def get_actors_info(production):
    url_root = 'https://www.ibdb.com'
    url = url_root + production[1]

    director = 'director unknown'
    producer = 'unknown production company'

    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html5lib')
    tables = soup.findAll('table', {'class': 'cast'})
    date = soup.find('table', {'id': 'proddates'}).findAll('tr')[1].find('td', {'class': 'dates'}).get_text()

    theatre = re.search(r'\n(.*)(?=\,\s\()', soup.get_text()).group(1).strip()

    crew = soup.find('table', {'class': 'production-staff'})
    if (crew):
        crew_roles = crew.findAll('tr')
        for each_crew in crew_roles:
            search_director = re.search(r'Directed by ([^\;\(]+)', each_crew.get_text())
            search_producer = re.search(r'Produced by ([^\;\(]+)', each_crew.get_text())

            if search_director:
                #print('Director: ' + search_director.group(1).strip())
                director = search_director.group(1).strip()
            if search_producer:
                #print('Producer: ' + search_producer.group(1).strip())
                producer = ' '.join(search_producer.group(1).split())

    #print(dates)
    if len(tables) > 1:

        cast = tables[1].find_all('tr')
        for row in cast:
            cols = row.find_all('td')
            if cols[0].find('a'):
                actor = cols[0].find('a').get_text()
                role = str(cols[1].contents[0]).splitlines()[1].strip()
                if re.search(role_patterns, role):
                    info = '\t'.join((date, role, actor, director, producer, theatre)).encode('utf8')
                    #print info
                    #print(theatre)
                    print((date, role, actor, theatre, producer, director))
                    performers_file = open('data/broadway_performers.tsv', 'a')
                    performers_file.write(info + '\n')
                    performers_file.close()
                    #return info



#get_actors_info(test_url)

with open('data/urls/broadway_production_urls.tsv') as shows:
    productions = unicodecsv.reader(shows, delimiter='\t')

    p = Pool(10)
    records = p.map(get_actors_info, productions)
    p.terminate()
    p.join()
