"""
Create a JSON file suitable to be loaded into the Django SQL database, from
data in the cache folder. Some of the fields are calculated here, such as the
facility type or the region name.

Example:
    python create_fixture.py cache-dir/ ../django-server/openParking/api/fixtures/fixture.json

"""

import json
import time
from sys import argv
from os import listdir
from os.path import isfile, join
# from find_ocation import get_value

def get_value(object, keys):
    """Obtains a value down a hierarchy of objects, and return None on error."""
    try:
        for key in keys:
            object = object[key]
            if (str(object) == ""):
                return None
        return object
    except (KeyError, IndexError, TypeError):
        return None



def get_region_name(facility):
    """Return the region name of a facility, based on its province."""
    if "province" in facility and facility["province"] is not None:
        provinces = {
            ("Noord-Holland", "Utrecht", "Flevoland"): "Noordwest-Nederland",
            ("Zuid-Holland", "Zeeland"): "Zuidwest-Nederland",
            ("Noord-Brabant", "Limburg"): "Zuid-Nederland",
            ("Gelderland", "Overijssel"): "Oost-Nederland",
            ("Groningen", "Friesland", "Drenthe", "Fryslân"): "Noord-Nederland"
        }
        for province_list, region in provinces.items():
            if facility["province"] in province_list:
                return region
    #return None
    return "none"


def is_not_none(value, key, is_array=False):
    """Checks whether a value is contained in the object, and that it is not None."""
    return value is not None and key in value and value[key] is not None and (not is_array or len(value[key]) > 0)


usage_name_mapping= {
    "BETAALD PARKEREN":"onstreet",
    "BETAALDPARKEREN":"onstreet",
    "CARPOOL":"carpool",
    "CARPOOL PARKEREN":"carpool",
    "CARPOOL, GRATIS PARKEREN":"carpool",
    "CARPOOLPARKEREN":"carpool",
    "GARAGE PARKEREN":"garage",
    "GARAGEPARKEREN":"garage",
    "OPENBARE PARKEERGARAGE":"garage",
    "P EN R TERREINEN":"park and ride",
    "P+R LOCATIES":"park and ride",
    "P+R-TERREINEN":"park and ride",
    "PARK & RIDE":"park and ride",
    "TERREIN PARKEREN":"terrain",
    "TERREIN RU EN UMC":"terrain",
    "TERREINPARKEREN":"terrain"
}

