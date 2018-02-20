#role cleaning script

import glob
import re
import unicodecsv
from datetime import datetime
import dateutil.parser

actors = glob.glob('data/*.tsv')
print actors

role_patterns = [r'Romeo', r'Juliet']
characters = {'Romeo': [], 'Juliet': []}

#remove letters from dates with suffixes
def format_date(date):
    #'24th March 1989'
    date = date.split(' ')
    day = re.search(r'\d+', date[0]).group(0)
    return day + ' ' + date[1] + ' ' + date[2]


def normalize_date(date):
    #16th April 1934
    '''Attempts to transform date in string into a date obj
    '''
    d = re.search(r'(\d+)[a-z]+\s([A-Za-z]+)\s(\d{4})', date)
    if d:
        date = d.group(1) + ' ' + d.group(2) + ' ' + d.group(3)
    for format in ('%d %B %Y', '%B %d, %Y', '%d.%m.%Y', '%m/%d/%Y', '%Y'):
        try:
            return datetime.strptime(date, format)
        except ValueError:
            pass
    return 'Not a proper date/wrongly formatted dates'


def stringify_date(date_obj):
    try:
        #return datetime.strftime(date_obj, '%Y-%m-%d')
        #return '{:%m/%d/%Y}'.format(date_obj)
        return date_obj.isoformat()
    except ValueError:
        return 'pre-1900 date'

for each_pattern in role_patterns:
    for each_file in actors:
        with open(each_file) as productions:
            roles = unicodecsv.reader(productions, delimiter='\t')
            for each_role in roles:
                prod_date = normalize_date(each_role[0])
                role = each_role[1]
                actor = each_role[2]
                director = each_role[3]
                found = False
                if re.search(each_pattern, role):
                    for index, recorded_role in enumerate(characters[each_pattern]):
                        #test if actor/director pair is already in database
                        # better logic than this. lots of 'director unknown'. filter those out
                        if (actor == recorded_role[2] and
                            (prod_date - dateutil.parser.parse(recorded_role[0])).days <= 730):
                            if director == recorded_role[3]:
                                found = True
                                break
                            elif recorded_role[3] == 'director unknown':
                                found = True
                                form_date = stringify_date(prod_date)
                                characters[each_pattern][index] = [form_date] + each_role[1:len(each_role)]
                                #another if statement to check if exitent director in 'director unknown' but current IS not 'director unknown'
                                # then replace row
                    if not found:
                        form_date = stringify_date(prod_date)
                        print(form_date)
                        characters[each_pattern].append([form_date] + each_role[1:len(each_role)])

sorted_romeos = sorted(characters["Romeo"], key=lambda rom: rom[0])
print(sorted_romeos)

#for key, value in d.iteritems():
#sorted_ariels = sorted(ariels, key=lambda arl: arl[0])
#print(role_archive)


for each_romeo in sorted_romeos:
    romeo_file = open('data/temp/romeos.tsv', 'a')
    romeo_data = '\t'.join(each_romeo).encode('utf-8') + '\n'
    romeo_file.write(romeo_data)
    romeo_file.close()
