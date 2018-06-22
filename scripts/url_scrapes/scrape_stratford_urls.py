#scrape stratford festival urls

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

url = 'http://internetshakespeare.uvic.ca/Theater/company/113/'
plays = re.compile(r'Macbeth|Othello|Romeo\s(and|\&)\sJuliet|Hamlet|King\sLear|'
                   r'The\sTempest|Antony\s(and|\&)\sCleopatra|Richard\sIII|Julius\sCaesar')

html = requests.get(url).text
soup = BeautifulSoup(html, 'html5lib')

list_of_prods = soup.find('div', {'id': 'content'}).find('ol').findAll('li')

url_file = open('data/urls/stratford_urls.tsv', 'a')

for each_production in list_of_prods:
    film_or_stage = re.search(r'play_icon', each_production.find('img').get('src'))
    play_name = plays.search(each_production.find('a').get_text())
    if film_or_stage and play_name:
        print(play_name.group(0))
        print(each_production.find('a').get('href'))
        url_file.write(each_production.find('a').get('href') + '\n')

url_file.close()