old_usage_name_mapping = {
    "Parkeren": "onstreet",
    "Stadsbrede vergunningen": "onstreet",
    "Bezoekers Parkeren": "onstreet",
    "Carpoolparkeren": "carpool",
    "VergunningParkeren": "onstreet",
    "Vergunningen Sector": "onstreet",
    "Bewonersparkeervergunning": "onstreet",
    "Parkeeervergunning voor hotelgasten": "onstreet",
    "Verblijfsrechten Milieuzone": "onstreet",
    "Bezoekersvergunningen": "onstreet",
    "Betaald parkeren": "onstreet",
    "Verblijfsrechten ontheffings gebieden": "onstreet",
    "Ontheffingen inrij en parkeren KWG": "onstreet",
    "Vergunning parkeren overig": "onstreet",
    "Betaald parkeren ondernemers": "onstreet",
    "Carpool Parkeren": "carpool",
    "Terrein Parkeren": "terrain",
    "Zakelijke parkeervergunning": "onstreet",
    "Vergunningen Bewoners Betaald-parkeergebied": "onstreet",
    "Betaald Parkeren": "onstreet",
    "Terrein parkeren": "terrain",
    "Zakelijke parkeervergunning Marktkooplieden": "onstreet",
    "Bedrijfsvergunningen": "onstreet",
    "Bedrijfs Vergunningen": "onstreet",
    "Vergunningen Zakelijk": "onstreet",
    "Garage Parkeren": "garage",
    "Openbare Parkeergarages": "garage",
    "Bedrijf": "onstreet",
    "Parkeergarage": "garage",
    "P+R-terreinen": "park and ride",
    "Bewoners en Bedrijfsvergunningen": "onstreet",
    "Vergunning parkeren Graafjanstraat": "onstreet",
    "Te ontziene voertuigen": "onstreet",
    "Vergunningparkeren": "onstreet",
    "Vergunning parkeren centrum": "onstreet",
    "Vergunning Parkeren Centrum": "onstreet",
    "vergunning parkeren algemeen": "onstreet",
    "Algemene vergunningen": "onstreet",
    "Ontheffing betaalapparatuur plaatsen": "onstreet",
    "Bedrijfsvergunningen geldig van Ma t/mVr": "onstreet",
    "Vrij parkeren": "onstreet",
    "Garageparkeren": "garage",
    "Bewoners, bezoekers en bedrijfsvergunningen": "onstreet",
    "Carpool parkeren": "carpool",
    "Zorgparkeervergunning": "onstreet",
    "Zorg- of Tijdelijkevergunning gebiedsvrij": "onstreet",
    "Vergunningen Gemeente Parkeren": "onstreet",
    "Parkeerkaarten": "onstreet",
    "Allround alle gebieden vergunningparkeren": "onstreet",
    "Blauwe Zone": "onstreet",
    "Parkeerschijfgebied / Blauwe zone": "onstreet",
    "Blauwe zone / Parkeerschijfgebied": "onstreet",
    "Blauwe Zone max 90 min." : "onstreet",
    "Blauwe Zone max. 120 minuten parkeren" : "onstreet",
    "Blauwe zone": "onstreet",
    "Blauwe zone / Parkeerschijfzone" : "onstreet",
    "Gratis parkeren" : "onstreet",
    "Ontheffingen inrij en niet parkeren KWG": "onstreet",
    "Ontheffing betaald parkeren": "onstreet",
    "Garage parkeren": "garage",
    "Te signaleren voertuigen": "onstreet",
    "Marktvergunningen": "onstreet",
    "Blauwe zones": "onstreet",
    "Bewonersvergunningen": "onstreet",
    "BetaaldParkeren": "onstreet",
    "stadsbrede vergunningen": "onstreet",
    "Bewonersparkeren": "onstreet",
    "Vergunningen Lang Parkeren": "onstreet",
    "Electrisch opladen": "others",
    "Vergunningshoudersplaatsen": "onstreet",
    "Vergunning Parkeren": "onstreet",
    "CARPOOLPARKEREN": "carpool",
    "Carpool, gratis parkeren": "carpool",
    "Tereinparkeren": "terrain",
    "Bezoekersparkeren": "onstreet",
    "Centrum dagvergunningen": "onstreet",
    "Vergunningen Lang-Kort Betaald-parkeergebied": "onstreet",
    "Werknemersparkeervergunning": "onstreet",
    "Werknemersvergunning": "onstreet",
    "Werknemers": "onstreet",
    "P en R terreinen": "park and ride",
    "Ontheffingen beperkte inrij KWG": "onstreet",
    "Ontheffing": "onstreet",
    "Ontheffing parkeren": "onstreet",
    "Autodeler": "onstreet",
    "Terreinparkeren": "terrain",
    "Bewoners Vergunningen": "onstreet",
    "Bezoekersregeling": "onstreet",
    "Carpool": "carpool",
    "Hulpdienst": "onstreet",
    "Vergunning Parkeren Bewoners (en Bedrijven)": "onstreet",
    "Vergunning Parkeren Bedrijven": "onstreet",
    "Parkeervergunningen die in de hele stad geldig zijn": "onstreet",
    "Parkeervergunning voor hotelgasten": "onstreet",
    "Park & Ride": "park and ride",
    "P+R Locaties": "park and ride",
    "Medewerkersvergunningen" : "onstreet",
    "Abonnementen" : "onstreet",
    "Algemene vergunningen voor oa bewoners en zakelijk" : "onstreet",
    "Vergunningen Bezoekers" : "onstreet",
    "Vergunning Parkeren Bezoek Bewoners" : "onstreet",
    "Bezoekersvergunning" : "onstreet",
    "Vergunningen Bedrijven" : "onstreet",
    "Vergunningen bedrijven" : "onstreet",
    "Vergunningen bewoners" : "onstreet",
    "Vergunningen Bewoners" : "onstreet",
    "Vergunnningen Bewoners" : "onstreet",
    "Vergunningen bezoeker" : "onstreet",
    "Vergunningparkeren ALLES" : "onstreet",
    "Vergunning Parkeren Zakelijk" : "onstreet",
    "Terreinvergunningen" : "onstreet",
    "Vergunningen stadsbreed" : "onstreet",
    "5 daagse zakelijke vergunningen" : "onstreet",
    "Vergunningparkeren CRNO" : "onstreet",
    "Vergunningparkeren CRWO" : "onstreet",
    "Autoluw" : "onstreet",
    "Gratis parkeren, geadviseerd gemeentelijk parkeergebied" : "onstreet",
    "Vergunningparkeren NH12" : "onstreet",
    "Terrein RU en UMC" : "onstreet"
}

