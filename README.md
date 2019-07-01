# Highcharts for WX-HWS

This repository contains the instructions and code to enable Highcharts to be used with the WeeWX version of weather34 home weather templates. Please make sure that you are using the current version of WX-HWS from https://github.com/steepleian/WX-HWS


# Installation and Setup Instructions

1. Install the WeeWX Highcharts extension. Full intructions can be found at https://github.com/gjr80/weewx-highcharts. Pay careful attention to the modification of weewx.conf and skin.conf files.
2. Download the .zip file to the root folder of WX-HWS template installation.
3. Unzip the file which will result in a new folder, highcharts.
4. Included in this folder are versions of index.php, barometeralmanac.php, rainfallalmanac.php, solaralmanac.php, tempalmanac.php,uvalmanac.php, windalmanac.php which include the essential links to the new charts. Rename your existing WX-HWS files (for example index.php to index.php.cjs) and replace them with the new versions.
5. Go to the languages folder in this repository. Copy the two files contained within to the languages folder of your WX-HWS installation.
6. Go to your skins/Highcharts folder and rename your Highcharts skin.conf file and json folder. Replace it with the skin.conf file and json folder found in the skin/Highcharts folder in this repository.         
7. Go to the [CheetahGenerator] stanza and change [YOUR_PATH] to reflect your own path. For example it might be '/var/www/html/pws/highcharts'
8. Go to your WeeWX installation and find the /bin/user folder. Rename the highchartsSearchX.py to say highchartsSearchX.py.backup and copy the highchartsSearchX.py in the user folder of this repository into /bin/user folder in its place. 
9. Find and edit your WX-HWS file settings1.php. At line 38, change '$chartsource   = "mbcharts";' to read '$chartsource   = "highcharts";'
10. Re-start WeeWX. Wait for the first archive period to elapse. An additional folder 'json' should now be created in the highcharts folder. This contains the week and year json data files which are updated every archive period.
11. Open your website page and click on any of the chart links and a new chart will be displayed.
12. You will find additional controls which allows you change the time frame and zoom-in on data etc.
13. The charts that are set up to be generated are as follows: -

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
            
            
            
            
            
