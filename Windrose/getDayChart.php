<?php 
    include_once('../settings1.php');
?>
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
    <script src="../js/plots_config.js" type="text/javascript"></script>
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
    putenv("PYTHONPATH=".$_GET['weewxpathbin']);
    $plot_info = explode(",",$_GET['plot_type']);
    $units = explode(",",$_GET['units']);
    unlink($plot_info[1]);
    if (isset($_GET['epoch1'])){
      unlink($plot_info[3]);
      $output = shell_exec(escapeshellcmd($plot_info[2]." ".$_GET['epoch1']." ".$plot_info[1].".tmpl ".getcwd()));
      rename($plot_info[1], $plot_info[3]);
      $output = shell_exec(escapeshellcmd($plot_info[2]." ".$_GET['epoch']." ".$plot_info[1].".tmpl ".getcwd()));
      echo "<script> display_chart({temp:"."'".$units[0]."',pressure:"."'".$units[1]."',wind:"."'".$units[2]."',rain:"."'".$units[3]."'},'".$plot_info[0]."','weekly',false,true,'".$plot_info[4]."',".$plot_info[5].");</script>";
    }
    else {
      $output = shell_exec(escapeshellcmd($plot_info[2]." ".$_GET['epoch']." ".$plot_info[1].".tmpl ".getcwd()));
      echo "<script> display_chart({temp:"."'".$units[0]."',pressure:"."'".$units[1]."',wind:"."'".$units[2]."',rain:"."'".$units[3]."'},'".$plot_info[0]."','weekly',true,false,'".$plot_info[3]."',".$plot_info[4].");</script>";
    }
?> 
