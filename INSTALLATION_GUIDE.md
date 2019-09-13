# Installation and Setup Instructions

1. Download the .zip file to a convienient location.
2. Unzip the file which will result in a new folder, highcharts-for-wx-hws-master.
3. Go to your unzipped downloaded folder.
4. Included in this folder are new versions of index.php and easywxsetup.php plus new files w34barometeralmanac.php, w34rainfallalmanac.php, w34solaralmanac.php, w34tempalmanac.php,w34uvalmanac.php, w34windalmanac.php which include the essential links to the new charts. Rename your existing WX-HWS index.php and easywxsetup.php files found in the root of your WX-HWS installation (for example index.php to index.php.cjs) and replace them with the new versions. 
5. Copy the 6 almanac files (named above) into your WX-HWS root folder.
6. Copy the two files in the languages folder into your WX-HWS languages folder.
7. Copy the w34highcharts folder into your WX-HWS root folder.
8. Open the skins folder and copy the w34Highcharts and w34Highcharts-day folders within to your WeeWX installation skins folder. Depending on your installation, you will generally find your skins folder either at /home/weewx/skins or /etc/weewx/skins.
9. Open the user folder and copy the w34highchartsSearchX.py within to your WeeWX installation user folder. Depending on your installation type, you will generally find your user folder either at /home/weewx/bin/user or /usr/bin/user.
10. Stop WeeWX and edit it your weewx.conf file (either at /home/weewx or /etc/weewx) and add the following snippet under the [stdReport] stanza: -
                        
                        [[w34Highcharts]]
                              skin = w34Highcharts
                                 [[[Units]]]
                                    [[[[StringFormats]]]]
                                        mm_per_hour = %.1f
                                        mile_per_hour = %.0f
                                        degree_compass = %.0f
                                        degree_C = %.1f
                                        cm = %.2f
                                        mmHg = %.1f
                                        meter_per_second = %.1f         
                                        meter_per_second2 = %.1f
                                    [[[[Labels]]]]
                                        mm_per_hour = mm/hr
                                        mile_per_hour = mph
                                        degree_compass = \u00B0
                                        degree_C = \u00B0 C
                                        cm = cm
                                        mmHg = mmHg
                                        meter_per_second = m/s
                                        meter = meters
                                        volt = V
                                        mile_per_hour2 = mph
                                        uv_index = Index
                                        NONE = ""
                                        inHg = inHg
                                        watt_per_meter_squared = W/m\u00B2
                                        percent = %
                                        km_per_hour = km/hr
                                        inch = in
                                        knot2 = knots
                                        centibar = cb
                                        km_per_hour2 = km/hr
                                        cm_per_hour = cm/hr
                                        degree_F = \u00B0 F
                                        knot = knots
                                        foot = feet
                                        hPa = hPa
                                        mbar = mbar
                                        inch_per_hour = in/hr
                                        mm = mm
                                        meter_per_second2 = m/s
                                    [[[[Groups]]]]
                                        group_altitude = meter
                                        group_speed2 = mile_per_hour2
                                        group_pressure = hPa
                                        group_rain = mm
                                        group_rainrate = mm_per_hour
                                        group_temperature = degree_C
                                        group_degree_day = degree_C_day
                                        group_speed = mile_per_hour
                                [[[Extras]]]
                                    [[[[MinRange]]]]
                                        barometer = 20, hPa
                                        windchill = 10, degree_C
                                        UV = 16
                                        radiation = 500
                                        rain = 5, mm
                                        outTemp = 10, degree_C
                                        windSpeed = 10
                                    [[[[WindRose]]]]
                                        bullseye_percent = True
                                        band_percent = True
                                        aggregate_type = ""
                                        petal_colors = aqua, 0x0099FF, 0x0033FF, 0x009900, 0x00CC00, 0x33FF33, 0xCCFF00
                                        period = 86400, 604800, month, year
                                        bullseye_size = 20
                                        precision = 1
                                        petals = 16
                                        aggregate_interval = ""
                                        speedfactor = 0.0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0
                                        title = Wind Rose
                                        legend_title = True
                                        calm_limit = 0.5
                                        source = windSpeed
                                        bullseye_color = 0xFFFACD
                                [[[CheetahGenerator]]]
                                    [[[[ToDate]]]]
                                        [[[[[YearJSON]]]]]
                                            stale_age = 3600

 
8. Find and edit your WX-HWS file settings1.php. At line 38, change '$chartsource   = 'mbcharts;' to read '$chartsource   = 'w34highcharts';
9. Finally make sure that you have ownership of your WX-HWS root folder and it contents. From the command line: -

            sudo chown username: www-data -R /your_path_to_WX-HWS_root_folder. 
            (as an example sudo chown fredbloggs: www-data -R /var/www/html)
            
10. Re-start WeeWX. Wait for the first archive period to elapse. Additional folder 'json' should now have been created in the 'w34highcharts folder'. The 'json_day' folder will be created in the 'w34highcharts-day' folder the first time the user requests a day report either by using compare days or "picking" a day in the past. These contain the day, week and year json data files which are updated every archive period.
11. Open your website page and click on any of the chart links and a new chart will be displayed.
12. You will find additional controls which allows you change the time frame and zoom-in on data etc. 
13. Apart from the many features metioned earlier, the context menu (button top right in each chart) allows the charts to be displayed full screen, printed or saved.
            
14. You will notice that not all of the available charts are represented in the links on the alternative index page. If you wish to add or change the links the following format must be used, where '[chart_ID]' is the name of the chart e.g. 'humidityplot and '[time_frame]' is either 'weekly' or 'yearly': -

            href="<?php echo $chartsource;?>/highcharts.html?chart='[chart_ID]'&span='[time_frame]'&temp='<?php echo $weather['temp_units'];?>'&pressure='<?php echo $weather['barometer_units'];?>'&wind='<?php echo $weather['wind_units'];?>'&rain='<?php echo $weather['rain_units']?>" data-lity >
            
            
            
            
Any problems, please raise an Issue in this repository 
