"""
Tries to find the location of facilities, based on the information available
in the index file and in the static data. It reads the cache directory and
output the updated data in the same directory, overwriting it.

Example:
    python find_location.py cache-dir/
"""

import json
from sys import argv
from os import listdir
from os.path import isfile, join
import requests
from time import time, sleep
from shapely.geometry import shape
import argparse
from decimal import Decimal


def get_value(object, keys):
    """Obtains a value down a hierarchy of objects, and return None on error."""
    try:
        for key in keys:
            object = object[key]
        return object
    except (KeyError, IndexError, TypeError):
        return None

def get_address_fields(facility, force):
    """Obtains the address of a facility from its geolocation, using the
    nominatim API (nominatim.openstreetmap.org).
    """
    country_code = None
    city = None
    province = None
    if ("geoLocation" in facility and facility["geoLocation"] is not None) or force == True:
        print(facility["identifier"])
        # Make sure not to make more than one request per second or so
        if get_address_fields.last_request is None:
            get_address_fields.last_request = time()
        delay_between_requests = 0.1
        now = time()
        time_to_wait = delay_between_requests - (now - get_address_fields.last_request)
        if time_to_wait > 0:
            sleep(time_to_wait)
        get_address_fields.last_request = now

        #request = "https://nominatim.openstreetmap.org/reverse?format=json&lat={}&lon={}".format(
        #        facility["geoLocation"]["latitude"], facility["geoLocation"]["longitude"])
        request = "http://nominatim.townsville.nl/reverse.php?format=json&lat={}&lon={}".format(
                facility["geoLocation"]["latitude"], facility["geoLocation"]["longitude"])
 
        print(request)
        result = requests.get(request)
        if result.status_code == requests.codes.ok:
            result = result.json()
            if "address" in result:
                country_code = result["address"]["country_code"]
                if "city" in result["address"]:
                    city = result["address"]["city"]
                elif "city" in result["address"]:
                    city = result["address"]["town"]
                elif "suburb" in result["address"]:
                    city = result["address"]["suburb"]
                province = result["address"]["state"]
        else:
            print("Openstreetmap Failed: ", result.statu_code)
            print("Output: ", result.text)

    return {
        "country_code": country_code,
        "city": city,
        "province": province
    }

get_address_fields.last_request = None

def coord_to_coord(object):
    """Cleans coordinate fields of an object. Sometimes it is a list with the
    coordinates as first element, sometimes the coordinates do not have decimal
    point in the right position. This fixes these problems.
    """
    if isinstance(object, list):
        object = object[0]
    if object is not None and ( abs(float(object["latitude"])) > 90.0 or abs(float(object["longitude"])) > 180.0):
        lat = str(object["latitude"])
        lat = float(lat[:2] + "." + lat[2:-2])
        lon = str(object["longitude"])
        lon = float(lon[:1] + "." + lon[1:-2])
        print("Invalid coordinates:", object)
        object["latitude"] = input("Correct latitude ? " + str(lat) + " ")
        object["longitude"] = input("Correct longitude ? " + str(lon) + " ")
        object["longitude"] = lon if object["longitude"] == "" else float(object["longitude"])
        object["latitude"] = lat if object["latitude"] == "" else float(object["latitude"])
    return object

def shape_to_coord(object):
    """Returns the centroid of a geometric shape, using shapely library."""
    try:
        geodata = shape(object).centroid
        if geodata.is_empty:
            return None
        else:
            return {"longitude": geodata.x, "latitude": geodata.y}
    except:
        return None

def address_to_coord(address):
    """Return the geolocation of an address, using the nominatim API
    (nominatim.openstreetmap.org).
    """
    # Use nominatim to translate from address to geolocation
    # Make sure not to make more than one request per second or so
    if address_to_coord.last_request is None:
        address_to_coord.last_request = time()
    delay_between_requests = 2
    now = time()
    time_to_wait = delay_between_requests - (now - address_to_coord.last_request)
    if time_to_wait > 0:
        sleep(time_to_wait)
    address_to_coord.last_request = now

    try:
        request = "https://nominatim.openstreetmap.org/search.php?limit=1&format=json" + \
            "&q={}, {}, {}".format(
            (address["houseNumber"] + " " + address["streetName"] if "houseNumber" in address else address["streetName"]),
            address["city"], address["country"])
    except KeyError as e:
        return None



    print("Requesting", request)
    result = requests.get(request)

    if result.status_code == requests.codes.ok:
        result = result.json()
        if len(result) > 0:
            return {"latitude": result[0]["lat"],
                    "longitude": result[0]["lon"]}
    return None

address_to_coord.last_request = None

parser = argparse.ArgumentParser(description = "Description for my parser")
parser.add_argument("-d", "--dir", help = "Directory to parse", required = True, default = "")
parser.add_argument("-f", "--force", help = "Force re-download of location data", required = False, default = False)

argument = parser.parse_args()
Force = False
status = False
directory = ""

if argument.dir:
    # print("You have used '-d' or '--dir' with argument: {0}".format(argument.dir))
    directory = argument.dir
    status = True
if argument.force:
    # print("You have used '-f' or '--force' with argument: {0}".format(argument.force))
    Force = argument.force
    status = True
if not status:
    print("Maybe you want to use -d or -f as arguments ?") 

print(Force)

# The list of fields in which we could find the position, along with the function
# to use to convert them to proper geocoordinates.
fields_to_try = [
    (["locationForDisplay"], coord_to_coord),
    (["accessPoints", 0, "accessPointLocation"], coord_to_coord),
    (["accessPoints", 0, "accessPointAddress"], address_to_coord),
    (["sellingPoints", 0, "sellingPointLocation"], coord_to_coord),
    (["specifications", 0, "areaGeometry"], shape_to_coord),
]

file_list = [join(directory, f) for f in listdir(directory) if isfile(join(directory, f))]

i = 0
for filename in file_list:
    try:
        facility  = json.load(open(filename))
    except json.decoder.JSONDecodeError as e:
        print(e)
        print(filename)

    # If the geolocation is not already given
    if ("geoLocation" not in facility) or Force:
        static_data = facility["staticData"]
        if static_data is None:
            continue

        facility["geoLocation"] = None
        # Try each field, and if it exists convert it to coordinates and break
        for field, convert_function in fields_to_try:
            value = get_value(static_data, field)
            if value is not None:
                facility["geoLocation"] = convert_function(value)
                break

        with open(filename, "w") as file:
            json.dump(facility, file, indent=2)

    # Add the address fields ("city", "province", ...) to the facility data
    if ("city" not in facility and facility["geoLocation"] is not None) or (Force and "province" in facility and facility["province"] is None):
        facility.update(get_address_fields(facility, Force))
        with open(filename, "w") as file:
            json.dump(facility, file, indent=2)
        print(i, "/", len(file_list))
    i += 1
