import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'King Lear of Britain', 'King Lear', 'Lear', 'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool']
#show_urls = open('off-shows.csv').read().split()
page_range = list(range(1,30))
pages = ['https://theatricalia.com/play/2/hamlet/past?page=' + str(page) for page in page_range]

def get_production_url(page):
    html = requests.get(page).text
    soup = BeautifulSoup(html, 'html5lib')
    #production_dates = soup.findAll('div', {'class': 'iobdb-frame'})[1]
    #rows = production_dates.findAll('tr')
    productions = soup.find('ul', {'class': 'production_list'}).findAll('li')
    for each_production in productions:
        link = each_production.find('a').get('href')
        file = open('data/uk-productions.tsv', 'a')
        file.write(link + '\n')
        file.close()


p = Pool(10)
records = p.map(get_production_url, pages)
p.terminate()
p.join()