def get_usage(staticData):
    # Check the usage field
    if staticData is not None and is_not_none(staticData, "specifications", True):
        specs = staticData["specifications"][0]
        if is_not_none(specs, "usage"):
            try:
                return usage_name_mapping[specs["usage"].upper()]
            except:
                return "others"
    # Check the geometry
    if is_not_none(facility["staticData"], "specifications", True) \
       and facility["staticData"]["specifications"][0] is not None \
       and "areaGeometry" in facility["staticData"]["specifications"][0] \
       and "coordinates" in facility["staticData"]["specifications"][0]["areaGeometry"]:
        return "onstreet"

    #return None
    return "others"

def get_mark(facilityType, longitude, latitude, staticData):
    if facilityType == "onstreet":
        return "onstreet"
    else:
        numberFields = 0
        # Checks geolocation fields
        if longitude is not None and latitude is not None:
            numberFields += 1

        # Dive in static data
        if staticData is not None:
            for field in ("tariffs", "contactPersons", "openingTimes"):
                if is_not_none(staticData, field, True):
                    numberFields += 1
            if is_not_none(staticData, "specifications", True):
                specs = staticData["specifications"][0]
                for field in ("capacity", "minimumHeightInMeters"):
                    if is_not_none(specs, field):
                        numberFields += 1
        if numberFields >= 5:
            return "good"
        elif numberFields > 2:
            return "average"
        else:
            return "bad"

input_directory = argv[1]
output_filename = argv[2]

file_list = [f for f in listdir(input_directory)
             if isfile(join(input_directory, f))]

output_json = []

