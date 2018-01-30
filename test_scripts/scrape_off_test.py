import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'King Lear of Britain', 'King Lear', 'Lear', 'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool']
test_url = 'http://www.lortel.org/Archives/Production/4598'
show_urls = open('off-shows-special.csv').read().split()

#print show_urls

def get_production_info(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html5lib')
    production_dates = soup.findAll('div', {'class': 'iobdb-frame'})[1]
    rows = production_dates.findAll('tr')
    for each_row in rows:
        th = each_row.find('th')
        if th:
            if th.get_text() == 'Opening date:':
                #print(th.get_text())
                opening_date = each_row.find('td').get_text()

    tables = soup.findAll('div', {'class', 'iobdb-body'})
    if tables:
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
                        print(url + ' ' + str(opening_date) + ' ' + str(actor_columns[2]) + ' ' + str(actor_columns[1].find('a').get_text()))
                        actor_info = url + '\t' + str(opening_date) + '\t' + str(actor_columns[2].get_text()) + '\t' + str(actor_columns[1].find('a').get_text())
                        file = open('data/off-performers.tsv', 'a')
                        file.write(actor_info + '\n')
                        file.close()


p = Pool(10)
records = p.map(get_production_info, show_urls)
p.terminate()
p.join()
