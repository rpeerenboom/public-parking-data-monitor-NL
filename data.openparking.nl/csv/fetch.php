<?php
$db = new SQLite3('/var/www/open-parking/django-server/openParking/db.sqlite3');
if (!isset($_GET['level']) || !isset($_GET['filters']) || !isset($_GET['extras']) || !isset($_GET['name'])) {
  die ("Nope");
}
$level = (int)$_GET['level'];
$filters = (string)$_GET['filters'];
$filters = str_replace("parkAndRide","park and ride", $filters);
$visFacilities = explode(",", $filters);
//onStreet moet eruit..
if (($key = array_search("onstreet", $visFacilities)) !== false) {
  unset($visFacilities[$key]);
}

$extras = explode(",", (string)$_GET['extras']);
$limitedAccess = array();
if (in_array("public", $extras)) {
  $limitedAccess[] = 0;
}
if (in_array("private", $extras)) {
  $limitedAccess[] = 1;
}
//print_r($limitedAccess);
$name = (string)$_GET['name'];
if (isset ($_GET['information'])) {
  $information = json_decode($_GET['information']);
}
if ($level === 0) { //alles
  $sql = "SELECT * FROM api_parkingdata
    WHERE limitedAccess IN (" . implode(", ", $limitedAccess) . ")
    AND   usage IN ('" . implode("', '", $visFacilities) . "')
    AND   region is not null";
} elseif ($level === 1) {  //regio
  $sql = "SELECT * FROM api_parkingdata
    WHERE limitedAccess IN (" . implode(", ", $limitedAccess) . ")
    AND   usage IN ('" . implode("', '", $visFacilities) . "')
    AND   region = '" . SQLite3::escapeString($name) . "'";
} elseif ($level === 2) { //provincie
  $sql = "SELECT * FROM api_parkingdata
    WHERE limitedAccess IN (" . implode(", ", $limitedAccess) . ")
    AND   usage IN ('" . implode("', '", $visFacilities) . "')
    AND   province = '" . SQLite3::escapeString($name) . "'";
} elseif ($level === 3) { //stad
  // even kijken of het 'no location' is
  if ($name == "region/none") {
    /*$sql = "SELECT * FROM api_parkingdata
      WHERE limitedAccess IN (" . implode(", ", $limitedAccess) . ")
      AND   usage IN ('" . implode("', '", $visFacilities) . "')
      AND   region is null";*/
    $sql = "SELECT * FROM api_parkingdata
      WHERE limitedAccess IN (" . implode(", ", $limitedAccess) . ")
      AND   usage IN ('" . implode("', '", $visFacilities) . "')
      AND   region = 'none'";

  }
  else
  {
    $sql = "SELECT * FROM api_parkingdata
      WHERE limitedAccess IN (" . implode(", ", $limitedAccess) . ")
      AND   usage IN ('" . implode("', '", $visFacilities) . "')
      AND   city = '" . SQLite3::escapeString($name) . "'";
  }
}
/*
 * api fields
 * [capacity] => false
 * [dynamic] => false
 * [accessPoints] => false
 * [contactPersons] => false
 * [openingTimes] => false
 * [restrictions] => false
 * [tariffs] => false
 * */
/*
 * db fields
 * [accessPoints] => 0
 * [capacity] =>
 * [contactPersons] => 0
 * [minimumHeightInMeters] =>
 * [openingTimes] => 0
 * [tariffs] => 1
 * [dynamicDataUrl] => ''
 * )
 * */
//print_r($information);
//echo strtoupper($information->capacity) . "\n";
if (isset($information->capacity)) {
  $sql .= "\n   ";
  if (strtoupper($information->capacity) === "TRUE") {
    $sql .= " AND capacity > 0";
  } else if (strtoupper($information->capacity) === "FALSE") {
    $sql .= " AND capacity is null";
  }
}
if (isset($information->dynamic)) {
  $sql .= "\n   ";
  if (strtoupper($information->dynamic) === "TRUE") {
    $sql .= " AND dynamicDataUrl != ''";
  } else if (strtoupper($information->dynamic) === "FALSE") {
    $sql .= " AND dynamicDataUrl is null";
  }
}
if (isset($information->accessPoints)) {
  $sql .= "\n   ";
  if (strtoupper($information->accessPoints) === "TRUE") {
    $sql .= " AND accessPoints = 1";
  } else if (strtoupper($information->accessPoints) === "FALSE") {
    $sql .= " AND accessPoints = 0";
  }
}
if (isset($information->contactPersons)) {
  $sql .= "\n   ";
  if (strtoupper($information->contactPersons) === "TRUE") {
    $sql .= " AND contactPersons = 1";
  } else if (strtoupper($information->contactPersons) === "FALSE") {
    $sql .= " AND contactPersons = 0";
  }
}
if (isset($information->openingTimes)) {
  $sql .= "\n   ";
  if (strtoupper($information->openingTimes) === "TRUE") {
    $sql .= " AND openingTimes = 1";
  } else if (strtoupper($information->openingTimes) === "FALSE") {
    $sql .= " AND openingTimes = 0";
  }
}
if (isset($information->restrictions)) {
  $sql .= "\n   ";
  if (strtoupper($information->restrictions) === "TRUE") {
    $sql .= " AND minimumHeightInMeters > 0";
  } else if (strtoupper($information->restrictions) === "FALSE") {
    $sql .= " AND (minimumHeightInMeters <= 0 OR minimumHeightInMeters is null)";
  }
}
if (isset($information->tariffs)) {
  $sql .= "\n   ";
  if (strtoupper($information->tariffs) === "TRUE") {
    $sql .= " AND tariffs = 1";
  } else if (strtoupper($information->tariffs) === "FALSE") {
    $sql .= " AND tariffs = 0";
  }
}
/*$ipAddress = $_SERVER['REMOTE_ADDR'];
if ($ipAddress == "80.56.91.170") {
  echo "<pre>";
  echo "$sql\n";
  die();
}*/

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="OPENPARKING_EXPORT_' . date("YmdHis") . '_' . $name . '.csv"');

$results = $db->query($sql);
$first = true;
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
  if ($first) {
    foreach ($row as $name=>$val) {
      echo $name . ";";
    }
    echo "\n";
  }
  echo implode(";", $row) . "\n";
  $first = false;
}
