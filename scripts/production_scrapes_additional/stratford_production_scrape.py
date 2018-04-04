import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re
import unicodecsv


role_patterns = re.compile(r'Rosalind|Portia|Shylock|Jaques|Orlando|Bassanio')


test_url = 'http://internetshakespeare.uvic.ca/Theater/production/stage/3264/' #Macbeth

def scrape_production(url):
    #url = url[0]
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html5lib')
    meta_data = soup.find('div', {'class': 'standard_field_list'})
    tables = soup.findAll('table', {'class': 'listings'})

    cast_table = tables[0].findAll('tr')
    crew_table = tables[1].findAll('tr')

    '''
    # get relevant meta_data
    for each_field in meta_data:
        field_name = each_field.find('th').get_text()
        if field_name == 'Start Date':
            date = each_field.find('td').get_text()
            #print date
        elif field_name == 'Theaters':
            print(each_field.find('td').get_text())

    # get director name
    for each_crew in crew_table:
        crew_role = each_crew.find('th').get_text()
        if crew_role == 'Director':
            print(each_crew.find('td').get_text())
    '''

    # write a short function to reduce repetition above in searching
    # inputs: table to search, lambda
    # output: value
    def search_html_table(table, lambda_func):
        #table is a list of <tr> returned by BS's findAll('tr')
        for each_field in table:
            #each_field is a <tr>
            field_key = each_field.find('th').get_text()
            if lambda_func(field_key):
                return each_field.find('td').get_text()

    director = search_html_table(crew_table, lambda x: x == 'Director')
    theater = search_html_table(meta_data.findAll('tr'), lambda x: x == 'Theaters')
    date = search_html_table(meta_data.findAll('tr'), lambda x: x == 'Start Date')

    # grab actors and roles that match
    for each_actor in cast_table:
        role_field = each_actor.find('th')
        role = role_field.get_text()
        if role_patterns.search(role):
            #production_roles.append((role, each_actor.find('td').get_text()))
            tsv_row_list = [date, role, each_actor.find('td').get_text(), director, 'Stratford Festival', theater]
            print(tsv_row_list)
            data_file = open('data/additional_characters/additional_characters.tsv', 'a')
            data_file.write('\t'.join(tsv_row_list).encode('utf8') + '\n')
            data_file.close()

show_urls = open('data/urls/additional_characters_urls/stratford.tsv').read().split()
p = Pool(10)
records = p.map(scrape_production, show_urls)
p.terminate()
p.join()
