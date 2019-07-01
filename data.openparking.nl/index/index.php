<?php
$index = "/var/www/open-parking/data-processing/index_latest.json";
$filename = "openparking_index_file_" . date ("Ymd_His", filemtime($index)) . ".json";

// start the download
header('Content-Description: File Transfer');
header('Content-Type: application/json');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: '.filesize($index));
header('Content-Disposition: attachment; filename="' . $filename . '"');

ob_clean();
flush();

readfile($index);

exit;
