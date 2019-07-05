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
      $plot_info = explode(",",$_GET['plot_type']);
      $plot_info[1] = 'json/'.$plot_info[1];
      unlink($plot_info[1]);
      $plot_info[1] = $plot_info[1].'.tmpl';
      $temp_unit = "'".$_GET['temp']."'";
      $pressure_unit = "'".$_GET['pressure']."'";
      $wind_unit = "'".$_GET['wind']."'";
      $rain_unit = "'".$_GET['rain']."'";
      $plot_info[0] = "'".$plot_info[0]."'";
      $day_epoch = (int)$_GET['epoch'] + (86400 *3);
      $cwd = getcwd();
      $output = shell_exec(escapeshellcmd('./wee_reports '.(time() < $day_epoch ? 'None':$day_epoch).' '.$plot_info[1].' '.$cwd));
      echo "<script> display_chart({temp:$temp_unit,pressure:$pressure_unit,wind:$wind_unit,rain:$rain_unit},$plot_info[0],'weekly',true);</script>";
 ?> 
