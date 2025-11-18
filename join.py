#!/usr/bin/env python3

import csv
import dataclasses
import json

@dataclasses.dataclass
class School:
    id: int
    name: str
    lat: float
    long: float
    subjects: dict

schools = {}
for subject in ['english', 'math']:
    with open(f'data/{subject}.tsv') as f:
        r = csv.DictReader(f, delimiter='\t')
        for row in r:
            id = int(row['School ID'])
            if id in schools:
                s = schools[id]
            else:
                s = School(id=id, name=row['School'], lat=None, long=None, subjects={})
                schools[id] = s
            score = row['% Proficient  2023-24']
            if score in ['*', '--']:
                score = 0
            elif score == '< 5.0%':
                score = 5
            elif score == '> 95.0%':
                score = 95
            else:
                score = float(score)
            s.subjects[subject] = score

with open('schools.tsv') as f:
    r = csv.DictReader(f, delimiter='\t')
    for row in r:
        id = int(row['id'])
        lat, long = row['lat'], row['long']
        if not lat:
            continue
        schools[id].lat = float(lat)
        schools[id].long = float(long)

js = []
for _, s in sorted(schools.items()):
    js.append(dataclasses.asdict(s))
with open('all.json', 'w') as f:
    json.dump(js, f, indent=2)
