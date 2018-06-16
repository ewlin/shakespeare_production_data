import unicodecsv
import requests
import html5lib
from bs4 import BeautifulSoup


actors_list = open('data/master_actors_list.tsv')
actors = unicodecsv.reader(actors_list, delimiter='\t')

for each_actor in actors: 
  #print(each_actor)
  if each_actor[0] == 'James McAvoy':
    print(each_actor[0])
    html = requests.get('https://en.wikipedia.org/wiki/James_Mcavoy').text
    print(html)