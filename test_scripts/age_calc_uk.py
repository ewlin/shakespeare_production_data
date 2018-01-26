import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import unicodecsv
import re
from datetime import datetime

#remove letters from dates with suffixes
def format_date(date):
    #'24th March 1989'
    date = date.split(' ')
    day = re.search(r'\d+', date[0]).group(0)
    return day + ' ' + date[1] + ' ' + date[2]


def normalize_date(date):
    for format in ('%d %B %Y', '%B %d, %Y', '%Y'):
        try:
            return datetime.strptime(date, format)
        except ValueError:
            pass
    return 'Not a proper date/wrongly formatted dates'


with open('data/uk_productions/uk-performers-with-bday-better.tsv') as actors:
    data_file = open('data/uk_productions/uk-performers-with-age.tsv', 'a')

    actors = unicodecsv.reader(actors, delimiter='\t')
    actors = list(actors)

    #sort by role
    actors = sorted(actors, key=lambda actor: actor[2])
    for each_actor in actors:
        #'no birthday on article'
        #'unknown opening'
        if each_actor[0] != 'no birthday on article' and each_actor[1] != 'unknown opening':
            opening = normalize_date(format_date(each_actor[1]))
            bday = normalize_date(each_actor[0])
            if (bday != 'Not a proper date/wrongly formatted dates'):
                age = (opening - bday).days/365
            else:
                age = None
            data_file.write(('\t'.join(each_actor) + '\t' + str(age) + '\n').encode('utf-8'))
            print('\t'.join(each_actor) + '\t' + str(age))
        else:
            data_file.write(('\t'.join(each_actor) + '\t' + 'unknown age' + '\n').encode('utf-8'))
            print('\t'.join(each_actor))

data_file.close()
