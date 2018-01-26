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
        actors = cast_info.findAll('table')[1].findAll('tr')

        if actors:
            for actor in actors:
                actor_columns = actor.findAll('td')
                if actor_columns:
                    if actor_columns[2].get_text() in roles:
                        #actor_info = [date, actor, actors[actor], crew['Director'], production_company, theatre]
                        actor_info = url + '\t' + str(opening_date) + '\t' + str(actor_columns[2].get_text()) + '\t' + str(actor_columns[1].find('a').get_text())
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
