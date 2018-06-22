import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool, Manager
import re
import unicodecsv
from datetime import datetime
from operator import itemgetter

manager = Manager()

temp_arr = manager.list()
url_base = 'https://en.wikipedia.org/wiki/'

url_extension = 'X-Men_(film_series)'



html = requests.get(url_base + url_extension).text
soup = BeautifulSoup(html, 'html5lib')

films_table_1 = soup.find('span', id='Released_films').parent.find_next_sibling('table').findAll('tr')
films_table_2 = soup.find('span', id='Upcoming_films').parent.find_next_sibling('table').findAll('tr')

films = [list(row.children) for row in films_table_1 + films_table_2]

print(films)
#films = [list(row.children) for row in films_table.findAll('tr')]
#
for each_row in films:
  def not_equal_line_break (to_compare):
    return to_compare != u'\n'
  
  row = filter(not_equal_line_break, each_row)
  if len(row) > 1:
    date_or_year = row[1].find('span', class_='bday').get_text() if row[1].find('span', class_='bday') else row[1].get_text()
    print(row[0].get_text(), date_or_year)
    
    data_file = open('data/franchise_list.tsv', 'a')

    franchise_entry = 'Marvel' + '\t' + 'X-Men' + '\t' + row[0].get_text() + '\t' + date_or_year
    data_file.write(franchise_entry.encode('utf-8') + '\n')
    data_file.close()
