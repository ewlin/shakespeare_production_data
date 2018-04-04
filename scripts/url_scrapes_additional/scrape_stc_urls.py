# scrape Shakespeare Theatre Company productions

import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

plays_patterns = re.compile(r'As You Like It|Merchant of Venice')

landing_url = 'http://www.shakespearetheatre.org/about/history-and-awards/past-production/'

html = requests.get(landing_url).text
soup = BeautifulSoup(html, 'html5lib')

productions_on_page = soup.find('div', {'id': 'tickets_select'}).findAll('div', {'class': 'eBox'})

productions_recorded = []

for each_production in productions_on_page:
    flagged = 'normal'
    # find the season the production took place in
    class_list = each_production.get('class')
    for each_class in class_list:
        match_season = re.search(r'\d{2}\-\d{2}', each_class)
        if match_season:
            season = match_season.group(0)
            print(season)
        # check for special production page formatting in newer productions to manually scrape
        if flagged == 'normal':
            flagged_production = re.search(r'Harman|lansburgh', each_class)
            if flagged_production:
                flagged = 'flagged'
        print(flagged)
    # match for play title + grab url for production
    title = each_production.find('h4').get_text()
    print(title)
    if plays_patterns.search(title):
        file_to_write_to = open('data/urls/additional_characters_urls/stc.tsv', 'a')
        link = each_production.find('a').get('href')
        production_meta = [title, link, season, flagged]
        file_to_write_to.write('\t'.join(production_meta) + '\n')
        file_to_write_to.close()
