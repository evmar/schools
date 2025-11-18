all: geos.tsv

schools.tsv: school-list.py
	./school-list.py

geos.tsv: geolocate.py schools.tsv
	./geolocate.py
