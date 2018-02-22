import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

roles = re.compile(r'Miranda|Macbeth|Othello|Antony|Cleopatra'
                           r'Iago|Romeo|Hamlet|Lear|Juliet|Lady Macbeth|'
                           r'Desdemona|Ophelia|Fool|Prospero|Ariel')

#show_urls = open('data/uk_productions/productions.tsv').read().split()
show_urls = open('data/theatricalia_production_urls.tsv').read().split()

def get_production_info(page):
    html = requests.get('https://theatricalia.com/' + page).text
    soup = BeautifulSoup(html, 'html5lib')
    crew = {}
    actors = {}
    data_file = open('data/theatricalia_productions.tsv', 'a')

    sidebar_info = soup.find('div', {'id': 'sidebar_tulip_r'})
    production_info = sidebar_info.get_text() if sidebar_info else ""
    credits = soup.find('div', {'id': 'main'}).find('table', {'class': 'parts'})
    if credits:
        #print(page + ': found')
        rows = credits.findAll('tr')
        for row in rows:
            role = row.find('th').get_text()
            if (roles.search(role)):
                actor = row.find('a').get_text()
                #print(role + ': ' + actor)
                actors[role] = actor
            elif (role == 'Director'):
                crew['Director'] = row.find('a').get_text()
    #else:
        #print('not found')
        #data_file.write('not found' + '\n')

    #Fix all of these including a more generous date check
    date = re.search(r'\d+\w+\s\w+\s\d+|\d{4}', production_info)
    date = date.group(0) if date else 'unknown opening'
    production_company = re.search(r'\)\sby\s([^\,]+)', production_info)
    production_company = production_company.group(1).strip() if production_company else 'unknown production company'
    theatre = re.search(r'at\s([^\.\(]+)', production_info)  #if theatre: group(1).strip()
    theatre = theatre.group(1).strip() if theatre else 'unknown theatre'  #if theatre: group(1).strip()


    for actor in actors:
        if ('Director' in crew):
            actor_info = [date, actor, actors[actor], crew['Director'], production_company, theatre]
        else:
            actor_info = [date, actor, actors[actor], 'director unknown', production_company, theatre]

        actor_info = '\t'.join(actor_info)
        data_file.write(actor_info.encode('utf8') + '\n')

    data_file.close()


    #print(production_info)
    #print(crew)
    #print(actors)

#get_production_info('/play/2/hamlet/production/293')
p = Pool(10)
records = p.map(get_production_info, show_urls)
p.terminate()
p.join()
