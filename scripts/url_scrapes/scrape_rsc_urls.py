# Todo finish supporting all Plays we're interested in grabbing data from

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

plays_patterns = re.compile(r'Macbeth|Othello|Romeo\s(and|\&)\sJuliet|Hamlet|King\sLear|The\sTempest')

hamlet_urls = 'http://collections.shakespeare.org.uk/search/rsc-performances/view_as/list/search/everywhere:hamlet/page/7'

def get_urls(urls_list):
    html = requests.get(urls_list).text
    soup = BeautifulSoup(html, 'html5lib')
    production_urls = soup.find('ul', {'class': 'list-performances'}).findAll('li')
    for url in production_urls:
        title = url.find('a', {'class': 'title'})
        title_text = title.get_text()
        if (re.search(plays_patterns, title_text)):
            print title_text + " " + title.get('href')

get_urls(hamlet_urls)
