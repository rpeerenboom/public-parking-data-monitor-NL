<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
$mysqli = new mysqli("localhost", "parking", "UU9Ov14j0jk3FMfD", "parking");
$uuid = $mysqli->real_escape_string($_REQUEST['uuid']);
$sql = "SELECT pd.*, l.name FROM `parkingdata` pd left join openparking.locations l on l.uuid = pd.identifier WHERE identifier='" . $uuid . "' order by lastUpdated desc limit 1;";
$json = '{"parkingFacilityDynamicInformation": {"identifier": "0cc34898-fc5d-4879-98e9-2a823b390b06", "name": "Garage Rozet (Arnhem)", "facilityActualStatus": {"parkingCapacity": 450, "lastUpdated": 1559326750, "vacantSpaces": 196, "open": true, "statusDescription": "Free", "full": false}, "description": ""}}';
$object = json_decode($json);

$res = $mysqli->query($sql);
if ($res->num_rows > 0) {
	$row = $res->fetch_object();
  $object->parkingFacilityDynamicInformation->identifier = $uuid;
  $object->parkingFacilityDynamicInformation->name = $row->name;
  $object->parkingFacilityDynamicInformation->facilityActualStatus->parkingCapacity = $row->parkingCapacity;
  $object->parkingFacilityDynamicInformation->facilityActualStatus->lastUpdated = strtotime($row->lastUpdated);
  $object->parkingFacilityDynamicInformation->facilityActualStatus->vacantSpaces = $row->vacantSpaces;
  $object->parkingFacilityDynamicInformation->facilityActualStatus->open = (bool)$row->open;
  $object->parkingFacilityDynamicInformation->facilityActualStatus->statusDescription = $row->statusDescription;
  $object->parkingFacilityDynamicInformation->facilityActualStatus->full = (bool) $row->full;
  $object->parkingFacilityDynamicInformation->description = "";
} else {
  $object->parkingFacilityDynamicInformation->identifier = $uuid;
  $object->parkingFacilityDynamicInformation->name = "N/A";
  $object->parkingFacilityDynamicInformation->facilityActualStatus->parkingCapacity = "N/A";
  $object->parkingFacilityDynamicInformation->facilityActualStatus->lastUpdated = "N/A";
  $object->parkingFacilityDynamicInformation->facilityActualStatus->vacantSpaces = "N/A";
  $object->parkingFacilityDynamicInformation->facilityActualStatus->open = false;
  $object->parkingFacilityDynamicInformation->facilityActualStatus->statusDescription = "N/A";
  $object->parkingFacilityDynamicInformation->facilityActualStatus->full = false;
  $object->parkingFacilityDynamicInformation->description = "";
}

$json = json_encode($object);

echo $json;
