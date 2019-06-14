# Highcharts for WX-HWS

This repository contains the instructions and code to enable Highcharts to be used with the WeeWX version of weather34 home weather templates. Please make sure that you are using the current version of WX-HWS from https://github.com/steepleian/WX-HWS


# Installation and Setup Instructions

1. Install the WeeWX Highcharts extension. Full intructions can be found at https://github.com/gjr80/weewx-highcharts. Pay careful attention to the modification of weewx.conf and skin.conf files.
2. Download the .zip file to the root folder of WX-HWS template installation.
3. Unzip the file which will result in a new folder, highcharts.
4. Included in this folder is and alternative version of index.php with the links to the new charts. Rename your existing WX-HWS index.php file to index.php.cjs and replace it with the alternative version.
5. Find and edit your Highcharts skin.conf file. Towards the end of the code you will find in the [CheetahGenerator] stanza something like: -


    	[[ToDate]]

        	# Highcharts week json data
        	[[[WeekJSON]]]
            		template = json/week.json.tmpl
	    		HTML_ROOT = [YOUR_PATH]/highcharts
            
        	# Highcharts week json data
        	[[[YearJSON]]]
            		template = json/year.json.tmpl	
            		HTML_ROOT = [YOUR_PATH]/highcharts
            
6. You must change this to reflect your own path. For example it might be '/var/www/html/pws/highcharts'            
7. Find and edit your WX-HWS file settings1.php. At line 38, change '$chartsource   = "mbcharts";' to read '$chartsource   = "highcharts";'
8. Re-start WeeWX. Wait for the first archive period to elapse. An additional folder 'json' should now be created in the highcharts folder. This contains the week and year json data files which are updated every archive period.
9. Open your website page and click on any of the chart links and a new chart will be displayed.
10. You will find additional controls which allows you change the time frame and zoom-in on data etc.
11. The charts that are set up to be generated are as follows: -

            Temperature = 'temperatureplot'
            
            Wind Chill/Heat Index/Apparent Temperature = 'windchillplot'
            
            Humidity = 'humidityplot'
            
            Barometer = 'barometerplot'
            
            Wind = 'windplot'
            
            Wind Direction = 'winddirplot'
            
            Wind Rose = 'windroseplot'
            
            Rain = 'rainplot'
            
            Solar =  'radiationplot'
            
            UV = 'uvplot'
            
12. You will notice that not all of these charts are represented in the links on the alternative index page. If you wish to add or change the links the following format must be used, where '[chart_ID]' is the name of the chart e.g. 'humidityplot and '[time_frame]' is either 'weekly' or 'yearly': -

            href="<?php echo $chartsource ;?>/highchart.php?chart='[chart-ID]'&span='[time_frame]'" data-lity>
            
            
Any problems, contact me on steepleian@gmail.com or raise an Issue            
            
            
            
            
            
