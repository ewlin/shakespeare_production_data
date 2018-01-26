'''The goal of this file is to seperate a list of actor/role listings into those that are clear matches
roles we're looking for, and those that are potential matches, in case of differing listings in different
production info/data. For example, some databases list King Lear as "King Lear of Britain" or just "Lear".
Another example is "Ariel" listed as "Ariel, a spirit"'''

import unicodecsv

roles = ['Macbeth', 'Othello', 'Iago', 'Romeo', 'Hamlet',
         'King Lear of Britain', 'King Lear', 'Lear', 'Juliet', 'Lady Macbeth',
         'Desdemona', 'Ophelia', 'Fool', 'Prospero', 'Ariel']

with open('data/theatricalia_productions.tsv') as actors:
    reader = unicodecsv.reader(actors, delimiter='\t')
    for actor in reader:
        file_to_clean = open('data/temp_to_clean.tsv', 'a')
        final_file = open('data/theatricalia_performers.tsv', 'a')

        if actor[1] not in roles:
            print(actor)
            file_to_clean.write('\t'.join(actor).encode('utf8') + '\n')
        else:
            final_file.write('\t'.join(actor).encode('utf8') + '\n')

    final_file.close()
    file_to_clean.close()
