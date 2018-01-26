import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'King Lear of Britain', 'King Lear', 'Lear', 'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool']
show_urls = open('data/uk_productions/productions.tsv').read().split()


def get_production_info(page):
    html = requests.get('https://theatricalia.com/' + page).text
    soup = BeautifulSoup(html, 'html5lib')
    crew = {}
    actors = {}
    sidebar_info = soup.find('div', {'id': 'sidebar_tulip_r'})
    production_info = sidebar_info.get_text() if sidebar_info else ""
    credits = soup.find('div', {'id': 'main'}).find('table', {'class': 'parts'})
    data_file = open('data/uk_productions/uk-performers.tsv', 'a')
    if credits:
        #print(page + ': found')
        rows = credits.findAll('tr')
        for row in rows:
            role = row.find('th').get_text()
            if (role in roles):
                actor = row.find('a').get_text()
                #print(role + ': ' + actor)
                actors[role] = actor
            elif (role == 'Director'):
                crew['Director'] = row.find('a').get_text()
    else:
        #print('not found')
        data_file.write('not found' + '\n')

    dates = re.search(r'\d+\w+\s\w+\s\d+', production_info)

    for actor in actors:
        if (dates):
            date = dates.group(0)
        else:
            date = 'unknown opening'

        if ('Director' in crew):
            actor_info = date + '\t' + actor + '\t' + actors[actor] + '\t' + 'Director:' + crew['Director']
        else:
            actor_info = date + '\t' + actor + '\t' + actors[actor] + '\t' + 'Director:unknown'

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
