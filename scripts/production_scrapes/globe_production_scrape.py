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

base_url = 'http://www.shakespearesglobe.com'


'''
Deal with international, and non-standard productions:
Part of ... Globe to Globe festival
Performed in Hip Hop by the Q Brothers, Chicago Shakespeare Theatre & Richard Jordan Productions, from Chicago, USA.
'''

def get_production_info(meta):
    production_roles = []
    url = meta[3]
    html = requests.get(base_url + url).text
    soup = BeautifulSoup(html, 'html5lib')

    prod_info = soup.find('article', {'id': 'production'}).get_text()
    #director = re.search(r'Directed by\:\s([^\n]+)', prod_info).group(1)
    #director = re.search(r'Directed by\:\s(.+\s)(?=(\n|Adapted by:|Translated by:))', prod_info).group(0)

    special_performances_flag = re.search(r'Performed in ([^(by)]+) by (.+)(?=,\sfrom)', prod_info)
    language_performed_in = special_performances_flag.group(1) if special_performances_flag else None
    production_company = special_performances_flag.group(2) if special_performances_flag else 'Shakespeare\'s Globe'

    cast = soup.find('ul', {'class': 'cast'}).findAll('li')#, string=role_patterns)
    # Loop through all actors/roles for a particular production
    for each_role in cast:
        if role_patterns.search(each_role.get_text()):
            actor_role_pair = each_role.get_text().strip().split('\n')
            production_roles.append(actor_role_pair)

    #print(production_roles)

    # Loop through all actor/role pairs in EVERY production
    # TSV columns: Date Role Actor Director Production_Company Theatre Language_Flag
    for each_actor in production_roles:
        tsv_row_list = [meta[1], each_actor[0], each_actor[1], meta[2],
                        production_company, 'Shakespeare\'s Globe', language_performed_in]
        print(tsv_row_list)


# test url for one production
#test_meta_info = ['The Tempest', '2012', '/discovery-space/previous-productions/othello-1']

#get_production_info(test_meta_info)


with open('data/urls/globe_urls.tsv') as productions:
    productions = unicodecsv.reader(productions, delimiter='\t')
    #for actor in actors:
        #get_actor_info(actor)
    p = Pool(10)
    records = p.map(get_production_info, productions)
    p.terminate()
    p.join()
