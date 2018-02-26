# -*- coding: utf-8 -*-

# rewrite to test for categories (if no birthday found, try Name then _(actor) )

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import unicodecsv


url_base = 'https://en.wikipedia.org/wiki/'

def get_actor_info(actor_meta):
    # write to a different file instead:
    # e.g., data_file = open('data/actors_meta/master_actors_list.tsv', 'a')

    data_file = open('data/ages/lear_ages.tsv', 'a')

    actor_info = '\t'.join(actor_meta)

    actor_gender = 'unknown'
    actor_ethnicity_cat = []
    actor_ethnicity = []


    if len(actor_meta) > 1:
        actor_name = actor_meta[2]
        full_wiki_url = url_base + '_'.join(actor_name.split(' '))
        html = requests.get(full_wiki_url).text
        soup = BeautifulSoup(html, 'html5lib')
        person_not_found = soup.find('table', {'id': 'noarticletext'})

        if not person_not_found:
            categories = soup.find('div', {'id': 'mw-normal-catlinks'}).find('ul').findAll('li')
            for each_category in categories:
                if re.search('disambiguation', each_category.get_text()):
                    new_url = url_base + '_'.join(actor_name.split(' ')) + '_(actor)'
                    print(new_url)
                    html = requests.get(new_url).text
                    soup = BeautifulSoup(html, 'html5lib')
                    person_not_found = soup.find('table', {'id': 'noarticletext'})
                    break

        #REDO logic here. Use a tuple of patterns and do a try/except(?) of matching different patterns
        if not person_not_found:
            # Fun times with categories
            for each_category in categories:
                category = each_category.get_text()
                if re.search(r'(Black|African-American)', category):
                    actor_ethnicity.append('Black')

                if re.search(r'(Hispanic|Latin(a|o))', category):
                    actor_ethnicity.append('Latino')

                if re.search(r'of\s(.+)\sdescent', category):
                    actor_ethnicity_cat.append(re.search(r'of\s(.+)\sdescent', category).group(1))

                if re.search(r'((A|a)ctress(es)*)|((F|f)emale)', category):
                    actor_gender = 'female'
                elif re.search(r'(M|m)ale', category):
                    actor_gender = 'male'


            #birth_date = re.search(r'(\d+\s\w+\s\d\d\d\d|\w+\s\d+\,\s\d\d\d\d)', soup.get_text())
            #better birthday search: looks for (born 12 October 1987) or (born January 23, 1980) or (born 1970)
            birth_date = re.search(r'\(born\s(\d+\s\w+\s\d{4}|\w+\s\d+\,\s\d{4}|\d{4})', soup.find('p').get_text())
            if birth_date:
                #print(actor_name, birth_date.group(0))
                actor_info = birth_date.group(1) + '\t' + actor_info
            else:
                birth_date = re.search(r'(\d+\s\w+\s\d{4}|\w+\s\d+\,\s\d{4})', soup.find('p').get_text())
                if birth_date:
                    actor_info = birth_date.group(0) + '\t' + actor_info
                else:
                    actor_info = 'no birthday on article' + '\t' + actor_info
        else:
            actor_info = 'person not found on wiki' + '\t' + actor_info

        data_file.write(actor_info.encode('utf-8') + '\n')
        print(actor_info + '\t' + actor_gender + '\t' + ','.join(actor_ethnicity) + '\t' + ','.join(actor_ethnicity_cat))


#write logic so don't rescrape data already found
#use wiki to scrape for gender (if first paragraph uses 'she' or 'her')
#scrape for ethnicity?

with open('data/temp/Lear.tsv') as actors:
    actors = unicodecsv.reader(actors, delimiter='\t')

    #for actor in actors:
        #get_actor_info(actor)
    p = Pool(10)
    records = p.map(get_actor_info, actors)
    p.terminate()
    p.join()
