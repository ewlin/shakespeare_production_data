import requests
import html5lib
from bs4 import BeautifulSoup
import re

productions_page = 'http://stf-theatre.org.uk/past-productions/'

def grab_production_urls(url):
    plays_patterns = re.compile(r'As You Like It|Merchant of Venice')

    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html5lib')

    container = soup.find('div', {'class':'blog_holder'})
    productions = container.findAll('article')

    for each_production in productions:
        title = each_production.find('h5').get_text()
        link = each_production.find('a').get('href')
        if re.search(plays_patterns, title):
            print('\t'.join((title, link)))



grab_production_urls(productions_page)
