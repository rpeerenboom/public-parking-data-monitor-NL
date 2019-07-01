#!/usr/bin/php
<?php
$json_technolution = json_decode(file_get_contents("http://opendata.technolution.nl/opendata/parkingdata/v1/"));
$json_npr = json_decode(file_get_contents("/var/www/open-parking/data-processing/index_latest.json"));
$db = new SQLite3('/var/www/open-parking/django-server/openParking/db.sqlite3');

$mysqli = new mysqli("localhost", "parking", "password", "openparking");
$technolution = array();
$npr = array();

foreach ($json_npr->parkingFacilities as $pf) {
  /*
  [0] => stdClass Object
  (
    [name] => Garage Mathenesserplein (Rotterdam)
    [uuid] => 00001592-a190-4710-b704-a2f1820ad7cc
    [staticDataUrl] => https://npropendata.rdw.nl/parkingdata/v2/static/00001592-a190-4710-b704-a2f1820ad7cc
    [limitedAccess] =>
  )
  */
  $npr[$pf->identifier] = $pf;
}

foreach ($json_technolution->parkingFacilities as $pf) {
  /*
  {
    "dynamicDataUrl": "http://opendata.technolution.nl/opendata/parkingdata/v1/dynamic/80d26cc5-1210-4bdf-beb4-0602f35bdccc",
    "staticDataUrl": "https://npropendata.rdw.nl/parkingdata/v2/static/80d26cc5-1210-4bdf-beb4-0602f35bdccc",
    "limitedAccess": false,
    "identifier": "80d26cc5-1210-4bdf-beb4-0602f35bdccc",
    "name": "Zaailand - Zaailand"
  }
   */
  $json_static = json_decode(file_get_contents($pf->staticDataUrl));

  

  if (array_key_exists($pf->identifier, $npr)) {
    echo $pf->identifier . " : IS IN NPR";
  } else {
    echo $pf->identifier . " : IS NOT IN NPR";
  }
  $sql = "select * from api_parkingdata where uuid='" . $pf->identifier . "'";
  $results = $db->query($sql);
  if ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    echo " : IS IN OPENPARKING\n";
  } else {
    echo " : IS NOT IN OPENPARKING\n";
    print_r($json_static);
    die();
  }
}
