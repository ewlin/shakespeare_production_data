#scrape off broadway productions (including Shakespeare in the Park) cast and crew production info

import requests
import html5lib
from bs4 import BeautifulSoup
import re
#from multiprocessing import Pool

#Listings of all Broadway Shakespeare productions
main_url = 'https://www.ibdb.com/broadway-cast-staff/william-shakespeare-8638'

def get_production_urls(playwright_page):
    #plays = ['Hamlet', 'Macbeth', 'King Lear', 'Othello',
            #'Romeo and Juliet', 'The Tempest', 'Antony and Cleopatra']

    plays_patterns = re.compile(r'Macbeth|Othello|Romeo\s(and|\&)\sJuliet|Hamlet|King\sLear|'
                                r'The\sTempest|Antony\s(and|\&)\sCleopatra|Richard\sIII|Julius\sCaesar')


    #soup = BeautifulSoup(requests.get(main_url).text, 'html5lib')
    html = requests.get(playwright_page).text
    soup = BeautifulSoup(html, 'html5lib')

    #productions = soup.findAll('div', {'class': 'iobdb-frame'})[1].find('table').findAll('tr')
    productions = soup.find('table', {'class': 'venu-listing1'}).findAll('tr')

    for each_production in productions:
        show_meta_data = each_production.findAll('td')
        if show_meta_data:
            title = show_meta_data[0].find('a').get_text()
            link = show_meta_data[0].find('a').get('href')
            dates = show_meta_data[1].get_text().strip()
            if re.search(plays_patterns, title):
                print(title, link, dates)
                url_file = open('data/urls/broadway_production_urls.tsv', 'a')
                meta = '\t'.join((title, link, dates)).encode('utf8')
                url_file.write(meta + '\n')
                url_file.close()


            '''
            #second column is play name + link to production
            production_info = each_production.findAll('td')
            title = production_info[1].get_text().strip()
            #print(title)

            if title in plays:
                url_file = open('data/urls/broadway_production_urls.tsv', 'a')
                theatre = production_info[2].get_text().strip()
                opening = production_info[3].get_text().strip()
                link = production_info[1].find('a').get('href')
                all_info = '\t'.join((theatre, opening, link)).encode('utf8')
                url_file.write(all_info + '\n')
                url_file.close()

            '''

get_production_urls(main_url)
