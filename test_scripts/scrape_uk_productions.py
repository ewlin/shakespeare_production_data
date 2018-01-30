#scrape uk productions urls from Theatricalia

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool

plays = [('https://theatricalia.com/play/2/hamlet/past?page=', 30),
('https://theatricalia.com/play/n/romeo-and-juliet/past?page=', 17),
('https://theatricalia.com/play/8/othello/past?page=', 14),
('https://theatricalia.com/play/t/macbeth/past?page=', 22),
('https://theatricalia.com/play/y/king-lear/past?page=', 13),
('https://theatricalia.com/play/1p/the-tempest-or-the-enchanted-island/past?page=', 13]

#roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'King Lear of Britain', 'King Lear', 'Lear', 'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool']
#show_urls = open('off-shows.csv').read().split()
pages = [] #['https://theatricalia.com/play/2/hamlet/past?page=' + str(page) for page in page_range]

for play in plays:
    pagination = [play[0] + str(pag_page) for pag_page in range(1, play[1])]
    for each_page in pagination:
        pages.append(each_page)


def get_production_url(page):
    html = requests.get(page).text
    soup = BeautifulSoup(html, 'html5lib')
    #production_dates = soup.findAll('div', {'class': 'iobdb-frame'})[1]
    #rows = production_dates.findAll('tr')
    productions = soup.find('ul', {'class': 'production_list'}).findAll('li')
    for each_production in productions:
        link = each_production.find('a').get('href')
        file = open('data/uk_productions/productions.tsv', 'a')
        file.write(link + '\n')
        file.close()

print(pages)
#print(pages)

p = Pool(10)
records = p.map(get_production_url, pages)
p.terminate()
p.join()
