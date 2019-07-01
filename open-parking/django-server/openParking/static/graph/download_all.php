<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

$mysqli = new mysqli("localhost", "parking", "password", "parking");
$uuid = $mysqli->real_escape_string($_REQUEST['uuid']);
$sql = "select pd.timestamp, pd.parkingCapacity, pd.vacantSpaces as vacantspaces, pd.open, pd.full, l.name from parkingdata pd left join locations l on l.identifier = pd.identifier where pd.identifier='$uuid' order by pd.timestamp";
$res = $mysqli->query($sql);
if ($res->num_rows > 0) {
  header('Content-Type: text/csv');
  header('Content-Disposition: attachment; filename="openparking_export_' . date("Ymd_His") . '.csv"');
  echo "timestamp;parkingcapacity;vacantspaces;open;full;name\n";
  while ($row = $res->fetch_assoc()) {
    echo implode(";", $row) . "\n";
  }
} else {
  echo "No historical data found...";
}
