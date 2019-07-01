#!/bin/bash 

#change directory

echo "cd /var/www/open-parking/data-processing/"
cd /var/www/open-parking/data-processing/

#set virtual environment
echo "source /var/www/open-parking/ve/bin/activate"
source /var/www/open-parking/ve/bin/activate

#get and create the latest index file..
echo "/usr/bin/php /home/theo/open-parking/data-processing/getIndex.php > /home/theo/open-parking/data-processing/index_latest.json";
/usr/bin/php /home/theo/open-parking/data-processing/getIndex.php > /home/theo/open-parking/data-processing/index_latest.json

# Create the required cache files and folders
echo "mkdir -p cache-dir"
mkdir -p cache-dir

#backup old cache-dir
echo "tar -cvzf cache.tgz cache-dir/"
tar -cvzf cache.tgz cache-dir/

#remove old data
echo "rm -f cache_list.json"
rm -f cache_list.json
echo "rm -f cache-dir/*"
rm -f cache-dir/*

# Download all the static data in the cache directory
echo "python3 cache.py /var/www/open-parking/data-processing/cache-dir/ /var/www/open-parking/data-processing/cache_list.json /var/www/open-parking/data-processing/index_latest.json"
python3 cache.py /var/www/open-parking/data-processing/cache-dir/ /var/www/open-parking/data-processing/cache_list.json /var/www/open-parking/data-processing/index_latest.json

# Compute the location of each facility, whenever possible
echo "python3 find_location.py -d /var/www/open-parking/data-processing/cache-dir/ -f false"
python3 find_location.py -d /var/www/open-parking/data-processing/cache-dir/ -f false

# Create the JSON fixture for the database
echo "python3 create_fixture.py /var/www/open-parking/data-processing/cache-dir/ /var/www/open-parking/django-server/openParking/api/fixtures/fixture.json"
python3 create_fixture_matthijs.py /var/www/open-parking/data-processing/cache-dir/ /var/www/open-parking/django-server/openParking/api/fixtures/fixture.json

echo "cd /var/www/open-parking/django-server/openParking"
cd /var/www/open-parking/django-server/openParking

echo "python3 manage.py migrate"
python3 manage.py migrate
echo "python3 manage.py flush --noinput"
python3 manage.py flush --noinput
echo "python3 manage.py loaddata fixture";
python3 manage.py loaddata fixture
