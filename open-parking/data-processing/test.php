<?php
$json = json_decode(file_get_contents("index_parking_data_v1.4.5.json"));
//$json = json_decode(file_get_contents("test.json"));
/*
stdClass Object
(
    [ParkingFacilities] => Array
        (
            [0] => stdClass Object
                (
                    [limitedAccess] =>
                    [dynamicDataUrl] => http://opd.it-t.nl/Data/parkingdata/v1/arnhem/dynamic/8ef842d3-f5f2-4679-a074-9096f4000db7.json
                    [staticDataUrl] => https://npropendata.rdw.nl/parkingdata/v2/static/8ef842d3-f5f2-4679-a074-9096f4000db7
                    [name] => Garage Centraal (Arnhem)
                    [uuid] => 8ef842d3-f5f2-4679-a074-9096f4000db7
                )

        )

)
 */
echo "STATICURL;DYNAMIC UUID;STATIC UUID;UUID;NAME\n";
foreach($json->ParkingFacilities as $pf) {
  @$duuid = str_replace(".json","", array_pop(explode("/", $pf->dynamicDataUrl)));
  @$suuid = array_pop(explode("/", $pf->staticDataUrl));
  $uuid = $pf->uuid;
  if ($duuid && ($duuid !== $suuid) || $duuid && ($duuid !== $uuid) || $suuid !== $uuid) {
    echo $pf->staticDataUrl . ";";
    $data = json_decode(str_replace("ParkingFacilityInformation","parkingFacilityInformation", file_get_contents($pf->staticDataUrl)));
    if ($data->parkingFacilityInformation->validityStartOfPeriod * 1 < time() && ($data->parkingFacilityInformation->validityEndOfPeriod * 1 == 0 || $data->parkingFacilityInformation->validityEndOfPeriod * 1 > time())) {
      echo "$duuid;$suuid;$uuid;" . $data->parkingFacilityInformation->name . "\n";
    }
    else {
      echo "EXPIRED;EXPIRED;EXPIRED;EXPIRED\n";
    }
  }
}
