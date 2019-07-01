#!/usr/bin/php
<?php
$json = json_decode(file_get_contents("http://opendata.technolution.nl/opendata/parkingdata/v1/"));
$mysqli = new mysqli("localhost", "parking", "password", "openparking");
foreach ($json->parkingFacilities as $pf) {
  $uuid = $pf->identifier;
  $dynamicurl = $pf->dynamicDataUrl;
  $sql = "select * from dynamicurls where uuid='$uuid'";
  $exists_in_npr = "FALSE";
  $sql2 = "select * from openparking.locations where uuid = '$uuid'";
  $res2 = $mysqli->query($sql2);
  if ($row2 = $res2->fetch_object()) {
    $exists_in_npr = "TRUE";
  }
  $res = $mysqli->query($sql);
  if ($row = $res->fetch_object()) {
    if ($dynamicurl == $row->dynamicDataUrl) {
      echo "$uuid;OK;$exists_in_npr\n";
    } else {
      echo "$uuid;UPDATE;$exists_in_npr\n";
      if ($exists_in_npr == "TRUE") {
        $sql3 = "update openparking.dynamicurls set dynamicDataUrl = '$dynamicurl' where uuid='$uuid'";
        $res3 = $mysqli->query($sql3);
      }
    }
  } else {
    echo "$uuid;INSERT;$exists_in_npr\n";
    if ($exists_in_npr == "TRUE") {
      //dan gaan we hem in de dynamicurls toevoegen;
      $sql3 = "insert into openparking.dynamicurls values ('$uuid', '$dynamicurl', now())";
      $res3 = $mysqli->query($sql3);
    }
  }
}
