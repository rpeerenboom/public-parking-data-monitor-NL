#!/bin/bash

source ve/bin/activate
cd frontend
python3 ../django-server/openParking/manage.py runserver & npm start
