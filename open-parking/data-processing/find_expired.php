#!/usr/bin/php
<?php
$files = glob(__DIR__ . "/cache-dir/*.json");
foreach ($files as $file) {
  if($json = json_decode(file_get_contents($file))) {
    if (isset($json->staticData)) {
      if (isset($json->staticData->validityStartOfPeriod)) {
        $validityStartOfPeriod = $json->staticData->validityStartOfPeriod;
      } else {
        $validityStartOfPeriod = 0;
      }
      if (isset($json->staticData->validityEndOfPeriod)) {
        $validityEndOfPeriod   = $json->staticData->validityEndOfPeriod;
      } else {
        $validityEndOfPeriod = 2303596800;
      }
      $now = time();
      if ($validityEndOfPeriod < $now || $validityStartOfPeriod > $now) {
        //not valid;
        echo "$json->identifier : " . date("Y-m-d H:i:s", $validityStartOfPeriod) . " : " . date("Y-m-d H:i:s", $validityEndOfPeriod) . "\n";
      }
    }
  } else {
    echo "$file is invalid...\n";
  }
}
