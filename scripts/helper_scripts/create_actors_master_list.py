import unicodecsv

files = ['data/theatricalia_performers.tsv', 'data/temp_to_clean.tsv', 'data/off_performers.tsv']

actors_master = []


for actor_file in files:
    actors = open(actor_file)
    reader = unicodecsv.reader(actors, delimiter='\t')
    #print(reader)
    for each_actor_role in reader:
        print each_actor_role
        if each_actor_role[2] not in actors_master:
            actors_master.append(each_actor_role[2])


print actors_master
print(len(actors_master))
