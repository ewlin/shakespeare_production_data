# scrape Shakespeare Theatre Company productions

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

plays_patterns = re.compile(r'Macbeth|Othello|Romeo\s(and|\&)\sJuliet|Hamlet|King\sLear|The\sTempest')

landing_url = 'http://www.shakespearetheatre.org/about/history-and-awards/past-production/'

html = requests.get(landing_url).text
soup = BeautifulSoup(html, 'html5lib')

productions_on_page = soup.find('div', {'id': 'tickets_select'}).findAll('div', {'class': 'eBox'})

for each_production in productions_on_page:
    class_list = each_production.get('class')
