import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'King Lear of Britain', 'King Lear', 'Lear', 'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool']
test_url = 'http://www.lortel.org/Archives/Production/4598'
show_urls = open('off-shows.csv').read().split()

#print show_urls

def get_production_info(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html5lib')
    production_dates = soup.findAll('div', {'class': 'iobdb-frame'})[1]
    rows = production_dates.findAll('tr')

    print(url)
    for each_row in rows:
        th = each_row.find('th')
        if th:
            if th.get_text() == 'Opening date:':
                print(th.get_text())
                print(each_row.find('td'))


#get_production_info(test_url)


#for url in show_urls:
    #get_actors_info(url)

p = Pool(10)
records = p.map(get_production_info, show_urls)
p.terminate()
p.join()
