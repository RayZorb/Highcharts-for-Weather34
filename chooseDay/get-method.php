<!DOCTYPE html>  
<html> 
    <head> 
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="https://code.highcharts.com/stock/highstock.js"></script>
    <script src="https://code.highcharts.com/stock/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/data.js"></script>
    <script src="../js/darktheme.js" type="text/javascript"></script>
    <script src="../js/plots.js" type="text/javascript"></script>
    <script src="../js/convert_units.js" type="text/javascript"></script>
    <script src="../languages/translations.js" type="text/javascript"></script>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css">
    </head> 
    <body> 
       <div style="width:auto;">  
       <div id="plot_div" style="width:100%; height:420px;"></div>
    </div>
    </body> 
</html>
<?php 
  IF (ISSET($_POST["Submit"])) {
      $plot_type = $_POST['plot_type'];
      $temp_unit = $_POST['temp_unit'];
      $pressure_unit = $_POST['pressure_unit'];
      $wind_unit = $_POST['wind_unit'];
      $rain_unit = $_POST['rain_unit'];
      $current_epoch = time();
      $day_epoch = (int)$_POST['epoch'] + (86400 *3);
      $output = shell_exec(escapeshellcmd('./wee_reports '.($current_epoch < $day_epoch ? "": $day_epoch)));
      echo $output;
      echo "<script> display_chart({temp:'$temp_unit', pressure:'$pressure_unit', wind:'$wind_unit', rain:'$rain_unit'}, '$plot_type', 'weekly');</script>";
} ?> 
