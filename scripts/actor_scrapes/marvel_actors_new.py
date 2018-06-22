# sample module code

def search_table(table, titles_to_search):
  #table is a BeautifulSoup reference to a searchable DOM node? 
  # e.g. : films_table = filmography_span.parent.find_next_sibling('table')
  #titles_to_search is a reference to a list of strings of titles 
  table_rows = table.findAll('tr')
  if table_rows and table_rows[0][1].get_text() == 'Title':
    print('search_table: found a filmography table')
    

if not person_not_found:
          #franchise_titles = [r'Game of Thrones', r'The Lord of the Rings', r'The Hobbit', r'James Bond', r'Star Wars', r'Star Trek', r'Marvel', r'X-Men', r'X2', r'Spider-Man', r'Harry Potter']

          filmography_span = soup.find('span', id='Film') or soup.find('span', id='Films')
          if filmography_span and filmography_span.parent.find_next_sibling().name == 'table':
            #print(actor_name, filmography_span.get_text())

            #something weird here with the code; grabbing other random tables? More specific in selections (id/class?)
            films_table = filmography_span.parent.find_next_sibling('table')
            #if next simbling NOT table, follow link? 
            #print(filmography_span.parent.find_next_sibling().name)
            if films_table:
              films = films_table.find('tbody').findAll('tr')
              #if actor_name == 'Andrew Garfield' or actor_name == 'Elizabeth Olsen':
              #    print(films)
              
              max_cols_len = len(filter(not_equal_line_break, films[0]))
              #print(max_cols_len)
              current_year = None
              
              #reduce redudant code; add marvel tv shows (Netflix + other)
              for film in films: 
                
                columns = filter(not_equal_line_break, list(film.children))
                
                current_year = re.search(r'[0-9]{4}', columns[0].get_text()) if re.search(r'[0-9]{4}', columns[0].get_text()) else current_year
                
                # Write some logic to deal with some columns that are shared across rows (same character or year for example)
                if len(columns) > 1 and len(columns) == max_cols_len:
                  if columns[1].find('a'):
                    film_title = columns[1].find('a').get_text()
                  else:
                    film_title = columns[1].get_text()
                elif len(columns) > 1 and len(columns) < max_cols_len:
                  #print('wrong number of cols')
                  #print(columns)
                  if not re.search(r'[0-9]{4}', columns[0].get_text()):
                    film_title = columns[0].get_text()
                  else: 
                    if columns[1].find('a'):
                      film_title = columns[1].find('a').get_text()
                    else:
                      film_title = columns[1].get_text()
                else: 
                  film_title = None
                
                
                if film_title:
                      for franchise in franchise_titles:
                        if film_title == franchise:
                          if len(columns) > 2:
                            franchise_character = columns[2].find('a').get_text() if columns[2].find('a') else columns[2].get_text()
                          else: 
                            franchise_character = ''
                        
                          franchise_info = [actor_name, film_title, current_year.group(0) if current_year else 'none', franchise_character]
                          marvel_data = open('data/marvel_data.tsv', 'a')
                          marvel_data.write('\t'.join(franchise_info).encode('utf-8') + '\n')
                          marvel_data.close()

                          print(actor_name, film_title, current_year.group(0) if current_year else None, franchise_character)
              
              #film_title = columns[1].get_text()
              #print(film_title)
                
          elif soup.find('span', id='Filmography'):
            filmography_span = soup.find('span', id='Filmography')
            #print(actor_name, filmography_span.get_text())
            if filmography_span.parent.find_next_sibling().name == 'div' and filmography_span.parent.find_next_sibling().find('a'):
              filmography_url = filmography_span.parent.find_next_sibling().find('a').get('href')
              if actor_name == 'Rosemary Harris':
                print('Rosemary Harris')
                print(filmography_url)
              #print(filmography_span.parent.find_next_sibling().find('a').get_text())
              #print(filmography_span.parent.find_next_sibling().find('a').get('href'))
              full_filmography_url = url_base + filmography_url
              html = requests.get(full_filmography_url).text
              soup = BeautifulSoup(html, 'html5lib')
              
              filmography_span = soup.find('span', id='Film') or soup.find('span', id='Films')
              if filmography_span and filmography_span.parent.find_next_sibling().name == 'table':
                #print(actor_name, filmography_span.get_text())
    
                #something weird here with the code; grabbing other random tables? More specific in selections (id/class?)
                films_table = filmography_span.parent.find_next_sibling('table')
                #if next simbling NOT table, follow link? 
                #print(filmography_span.parent.find_next_sibling().name)
                if films_table:
                  films = films_table.find('tbody').findAll('tr')
                  #if actor_name == 'Andrew Garfield' or actor_name == 'Elizabeth Olsen':
                  #    print(films)
                  
                  max_cols_len = len(filter(not_equal_line_break, films[0]))
                  #print(max_cols_len)
                  current_year = None
                  
                  #reduce redudant code; add marvel tv shows (Netflix + other)
                  for film in films: 
                    
                    columns = filter(not_equal_line_break, list(film.children))
                    
                    current_year = re.search(r'[0-9]{4}', columns[0].get_text()) if re.search(r'[0-9]{4}', columns[0].get_text()) else current_year
                    
                    # Write some logic to deal with some columns that are shared across rows (same character or year for example)
                    if len(columns) > 1 and len(columns) == max_cols_len:
                      if columns[1].find('a'):
                        film_title = columns[1].find('a').get_text()
                      else:
                        film_title = columns[1].get_text()
                    elif len(columns) > 1 and len(columns) < max_cols_len:
                      #print('wrong number of cols')
                      #print(columns)
                      if not re.search(r'[0-9]{4}', columns[0].get_text()):
                        film_title = columns[0].get_text()
                      else: 
                        if columns[1].find('a'):
                          film_title = columns[1].find('a').get_text()
                        else:
                          film_title = columns[1].get_text()
                    else: 
                      film_title = None
                    
                    
                    if film_title:
                      for franchise in franchise_titles:
                        if film_title == franchise:
                          if len(columns) > 2:
                            franchise_character = columns[2].find('a').get_text() if columns[2].find('a') else columns[2].get_text()
                          else: 
                            franchise_character = ''
                          franchise_info = [actor_name, film_title, current_year.group(0) if current_year else 'none', franchise_character]
                          marvel_data = open('data/marvel_data.tsv', 'a')
                          marvel_data.write('\t'.join(franchise_info).encode('utf-8') + '\n')
                          marvel_data.close()
                          print(actor_name, film_title, current_year.group(0) if current_year else None, franchise_character)
              
              
            
          else: 
            #match the entire page? 
            #go through the whole page and match for film title 
            print(actor_name, 'Need to Manually Search For Films/Odd Wiki Format')
            for franchise in franchise_titles:
              franchise_re = re.compile(r'\s%s\s' % franchise)
              if re.search(franchise_re, soup.get_text()):
                franchise_info = [actor_name, re.search(franchise_re, soup.get_text()).group(0)]
                marvel_data = open('data/marvel_data.tsv', 'a')
                marvel_data.write('\t'.join(franchise_info).encode('utf-8') + '\n')
                marvel_data.close()
                print(actor_name, re.search(franchise_re, soup.get_text()).group(0))
            