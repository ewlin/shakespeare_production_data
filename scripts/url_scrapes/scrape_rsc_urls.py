# Todo finish supporting all Plays we're interested in grabbing data from

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

plays_patterns = re.compile(r'Macbeth|Othello|Romeo\s(and|\&)\sJuliet|Hamlet|King\sLear|The\sTempest|Antony\s(and|\&)\sCleopatra')

urls = ['http://collections.shakespeare.org.uk/search/rsc-performances/view_as/list/search/play_title:hamlet/page/6',
        'http://collections.shakespeare.org.uk/search/rsc-performances/view_as/list/search/play_title:the-tempest/page/4',
        'http://collections.shakespeare.org.uk/search/rsc-performances/view_as/list/search/play_title:othello/page/3',
        'http://collections.shakespeare.org.uk/search/rsc-performances/view_as/list/search/play_title:macbeth/page/5',
        'http://collections.shakespeare.org.uk/search/rsc-performances/view_as/list/search/play_title:romeo-juliet/page/5',
        'http://collections.shakespeare.org.uk/search/rsc-performances/view_as/list/search/play_title:king-lear/page/4']


def get_urls(urls_list):
    html = requests.get(urls_list).text
    soup = BeautifulSoup(html, 'html5lib')
    production_urls = soup.find('ul', {'class': 'list-performances'}).findAll('li')
    for url in production_urls:
        tsv_file = open('data/urls/rsc_urls.tsv', 'a')

        title = url.find('a', {'class': 'title'})
        title_text = title.get_text()
        if (re.search(plays_patterns, title_text)):
            print title_text + ' ' + title.get('href')
            tsv_file.write(title_text + '\t' + title.get('href') + '\n')
            tsv_file.close()

p = Pool(5)
records = p.map(get_urls, urls)
p.terminate()
p.join()
