'''The goal of this file is to seperate a list of actor/role listings into those that are clear matches
roles we're looking for, and those that are potential matches, in case of differing listings in different
production info/data. For example, some databases list King Lear as "King Lear of Britain" or just "Lear".
Another example is "Ariel" listed as "Ariel, a spirit"'''

import glob
import re
import unicodecsv

actors = glob.glob('data/temp/*.tsv')


roles = {
    'Othello': ['Othello'],
    'Iago': ['Iago'],
    'Desdemona': ['Desdemona'],
    'Macbeth': ['Macbeth'],
    'Lady Macbeth': ['Lady Macbeth'],
    'Romeo': ['Romeo'],
    'Juliet': ['Juliet'],
    'Hamlet': ['Hamlet'],
    'Ophelia': ['Ophelia'],
    'Lear': ['King Lear of Britain', 'Lear', 'King Lear'],
    'Fool': ['Fool', 'Lear\'s Fool'],
    'Antony': ['Mark Antony', 'Antony'],
    'Cleopatra': ['Cleopatra'],
    'Ariel': ['Ariel'],
    'Miranda': ['Miranda'],
    'Prospero': ['Prospero'],
    'Richard III': ['Richard III'],
    'Julius Caesar': ['Julius Caesar']
    'Marcus Brutus': ['Marcus Brutus']
}
# glob all the files in temp
# check if the role matches these exactly. If not, throw them into a temp file to clean manually

actors_meta = [(x, ' '.join(re.search(r'data\/temp\/(.+)\.tsv', x).group(1).split('_'))) for x in actors]
print(actors_meta)

temp_to_clean = []


for each_actors_list in actors_meta:
    role_file = open(each_actors_list[0])
    role = each_actors_list[1]
    role_formatted_for_file = '_'.join(role.split(' '))
    reader = unicodecsv.reader(role_file, delimiter='\t')
    for actor in reader:
        final_file = open('data/cleaned_roles/' + role_formatted_for_file + '.tsv', 'a')
        #file_to_clean = open('data/temp_to_clean.tsv', 'a')
        if actor[1] in roles[role]:
            final_file.write('\t'.join(actor).encode('utf8') + '\n')
        else:
            temp_to_clean.append(actor)

print(temp_to_clean)


sorted_by_role_to_clean = sorted(temp_to_clean, key=lambda char: char[1])
for each_role in sorted_by_role_to_clean:
    file_to_clean = open('data/temporary_files/temp_to_clean.tsv', 'a')
    file_to_clean.write('\t'.join(each_role).encode('utf8') + '\n')



'''
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
'''
