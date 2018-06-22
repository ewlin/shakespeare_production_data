# test script to see if I can write good regex to scrape the most well-known work of each actor

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

def get_actor_info(actor_meta):
    roles_found = False
    actor_name = actor_meta[2].strip('* ').title()
    full_wiki_url = url_base + '_'.join(actor_name.split(' '))
    html = requests.get(full_wiki_url).text
    soup = BeautifulSoup(html, 'html5lib')
    person_not_found = soup.find('table', {'id': 'noarticletext'})

    if not person_not_found:
        categories = soup.find('div', {'id': 'mw-normal-catlinks'}).find('ul').findAll('li')
        for each_category in categories:
            if re.search('disambiguation', each_category.get_text()):
                # Fix logic here; if hits disambiguation page, needs to overwrite/rewrite 'categories'

                new_url = url_base + '_'.join(actor_name.split(' ')) + '_(actor)'
                print(new_url)
                html = requests.get(new_url).text
                soup = BeautifulSoup(html, 'html5lib')
                person_not_found = soup.find('table', {'id': 'noarticletext'})
                break

    if not person_not_found:
        bio = soup.findAll('p')
        for each_paragraph in bio:
            para = each_paragraph.get_text()

            #print(para)
            # most well-known roles include
            # re.search(r'best remembered.*(?=for|as)(for|as)', 'best remembered in film for').group(0)
            for pattern in (r'known (for|as) (.+)', r'fame for (.+)', r'most famous for (.+)', r'came to wider public attention (.+)'):
                match = re.search(pattern, para)
                if match:
                    roles_found = True
                    #print(match.group(1))
                    roles_text = match.group(0)
                    if (re.search(r'as\s(.*) (?=in)(.*)', roles_text)):
                        print(actor_name + ': ' + re.search(r'(.*) (?=in)(.*)', roles_text).group(0))

            #for pattern in (r'([^.]+) (?=the Marvel Cinematic Universe)', r'([^.]+) (?=Marvel)'):
                #marvel = re.search(pattern, para)
                #if marvel:
                    #print(actor_name + ': ' + marvel.group(1))

    if roles_found:
        temp_arr.append(actor_name)
'''


def get_actor_info_test(actor_name):
    #actor_name = actor_meta[2].strip('* ').title()
    full_wiki_url = url_base + '_'.join(actor_name.split(' '))
    html = requests.get(full_wiki_url).text
    soup = BeautifulSoup(html, 'html5lib')
    person_not_found = soup.find('table', {'id': 'noarticletext'})

    if not person_not_found:
        categories = soup.find('div', {'id': 'mw-normal-catlinks'}).find('ul').findAll('li')
        for each_category in categories:
            if re.search('disambiguation', each_category.get_text()):
                # Fix logic here; if hits disambiguation page, needs to overwrite/rewrite 'categories'

                new_url = url_base + '_'.join(actor_name.split(' ')) + '_(actor)'
                print(new_url)
                html = requests.get(new_url).text
                soup = BeautifulSoup(html, 'html5lib')
                person_not_found = soup.find('table', {'id': 'noarticletext'})
                break

    if not person_not_found:
        bio = soup.findAll('p')
        for each_paragraph in bio:
            para = each_paragraph.get_text()
            #print(para)
            for pattern in (r'known for ([^\.]+)\.', r'most famous for ([^\.]+)\.'):
                match = re.search(pattern, para)
                if match:
                    print(match.group(1))
            famous_roles = re.search(r'(known for ([^\.]+)\.)|(most famous for ([^\.]+)\.)', para)

'''
#get_actor_info_test('Ian McDiarmid')



with open('data/cleaned_roles/Othello.tsv') as actors:
    actors = unicodecsv.reader(actors, delimiter='\t')

    # need to share state between processes for this to work
    # https://docs.python.org/3/library/multiprocessing.html#sharing-state-between-processes
    p = Pool(10)
    records = p.map(get_actor_info, actors)
    p.terminate()
    p.join()

    print(temp_arr)
    print(len(temp_arr))
