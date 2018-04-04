import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

plays_patterns = re.compile(r'As You Like It|Merchant of Venice')

productions_url = 'http://www.cheekbyjowl.com/productions.php'
html = requests.get(productions_url).text
soup = BeautifulSoup(html, 'html5lib')

productions = soup.find('ul', {'id': 'productions'}).findAll('li')

for each_production in productions:
    prod_meta = each_production.findAll('a')
    #print(prod_meta)

    if prod_meta:
        for each_link in prod_meta:
            if each_link.find('h3'):
                show = re.search(plays_patterns, each_link.find('h3').get_text())
                if show:
                    print(show.group(0), each_link.get('href'))
                    urls_file = open('data/urls/additional_characters_urls/cheekbyjowl.tsv', 'a')
                    urls_file.write('\t'.join((show.group(0), each_link.get('href'))).encode('utf8') + '\n')
                    urls_file.close()
