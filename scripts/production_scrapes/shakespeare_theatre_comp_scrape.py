import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import unicodecsv
from datetime import datetime

months_second_half = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

role_patterns = re.compile(r'Miranda|Macbeth|Othello|Antony|Cleopatra|'
                           r'Iago|Romeo|Hamlet|Lear|Juliet|Lady Macbeth|'
                           r'Desdemona|Ophelia|Fool|Prospero|Ariel')

test_url = ['Antony and Cleopatra', 'http://www.shakespearetheatre.org/performance-id/3603', '07-08', 'normal']
# play url season flag

def get_production_info(meta):
    production_roles = []

    url = meta[1]
    season = meta[2].split('-')
    flag = meta[3]

    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html5lib')

    production_info = soup.find('div', {'class': 'performance-info'})

    dates = production_info.find('h3', {'class': 'show-date'}).get_text()
    opening_date = re.search(r'[A-Za-z]+\s\d+', dates).group(0)
    opening_date_month = opening_date.split(' ')[0]
    year = season[1] if opening_date_month in months_second_half else season[0]
    full_opening_date = opening_date + ', ' + ('19' + year if int(year) > 50 else '20' + year)

    director = re.search(r'[D|d]irected by (.+)', production_info.get_text()).group(1).strip()

    venue_find = production_info.find('strong', {'class': 'show-venue'})
    venue = venue_find.get_text() if venue_find else 'Sidney Harman Hall'

    if flag == 'normal':
        cast_list = soup.find('div', {'id': 'accordion-1-c1'}).findAll('p')

        for each_cast_member in cast_list:
            role_and_name = each_cast_member.get_text().strip()
            if role_and_name != '':
                role_arr = role_and_name.split('\n')
                if len(role_arr) > 1:
                    if role_patterns.search(role_arr[1]):
                        production_roles.append((role_arr[1], role_arr[0].strip('*')))

        #2010-06-25	Ariel	Julyana Soelistyo	Des McAnuff	Stratford Festival	Festival Theatre (Canada)

    for each_actor in production_roles:
        actor_meta = [full_opening_date, each_actor[0], each_actor[1],
                      director, 'Shakespeare Theatre Company', venue]
        print actor_meta

#get_production_info(test_url)


with open('data/urls/stc_urls.tsv') as productions:
    productions = unicodecsv.reader(productions, delimiter='\t')
    p = Pool(10)
    records = p.map(get_production_info, productions)
    p.terminate()
    p.join()
