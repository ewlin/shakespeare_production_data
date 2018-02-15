import glob
import re
import unicodecsv
from datetime import datetime

actors = glob.glob('data/*.tsv')
print actors

ariels = []

#remove letters from dates with suffixes
def format_date(date):
    #'24th March 1989'
    date = date.split(' ')
    day = re.search(r'\d+', date[0]).group(0)
    return day + ' ' + date[1] + ' ' + date[2]


def normalize_date(date):
    for format in ('%d %B %Y', '%B %d, %Y', '%Y', '%m.%d.%Y'):
        try:
            return datetime.strptime(date, format)
        except ValueError:
            pass
    return 'Not a proper date/wrongly formatted dates'


def format_date(date):
    return


for each_file in actors:
    with open(each_file) as productions:
        roles = unicodecsv.reader(productions, delimiter='\t')
        for each_role in roles:
            role = each_role[1]
            actor = each_role[2]
            director = each_role[3]
            found = False
            if re.search(r'Ariel', role):
                for recorded_ariel in ariels:
                    if actor == recorded_ariel[2] and director == recorded_ariel[3]:
                        found = True
                        break
                if not found:
                    ariels.append(each_role)


print(ariels)

for each_ariel in ariels:
    ariel_file = open('data/temp/ariels.tsv', 'a')
    ariel_data = '\t'.join(each_ariel).encode('utf-8') + '\n'
    ariel_file.write(ariel_data)
    ariel_file.close()