print("Loading data from {}...".format(input_directory))
# Database primary key counter
pk = 1
for filename in file_list:
    facility = json.load(open(join(input_directory, filename)))
    now = int(time.time())
    # print (filename)
    if "staticData" in facility and facility["staticData"] is not None and "validityStartOfPeriod" in facility["staticData"] and facility["staticData"]["validityStartOfPeriod"] is not None:
        start = int(facility["staticData"]["validityStartOfPeriod"])
    else:
        start = 0

    if "staticData" in facility and facility["staticData"] is not None and "validityEndOfPeriod" in facility["staticData"] and facility["staticData"]["validityEndOfPeriod"] is not None:
        end = int(facility["staticData"]["validityEndOfPeriod"])
    else:
        end = 253402214400

    contactPersons = is_not_none(facility["staticData"], "contactPersons", True)
    if contactPersons == False:

        if (facility["staticData"] is not None and
            "operator" in facility["staticData"] and

            "administrativeAddresses" in facility["staticData"]["operator"]):
            contactPersons = is_not_none(facility["staticData"]["operator"]["administrativeAddresses"][0], "emailAddresses")

    #if (facility["uuid"] == "7c548643-8f94-4c6b-bc3d-452323aba6a1"):
    #    print (facility["staticData"]["operator"]["administrativeAddresses"]);
    #    print (is_not_none(facility["staticData"]["operator"]["administrativeAddresses"][0], "emailAddresses"))
    #    print (contactPersons)

    if "geoLocation" in facility and facility["geoLocation"] is not None:
        latitude = facility["geoLocation"]["latitude"]
        longitude = facility["geoLocation"]["longitude"]
    else:
        latitude = None
        longitude = None

    fields = {
        "name": facility["name"],
        "uuid": facility["identifier"],
        "staticDataUrl": facility["staticDataUrl"],
        "dynamicDataUrl": facility.get("dynamicDataUrl", None),
        "limitedAccess": facility["limitedAccess"],
        "latitude": latitude,
        #facility["geoLocation"]["latitude"] if "geolocation" in facility and facility["geoLocation"] is not None else None,
        "longitude": longitude,
        #facility["geoLocation"]["longitude"] if "geolocation" in facility and facility["geoLocation"] is not None else None,
        "city": facility["city"] if "city" in facility else None,
        "province": facility["province"] if "province" in facility else None,
        "region": get_region_name(facility),
        "country_code": facility["country_code"] if "country_code" in facility else None,
        "usage": get_usage(facility["staticData"]),
        "accessPoints": is_not_none(facility["staticData"], "accessPoints", True),
        "capacity": get_value(facility, ["staticData", "specifications", 0, "capacity"]),
        "tariffs": is_not_none(facility["staticData"], "tariffs", True),
        "minimumHeightInMeters": get_value(facility, ["staticData", "specifications", 0, "minimumHeightInMeters"]),
        "openingTimes": is_not_none(facility["staticData"], "openingTimes", True),
        # "contactPersons": is_not_none(facility["staticData"], "contactPersons", True)
        "contactPersons": contactPersons
        # "contactPersons": is_not_none(facility["staticData"]["operator"]["administrativeAddresses"], "emailAddresses", True)

    }

    # Convert , to .
    if type(fields["minimumHeightInMeters"]) is str:
        fields["minimumHeightInMeters"] = fields["minimumHeightInMeters"].replace(",",".")
        fields["minimumHeightInMeters"] = float(fields["minimumHeightInMeters"])
        #print(fields["minimumHeightInMeters"])
        #print(type(fields["minimumHeightInMeters"]))

    # Convert cm to m
    if fields["minimumHeightInMeters"] is not None and fields["minimumHeightInMeters"] > 100.0:
        #print(fields["minimumHeightInMeters"])
        fields["minimumHeightInMeters"] = fields["minimumHeightInMeters"] / 100.0
        #print(fields["minimumHeightInMeters"])

    # Add the mark field, based on some other fields
    fields["mark"] = get_mark(fields["usage"], fields["longitude"],
                              fields["latitude"], facility["staticData"])
    # Check validity
    if (now > start and now < end):
        output_json.append({"model": "api.parkingdata",
                            "pk": pk, "fields": fields})
        pk += 1
    #else:
    #    print ("dat is raar: " + str(now) + " " + str(start) + " " + str(end))

output_json.append({"model": "api.parkingdata", "pk": pk, "fields": {
    "name": "Oy mate, what are you doing here?",
    "uuid": "abcdef",
    "staticDataUrl": "www.google.com",
    "dynamicDataUrl": "maps.google.com",
    "limitedAccess": True,
    "latitude": -27.116667,
    "longitude": -109.366667,
    "city": "Somewhere",
    "province": "Lost",
    "region": "In the Pacific",
    "country_code": "m8",
    "usage": "garage",
    "accessPoints": True,
    "capacity": 42,
    "tariffs": True,
    "minimumHeightInMeters": 3.1415,
    "openingTimes": True,
    "contactPersons": True
}})

print("Write data to {}...".format(output_filename))
with open(output_filename, "w") as file:
    json.dump(output_json, file)
