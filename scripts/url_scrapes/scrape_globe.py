import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

plays_patterns = re.compile(r'Macbeth|Othello|Romeo\sand\sJuliet|Hamlet|King\sLear|The\sTempest')

#scrape the paginated pages of links
pages = []
pages_range = range(1,21)
#number = 1
url_a = 'http://www.shakespearesglobe.com/discovery-space/previous-productions?p='
url_b = '&f%5Bsearch%5D=I%27m+looking+for...&f%5Bperiod_id%5D=&f%5Bplaywright%5D=William+Shakespeare&f%5Bid%5D=&f%5Byear%5D=&f%5Bdirector%5D='
for page_num in pages_range:
    url = url_a + str(page_num) + url_b
    pages.append(url)


#for each paginated page, grab urls of plays we care about
def get_urls(page):
    html = requests.get(pages[page]).text
    soup = BeautifulSoup(html, 'html5lib')
    #print(soup)
    productions = soup.find('article', {'id': 'mainArticle'}).findAll('div', {'class': 'day'})
    print(productions)

    for production in productions:
        play = production.find('h3', {'class': 'productionTitle'}).get_text()
        title_match = plays_patterns.match(play)
        if title_match:
            print title_match.group(0)
            print re.search(r'\d{4}', play).group(0)
            link = production.find('a').get('href')
            print(link)
    #return


get_urls(1)
