# -*- coding: utf-8 -*-

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import csv
import codecs

url_base = 'https://en.wikipedia.org/wiki/'

def get_actor_info(actor_meta):
    #data_file = open('data/uk_productions/uk-performers-with-bday.tsv', 'a')

    actor_info = '\t'.join(actor_meta[:3])

    if len(actor_meta) > 1:
        actor_name = actor_meta[2]
        full_wiki_url = url_base + '_'.join(actor_name.split(' '))
        html = requests.get(full_wiki_url).text
        soup = BeautifulSoup(html, 'html5lib')
        person_not_found = soup.find('div', {'div': 'noarticletext'})
        if not person_not_found:
            birth_date = re.search(r'(\d+\s\w+\s\d\d\d\d|\w+\s\d+\,\s\d\d\d\d)', soup.get_text())

            if birth_date:
                #print(actor_name, birth_date.group(0))
                actor_info = birth_date.group(0) + '\t' + actor_info
            else:
                actor_info = 'no birthday on article' + '\t' + actor_info
        else:
            actor_info = 'person not found on wiki' + '\t' + actor_info

        #data_file.write(actor_info + '\n')
        print(actor_info)

#write logic so don't rescrape data already found


with open('data/uk_productions/uk-performers.tsv') as actors:
    actors = csv.reader(actors, delimiter='\t')
    #for actor in actors:
        #get_actor_info(actor)
    p = Pool(10)
    records = p.map(get_actor_info, actors)
    p.terminate()
    p.join()
