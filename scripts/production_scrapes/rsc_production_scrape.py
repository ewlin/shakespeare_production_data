import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import unicodecsv

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'Lear',
         'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool',
         'Prospero', 'Ariel', 'Miranda']

role_patterns = re.compile(r'Miranda|Macbeth|Othello|Iago|Romeo|Hamlet|Lear|Juliet|Lady Macbeth|Desdemona|Ophelia|Fool|Prospero|Ariel')

test_url = 'http://collections.shakespeare.org.uk/search/rsc-performances/ham198103-hamlet/view_as/list/search/everywhere:hamlet/page/7'

html = requests.get(test_url).text
soup = BeautifulSoup(html, 'html5lib')

credits = soup.find('div', {'class': 'single-details-content'}).find('ul', {'class': 'columns'})

if credits:
    print('found')
    columns = credits.findAll('li', recursive=False)
    for each_col in columns:
        col_heading = each_col.find('h3').get_text()
        if col_heading == 'Cast':
            cast = each_col.find('ul').findAll('li')
            for each_role in cast:
                if re.search(role_patterns, each_role.find('p').get_text()):
                    print each_role