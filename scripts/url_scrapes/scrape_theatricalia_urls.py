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
('https://theatricalia.com/play/1p/the-tempest-or-the-enchanted-island/past?page=', 13),
('https://theatricalia.com/play/1z/antony-and-cleopatra/past?page=', 7)]

pages = [] #All the individual paginated listings pages for each play

for play in plays:
    pagination = [play[0] + str(pag_page) for pag_page in range(1, play[1])]
    for each_page in pagination:
        pages.append(each_page)


def get_production_url(page):
    html = requests.get(page).text
    soup = BeautifulSoup(html, 'html5lib')
    #part of paginated page that represents all productions (a list) of that particular play
    productions = soup.find('ul', {'class': 'production_list'}).findAll('li')
    for each_production in productions:
        link = each_production.find('a').get('href')
        file = open('data/urls/theatricalia_production_urls.tsv', 'a')
        file.write(link + '\n')
        file.close()

print(pages)
#print(pages)

p = Pool(10)
records = p.map(get_production_url, pages)
p.terminate()
p.join()
