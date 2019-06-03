<?php

	####################################################################################################
	#	WUDATACHARTS by BRIAN UNDERDOWN 2016                                                           #
	#	CREATED FOR HOMEWEATHERSTATION TEMPLATE at http://weather34.com/homeweatherstation/index.html  #
	# 	                                                                                               #
	# 	built on CanvasJs  	                                                                           #
	#   canvasJs.js is protected by CREATIVE COMMONS LICENCE BY-NC 3.0  	                           #
	# 	free for non commercial use and credit must be left in tact . 	                               #
	# 	                                                                                               #
	# 	Weather Data is based on your PWS upload quality collected at Weather Underground 	           #
	# 	                                                                                               #
	# 	Second General Release: 4th October 2016  	                                                   #
	# 	                                                                                               #
	#   http://www.weather34.com 	                                                                   #
	####################################################################################################

	include('chartslivedata.php');include('./chart_theme.php');include('conversion.php');header('Content-type: text/html; charset=utf-8');

	

		echo '
<html>
<!--
Version: 0.2.2                                    Date: 4 September 2018

Revision History
    4 September 2018    v0.2.2
        - version number chnage only
    4 May 2017          v0.2.0
        - changed default path for theme.js and plots.js
    22 November 2016    v0.1.0
        - initial implementation
-->

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Today Barometer</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://code.highcharts.com/stock/highstock.js"></script>
    <script src="https://code.highcharts.com/stock/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
    <script src="scripts/theme.js" type="text/javascript"></script>
    <script src="scripts/plots.js" type="text/javascript"></script>
    <script type="text/javascript">
        window.onload = function() {
            //Get references to links on the page
            var w = document.getElementById("seven_days");
            var y = document.getElementById("calendar_year");

            weekly();

            
        }
    </script>

	';

	?>
<br>


<link rel="stylesheet" href="weather34chartstyle-<?php echo $charttheme;?>.css">
<body>
<div class="weather34darkbrowser" url="Barometer - <?php echo date('l') ;?> &nbsp;&nbsp;|&nbsp;&nbsp; High: <?php echo $weather["barometer_max"];?> <?php echo $pressureunit ;?> &nbsp;&nbsp; Low: <?php echo $weather["barometer_min"];?> <?php echo $pressureunit ;?>"></div>
<div style="width:auto;background:0;padding:0px;margin-left:5px;font-size: 12px;border-radius:3px;">
<div id="chartContainer" class="chartContainer"></div></div>
<div class="weather34browser-footer">
<span style="position:absolute;color:#fff;font-family:arial;padding-top:5px;margin-left:25px;border-radius:3px;">
&nbsp;
<svg id="i-external" viewBox="0 0 32 32" width="10" height="10" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="6.25%">
<path d="M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18" /></svg>
<a href="https://github.com/weather34/Meteobridge-Weather34-Template" title="Weather34 GitHub" target="_blank">
<span style="color:#00A4B4;"><?php echo $chartversionmysql  ;?> CSS & PHP scripts by weather34</span> </a></span>
<span style="position:absolute;color:#aaa;font-family:arial;padding-top:5px;margin-left:25px;display:block;margin-top:12px;">
&nbsp;
<svg id="i-external" viewBox="0 0 32 32" width="10" height="10" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="6.25%">
<path d="M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18" /></svg>
<a href="https://canvasjs.com" title="https://canvasjs.com" target="_blank"><?php echo $creditschart ;?> </a></span>
<div class="weather34browser-footerlogo"><a href="https://github.com/weather34/Meteobridge-Weather34-Template" title="Weather34 GitHub" target="_blank"><img src="../img/weatherlogo34.svg" width="35px"</img></a></div></div>
</body>
<script src='canvasJs.js'></script>
</html>
