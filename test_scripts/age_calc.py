import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import csv
import re
from datetime import datetime

def calc_age(row):
    link = 'https://www.ibdb.com' + BeautifulSoup(row[0]).find('a').get('href')
    opening_date = BeautifulSoup(row[2]).get_text()
    performer_html = requests.get(link).text
    performer_meta = BeautifulSoup(performer_html, 'html5lib').find('div', {'class': 'headerline'}).get_text()
    #print(link + ' ' + opening_date)
    #birth = re.search(r'b\.\s[A-Z][a-z]+\d+', performer_meta)
    birth = re.search(r'\w+\s\d+,\s\d+', performer_meta)
    #print(row[1] + birth)
    if birth:
        birth_date = birth.group(0)
    else:
        birth_date = 'Not found'
    #print(row[1] + ' ' + BeautifulSoup(row[0]).find('a').get_text() + ' ' + birth_date + ' ' + opening_date)
    if birth_date != 'Not found':
        try:
            age = (datetime.strptime(opening_date, '%b %d, %Y') - datetime.strptime(birth_date, '%b %d, %Y')).days/365
            #print(age)
        except ValueError:
            age = " "
            #print('Date formatting issue')
    else:
        age = " "
        #print(birth_date)
    info = ''.join(str(row[1]) + '\t' + BeautifulSoup(row[0]).find('a').get_text() + '\t' + str(birth_date) + '\t' + opening_date + '\t' + str(age))
    print(info)
    file = open('data/performers.tsv', 'a')
    file.write(info.encode('utf8') + '\n')
    file.close()


with open('listings.tsv') as actors:
    reader = csv.reader(actors, delimiter='\t')
    p = Pool(10)
    records = p.map(calc_age, reader)
    p.terminate()
    p.join()
