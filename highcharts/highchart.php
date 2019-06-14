<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
  <head>
    <?php include_once('../livedata.php');?>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>PUT CHART NAME HERE</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="https://code.highcharts.com/stock/highstock.js"></script>
    <script src="https://code.highcharts.com/stock/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/data.js"></script>
    <script src="scripts/theme.js" type="text/javascript"></script>
    <script src="scripts/plots.js" type="text/javascript"></script>
    <script src="scripts/convert_units.js" type="text/javascript"></script>
    <script type="text/javascript">
        window.onload = function() {
            var vars = {};
            window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {vars[key.replace(/%27/g,"")] = value.replace(/%27/g,"");});
            $("#plot_name").attr('id',vars['chart']);
            display_chart({temp:'<?php echo $weather["temp_units"]; ?>', pressure:'<?php echo $weather["barometer_units"]; ?>', wind:'<?php echo $weather["wind_units"]; ?>', rain:'<?php echo $weather["rain_units"]; ?>'}, vars['chart'], null, vars['span']);
        }
    </script>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css">
    <style>body{background:rgba(30, 31, 35, 1.000);}
-webkit-border-radius:4px;	-moz-border-radius:4px;	-o-border-radius:4px;	-ms-border-radius:4px;border-radius:4px;border:solid RGBA(84, 85, 86, 1.00) 2px;	width:167vh;height:80vh;}
.weather34darkbrowser{position:relative;background:0;width:103.3%;max-height:30px;margin:auto;margin-top:-15px;margin-left:-20px;border-top-left-radius:5px;border-top-right-radius:5px;padding-top:45px;background-image:radial-gradient(circle,#EB7061 6px,transparent 8px),radial-gradient(circle,#F5D160 6px,transparent 8px),radial-gradient(circle,#81D982 6px,transparent 8px),radial-gradient(circle,rgba(97,106,114,1) 2px,transparent 2px),radial-gradient(circle,rgba(97,106,114,1) 2px,transparent 2px),radial-gradient(circle,rgba(97,106,114,1) 2px,transparent 2px),linear-gradient(to bottom,rgba(59,60,63,0.4) 40px,transparent 0);background-position:left top,left top,left top,right top,right top,right top,0 0;background-size:50px 45px,90px 45px,130px 45px,50px 30px,50px 45px,50px 60px,100%;background-repeat:no-repeat,no-repeat}.weather34darkbrowser[url]:after{content:attr(url);color:#aaa;font-size:14px;position:absolute;left:0;right:0;top:0;padding:2px 15px;margin:11px 50px 0 90px;border-radius:3px;background:rgba(97, 106, 114, 0.3);height:20px;box-sizing:border-box;font-family:Arial, Helvetica, sans-serif}
</style>
  </head>
  <body>
       <div style="width:auto;">  
        <div id="plot_name" style="width:100%; height:435px;"></div>
    </div>
</body>   

</html>


