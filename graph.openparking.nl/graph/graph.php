<html>
<body>
<?php
echo "No historical graph available for uuid " . $_REQUEST['uuid'];
echo "<script language='javascript'>";
echo "  window.parent.getElementById('historical_graph').style.borderColor = 'red'";
echo "</script>";
