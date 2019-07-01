#!/usr/bin/php
<?php
$mysqli = new mysqli("localhost", "parking", "password", "openparking");
$urls = array("http://parkeergarage.kxa.nl/parkingdata/v1/",
              "http://opendata.technolution.nl/opendata/parkingdata/v1/",
              "http://npropendata.rdw.nl/parkingdata/v2");

foreach($urls as $url) {

  $json = file_get_contents($url);
  $data = json_decode($json);
  /*
  stdClass Object
  (
    [ParkingFacilities] => Array
    (
      [0] => stdClass Object
      (
        [name] => Buiten Wittevrouwen
        [uuid] => d8f4e169-b645-40e8-bb53-394d50d46a69
        [staticDataUrl] => https://npropendata.rdw.nl/parkingdata/v2/static/d8f4e169-b645-40e8-bb53-394d50d46a69
        [limitedAccess] =>
      )
    )
  )
  */

  if (isset($data->parkingFacilities)) {
    $data->ParkingFacilities = $data->parkingFacilities;
  }

  foreach ($data->ParkingFacilities as $pf) {

    if (isset($pf->identifier)) {
      $pf->uuid = $pf->identifier;
    }

    $cache = json_decode(file_get_contents(__DIR__ . "/cache-dir/" . $pf->uuid .".json"));
    if (isset($cache->staticData->operator->name)) {
      $operatorname = $cache->staticData->operator->name;
    } else {
      $operatorname = "UNKNOWN";
    }
    if ($pf->limitedAccess) {
      if ($pf->limitedAccess === true) {
        $limitedAccess = 1;
      } else {
        $limitedAccess = 0;
      }
    } else {
      $limitedAccess = 0;
    }

    $sql = "insert into locations (
      `uuid`,
      `limitedAccess`,
      `staticDataUrl`,
      `name`,
      `operator`,
      `inserted`)
      values      ( '" . $mysqli->real_escape_string($pf->uuid) . "',
        '" . $limitedAccess . "',
        '" . $mysqli->real_escape_string($pf->staticDataUrl) ."',
        '" . $mysqli->real_escape_string($pf->name) . "',
        '" . $mysqli->real_escape_string($operatorname) . "',
        now() ) ON DUPLICATE KEY UPDATE `limitedAccess`= '$limitedAccess',
                                        `staticDataUrl` = '" . $mysqli->real_escape_string($pf->staticDataUrl) ."',
                                         `name` = '" . $mysqli->real_escape_string($pf->name) . "',
                                         `operator` = '" . $mysqli->real_escape_string($operatorname) . "';";

    if (!$mysqli->query($sql)) {
      printf("Errormessage: %s\n", $mysqli->error);
    }

    if (isset($pf->dynamicDataUrl)) {
      $sql = "insert into dynamicurls (
        `uuid`,
        `dynamicDataUrl`,
        `lastupdated`)
        values      ( '" . $mysqli->real_escape_string($pf->uuid) . "',
          '" . $mysqli->real_escape_string($pf->dynamicDataUrl) . "',
          now() ) ON DUPLICATE KEY UPDATE `lastupdated` = now(), `dynamicDataUrl` = '" . $mysqli->real_escape_string($pf->dynamicDataUrl) . "';";
      $mysqli->query($sql);
    }
    if (isset($pf->geoLocation)) {
      $sql = "insert ignore into geolocations (
        `uuid`,
        `coordinatesType`,
        `longitude`,
        `latitude`)
        values      ( '" . $mysqli->real_escape_string($pf->uuid) . "',
          '" . $mysqli->real_escape_string($pf->geoLocation->coordinatesType) . "',
          '" . $mysqli->real_escape_string($pf->geoLocation->longitude) . "',
          '" . $mysqli->real_escape_string($pf->geoLocation->latitude) . "');";
      $mysqli->query($sql);
    }
    if (isset($pf->locationForDisplay)) {
      $sql = "insert ignore into geolocations (
        `uuid`,
        `coordinatesType`,
        `longitude`,
        `latitude`)
        values      ( '" . $mysqli->real_escape_string($pf->uuid) . "',
          '" . $mysqli->real_escape_string($pf->locationForDisplay->coordinatesType) . "',
          '" . $mysqli->real_escape_string($pf->locationForDisplay->longitude) . "',
          '" . $mysqli->real_escape_string($pf->locationForDisplay->latitude) . "');";
      $mysqli->query($sql);
    }

  }
}

$sql = "SELECT l.uuid, l.name, l.staticDataUrl, COALESCE(d.dynamicDataUrl, 'false') as dynamicDataUrl, l.limitedAccess, COALESCE(g.coordinatesType, 'false') as coordinatesType, COALESCE(g.longitude, 'false') as longitude, COALESCE(g.latitude, 'false') as latitude FROM `locations` l left join dynamicurls d on d.uuid = l.uuid left join geolocations g on g.uuid = l.uuid WHERE 1";
$res = $mysqli->query($sql);
$output = new stdClass();
$output->TimestampCreated = gmdate("Y-m-d\TH:i:s\Z");
$output->parkingFacilities = array();
while ($row = $res->fetch_object()) {
  $json = json_decode(file_get_contents(__DIR__ . "/cache-dir/" . $row->uuid . ".json"));
/*
stdClass Object
(
  [parkingFacilityInformation] => stdClass Object
  (
    [description] => Garage Mathenesserplein (Rotterdam)
    [identifier] => 00001592-a190-4710-b704-a2f1820ad7cc
    [validityStartOfPeriod] => 1381449600
    [validityEndOfPeriod] =>
 */
  if (!isset($json->staticData->validityStartOfPeriod)) {
    $start = 0;
  } else {
    $start = $json->staticData->validityStartOfPeriod;
  }
  if (!isset($json->staticData->validityEndOfPeriod)) {
    $end = 2537615397;
  } else {
    $end = $json->staticData->validityEndOfPeriod;
  }

  if (time() >= $start && time() <= $end) {

    $record = new stdClass();

    $record->name = $row->name;
    $record->identifier = $row->uuid;
    if ($row->coordinatesType !== "false") {
      $geo = new stdClass();
      $geo->coordinatesType = $row->coordinatesType;
      $geo->longitude = $row->longitude;
      $geo->latitude = $row->latitude;
      $record->geoLocation = $geo;
    }

    $record->staticDataUrl = $row->staticDataUrl;
    if ($row->dynamicDataUrl !== "false") {
      $record->dynamicDataUrl = $row->dynamicDataUrl;
    }
    $record->limitedAccess = (bool)$row->limitedAccess;
    $output->parkingFacilities[] = $record;
  }
}
echo json_encode($output, JSON_PRETTY_PRINT + JSON_UNESCAPED_SLASHES);
