#!/bin/bash 
cd /var/www/open-parking/data-processing/
source /var/www/open-parking/ve/bin/activate
python3 create_fixture_matthijs.py /var/www/open-parking/data-processing/cache-dir/ /var/www/open-parking/django-server/openParking/api/fixtures/fixture.json
cd /var/www/open-parking/django-server/openParking
python3 manage.py migrate
python3 manage.py flush --noinput
python3 manage.py loaddata fixture
cd /var/www/open-parking/data-processing/
