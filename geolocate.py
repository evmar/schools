#!/usr/bin/env python3

import csv
from collections import namedtuple
import os
from urllib import request
from urllib.parse import urlencode
import json

API_KEY = os.getenv('GOOGLE_API_KEY')

School = namedtuple('School', ['id', 'name', 'district', 'lat', 'long'])

def is_in_oregon(r):
    for addr in r['address_components']:
        if addr['long_name'] == 'Oregon':
            return True
    return False

def geolocate(s: School):
    params = {
        'key': API_KEY,
        'address': f'{s.name}, {s.district}, oregon',
    }
    url = 'https://maps.googleapis.com/maps/api/geocode/json?' + urlencode(params)
    with request.urlopen(url) as r:
        text = r.read().decode('utf-8')
        j = json.loads(text)
        r = j['results']
        r = list(filter(is_in_oregon, r))
        if len(r) != 1:
            print(json.dumps(r, indent=2))
            raise Exception('multiple results')
        r = r[0]
        loc = r['geometry']['location']
        return (loc['lat'], loc['lng'])

schools = []
with open('schools.tsv') as f:
    r = csv.DictReader(f, delimiter='\t')
    for row in r:
        row['id'] = int(row['id'])
        s = School(**row)
        schools.append(s)

attempts = 0
for i in range(len(schools)):
    if attempts == 1:
        break
    s = schools[i]
    if s.lat:
        print('done', s)
        continue
    attempts += 1
    try:
        loc = geolocate(s)
    except Exception as e:
        print('ERROR:', s, e)
        continue
    schools[i] = s._replace(lat = loc[0], long = loc[1])
    print(s, loc)

with open('schools2.tsv', 'w') as f:
    w = csv.writer(f, delimiter='\t')
    w.writerow(School._fields)
    for s in schools:
        w.writerow(s)
