#!/usr/bin/env python3

import csv
from collections import namedtuple

School = namedtuple('School', ['id', 'name', 'district', 'lat', 'long'])

schools = {}
with open('data/english.tsv') as f:
    r = csv.DictReader(f, delimiter='\t')
    for row in r:
        id = int(row['School ID'])
        name = row['School']
        district = row['District']
        schools[id] = School(id, name, district, lat = '', long='')

with open('schools.tsv', 'w') as f:
    w = csv.writer(f, delimiter='\t')
    w.writerow(School._fields)
    for _, v in sorted(schools.items()):
        w.writerow(v)
