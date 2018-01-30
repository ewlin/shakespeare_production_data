import requests
import html5lib
from bs4 import BeautifulSoup
from ratelimit import rate_limited
from multiprocessing import Pool

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet', 'King Lear of Britain', 'Lear', 'Juliet', 'Lady Macbeth', 'Desdemona', 'Ophelia', 'Fool']
test_url = 'https://www.ibdb.com/broadway-production/macbeth-494910'
show_urls = open('shows.csv').read().split()

print show_urls

def get_actors_info(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html5lib')
    tables = soup.findAll('table', {'class': 'cast'})
    date = soup.find('table', {'id': 'proddates'}).findAll('tr')[1].find('td', {'class': 'dates'})

    #print(dates)
    if len(tables) > 1:
        for row in tables[1].find_all('tr'):
            cols = row.find_all('td')
            if cols[0].find('a'):
                actor = cols[0].find('a')
                role = str(cols[1].contents[0]).splitlines()[1].strip()
                if role in roles:
                    info = ''.join(str(actor) + '\t' + role + '\t' + str(date))
                    print info
                    file = open('listings.tsv', 'a')
                    file.write(info + '\n')
                    file.close()
                    #return info


    #write to csv?


#for url in show_urls:
    #get_actors_info(url)

p = Pool(10)
records = p.map(get_actors_info, show_urls)
p.terminate()
p.join()
