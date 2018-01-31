#scrape off broadway productions (including Shakespeare in the Park) cast and crew production info

import requests
import html5lib
from bs4 import BeautifulSoup
#from multiprocessing import Pool

#Listings of all Off-Broadway Shakespeare productions
main_url = 'http://www.lortel.org/Archives/CreditableEntity/40'

def get_production_urls(playwright_page):
    plays = ['Hamlet', 'Macbeth', 'King Lear', 'Othello', 'Romeo and Juliet', 'The Tempest']

    #soup = BeautifulSoup(requests.get(main_url).text, 'html5lib')
    html = requests.get(playwright_page).text
    soup = BeautifulSoup(html, 'html5lib')

    productions = soup.findAll('div', {'class': 'iobdb-frame'})[1].find('table').findAll('tr')

    for each_production in productions:
        if each_production.find('td'):
            #second column is play name + link to production
            production_info = each_production.findAll('td')
            title = production_info[1].get_text().strip()
            #print(title)

            if title in plays:
                url_file = open('data/urls/off_broadway_production_urls.tsv', 'a')
                theatre = production_info[2].get_text().strip()
                opening = production_info[3].get_text().strip()
                link = production_info[1].find('a').get('href')
                all_info = '\t'.join((theatre, opening, link)).encode('utf8')
                url_file.write(all_info + '\n')
                url_file.close()

get_production_urls(main_url)
