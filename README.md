# Highcharts for WX-HWS

Credits: -

Gary (gjr80) whose WeeWX Highcharts extension (https://github.com/gjr80/weewx-highcharts) provided motivation and a start point for this project.
            
Jerry Dietrich who did 99% of the heavy lifting by engaging and volunteering his ideas, vision and coding skill at an early stage of this project. This project would certainly not have reached this point without his massive input. Thank you Jerry.

This repository contains the instructions and code to enable Highcharts to be used with the WeeWX version of weather34 home weather template as an alternative to the default CanvasJS. Please make sure that you are using the current version of WX-HWS from https://github.com/steepleian/WX-HWS

Although this extension is offered here as a manual install, the intention is to include it as a standard feature in a fully packaged future version of WX-HWS which is currently in preparation.

The following charts have been created: - Temperature, Humidity, Dewpoint, Temp/Hum/Dew, Indoor Temp, Windchill/HeatIndex, Barometer, Wind Speed, Wind Direction, Windrose, Wind Speed/Wind Gust/Wind Direction, UV, Radiation, Radiation/UV, Rainfall, Rainfall Monthly, Luminosity, Lightning, Barometer/Temp/Wind.

Most charts have both weekly (1hour, 6hours, 12hours, 24hours, 36hours and 7days) and yearly (iday, 1week, 1month, 6months and 1year) spans. Please note, the 6month button is only functional when there is at least 6 months data in the database.

The following charts have radial views: Temp, Dewpoint, Humidity, Barometer, Indoor, Derived, Wind Speed

Most charts can change from yearly to weekly to daily by clicking the "hook point" on the graph. If there is no hook point then that chart cannot change. For example Windrose chart does not switch.

Different dates can be compared with some charts. If there is a compare dates option in the menu dropdown (context menu, top right) then choosing this option will display a chart that compares the two dates in the From and To fields of the chart.

Charts can be reloaded by choosing the reload option in the context menu.

Some charts can have realtime updates by choosing the realtime update option in the context menu.

Some charts can be display as radial charts by choosing the radial chart option in the context menu.

Most charts can be automatically updated at a 1 minute interval by choosing the Auto Update option in the context menu.

Changing the dates in From and To fields will change what is displayed based on what the span is. Most useful when displaying charts with yearly spans

Holding the left mouse down allows the chart to be scrolled left to right within the chosen span. Using this feature with the zoom selector allows a user to drill down into the chart.

A modified index.php page is included with links to some of these charts. You can view a working example at https://claydonsweather.org.uk/pws


# Installation and Setup Instructions

1. Download the .zip file to the root folder of WX-HWS template installation.
2. Unzip the file which will result in a new folder, highcharts.
3. Included in this folder are versions of index.php, barometeralmanac.php, rainfallalmanac.php, solaralmanac.php, tempalmanac.php,uvalmanac.php, windalmanac.php which include the essential links to the new charts. Rename your existing WX-HWS files (for example index.php to index.php.cjs) and replace them with the new versions.
4. Go to the languages folder in this repository. Copy the two files contained within to the languages folder of your WX-HWS installation.
5. Go to your skins/Highcharts folder and rename your Highcharts skin.conf file and json folder. Replace it with the skin.conf file and json folder found in the skin/Highcharts folder in this repository.         
6. Go to the [CheetahGenerator] stanza and change [YOUR_PATH] to reflect your own path. For example it might be '/var/www/html/pws/highcharts'
7. Go to your WeeWX installation and find the /bin/user folder. Rename the highchartsSearchX.py to say highchartsSearchX.py.backup and copy the highchartsSearchX.py in the user folder of this repository into /bin/user folder in its place. 
8. Find and edit your WX-HWS file settings1.php. At line 38, change '$chartsource   = "mbcharts";' to read '$chartsource   = "highcharts";'
9. Re-start WeeWX. Wait for the first archive period to elapse. An additional folder 'json' should now be created in the highcharts folder. This contains the week and year json data files which are updated every archive period.
10. Open your website page and click on any of the chart links and a new chart will be displayed.
11. You will find additional controls which allows you change the time frame and zoom-in on data etc.
12. The charts that are set up to be generated are as follows: -

            Temperature/Dewpoint = 'temperatureplot'
            
            Wind Chill/Heat Index/Apparent Temperature = 'windchillplot'
            
            Humidity = 'humidityplot'
            
            Barometer = 'barometerplot'
            
            Wind = 'windplot'
            
            Wind Direction = 'winddirplot'
            
            Wind Rose = 'windroseplot'
            
            Rain = 'rainplot'
            
            Solar =  'radiationplot'
            
            UV = 'uvplot'
            
13. You will notice that not all of these charts are represented in the links on the alternative index page. If you wish to add or change the links the following format must be used, where '[chart_ID]' is the name of the chart e.g. 'humidityplot and '[time_frame]' is either 'weekly' or 'yearly': -

            href="<?php echo $chartsource;?>/highcharts.html?chart='[chart_ID]'&span='[time_frame]'&temp='<?php echo $weather['temp_units'];?>'&pressure='<?php echo $weather['barometer_units'];?>'&wind='<?php echo $weather['wind_units'];?>'&rain='<?php echo $weather['rain_units']?>" data-lity >
            
            The complete list of chart IDs available are as follows (the small plots are included in the almanacs): -
            
            temperatureplot,
            indoorplot,
            tempsmallplot,
            tempallplot,
            tempderivedplot,
            humidityplot,
            barometerplot,
            barsmallplot,
            dewpointplot,
            windsmallplot,
            winddirplot,
            windplot,
            windallplot,
            windroseplot,
            rainplot,
            rainsmallplot,
            radiationplot,
            raduvplot,
            radsmallplot,
            uvplot,
            uvsmallplot
            
            
Any problems, contact me on steepleian@gmail.com or raise an Issue            
            
            
            
            
            
