import unicodecsv

wiki_no_bday = 0
no_wiki = 0
found = 0

with open('data/ages/lear_ages.tsv') as lear_actors:
    lear_actors = unicodecsv.reader(lear_actors, delimiter='\t')
    for each_line in lear_actors:
        if each_line[0] == 'no birthday on article':
            wiki_no_bday += 1
        elif each_line[0] == 'person not found on wiki':
            no_wiki += 1
        else:
            found += 1

    print(found, wiki_no_bday, no_wiki)
