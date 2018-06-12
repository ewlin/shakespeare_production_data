import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool, Manager
import re
import unicodecsv
from datetime import datetime
from operator import itemgetter
import glob


actors = []

actors_old = glob.glob('data/ages/*.tsv')
actors_new = glob.glob('data/ages_updated/*.tsv')
all_role_files = actors_old + actors_new


#Write to file with approximations flag + Birthday Source (article link, wiki, etc. )

for each_role_file in all_role_files:
  list_of_roles = unicodecsv.reader(open(each_role_file), delimiter='\t')
  #print(list_of_roles)
  for each_role in list_of_roles:
    print(each_role)
    
    if not [actor for actor in actors if actor[0] == each_role[3]]:
      if (each_role[8] != 'flagged'):
        print(each_role[3], each_role[1])
        actors.append((each_role[3], each_role[0]))
      else:
        print(each_role[3], 'person not found on wiki')
        actors.append((each_role[3], 'person not found on wiki'))
    elif [actor for actor in actors if actor[0] == each_role[3]] and each_role[0] != 'no birthday on article' and each_role[0] != 'person not found on wiki':
      index = next(i for i,v in enumerate(actors) if v[0] == each_role[3])
      actors[index] = (each_role[3], each_role[0])
    

sorted_actors = sorted(actors, key=lambda actor: actor[0])
print(sorted_actors)

# Go through list of actors--wiki scrape; 
# If bday matches, skip 
# If bday doesn't match or no wiki, flag 

for each_actor in sorted_actors:
  data_file = open('data/master_actors_list.tsv', 'a')
  data_file.write((each_actor[0] + '\t' + each_actor[1]).encode('utf-8') + '\n')
  data_file.close()


