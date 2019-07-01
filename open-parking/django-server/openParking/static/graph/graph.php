<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
?>

<html>
<head>
  <link rel="stylesheet" href="/static/css/resize.css">
  <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
  <script src="//code.highcharts.com/highcharts.js"></script>
  <script src="//code.highcharts.com/modules/exporting.js"></script>
<script type="text/javascript">
Highcharts.setOptions({
global: {
useUTC: false
    }
  });
</script>
</head>
<body>

<?php

$mysqli = new mysqli("localhost", "parking", "password", "parking");
$uuid = $mysqli->real_escape_string($_REQUEST['uuid']);
$sql = "select date_format(timestamp, '%Y-%m-%d %H:00:00') as hour, floor(avg(pd.vacantSpaces)) as vacantspaces, l.name from parkingdata pd left join locations l on l.identifier = pd.identifier where pd.timestamp >= date_add(now(), interval - 30 day) and pd.identifier='$uuid' group by date_format(timestamp, '%Y-%m-%d %H:00:00') order by date_format(timestamp, '%Y-%m-%d %H:00:00');";
$res = $mysqli->query($sql);
if ($res->num_rows > 0) {

  while ($row = $res->fetch_object()) {
    $uren[] = $row->hour;
    $data[] = $row->vacantspaces;
    $name = $row->name;
  }
  echo "Download raw data (last 30 days ) <a href='download.php?uuid=$uuid' target='_blank'>HERE</a><br>";
  echo "Download raw data (all available) <a href='download_all.php?uuid=$uuid' target='_blank'>HERE</a><br>";
  echo "<div id='highcharts_container' style='height: 400px'></div>";

?>
  <script language="javascript">
$('#highcharts_container').highcharts({
chart: {
renderTo: 'highcharts_container'
},

chart: {
  zoomType: 'x'
},

  tooltip: {
  shared: true
},

  xAxis: {
  type: 'datetime',
  categories: [<?php echo "'", implode("', '", $uren) , "'";?>]
},

  yAxis: {
  title: 'Vacant spaces per hour'
},

  plotOptions: {
  column: {
  stacking: 'normal'
}
},
  series: [
{
  name: 'Vacant spaces / hour',
    type: 'line',
    data: [<?php echo implode(",", $data); ?>]
}

],
  legend: {
  enabled: true,
},

  title: {
  text: 'Vacant spaces for <?php echo $name; ?> (last 30 days)'
}
});
</script>

<?php




} else {
  echo "No historical graph available for uuid " . $uuid;
  echo "<script language='javascript'>";
  echo "  window.parent.document.getElementById('historical_graph').style.display = 'none'";
  echo "</script>";
}
?>
</body>
  </html>
