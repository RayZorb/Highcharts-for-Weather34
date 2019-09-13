# Highcharts for WX-HWS (requires WeeWX 3.9.0 or later)

Credits: -

Gary (gjr80) whose WeeWX Highcharts extension (https://github.com/gjr80/weewx-highcharts) provided motivation and a start point for this project.
            
Jerry Dietrich who did 99% of the heavy lifting by engaging and volunteering his ideas, vision and coding skill at an early stage of this project. This project would certainly not have reached this point without his massive input. Thank you Jerry.

This repository contains the instructions and code to enable Highcharts to be used with the WeeWX version of weather34 home weather template as an alternative to the default CanvasJS. Please make sure that you are using the current version of WX-HWS from https://github.com/steepleian/WX-HWS. This extension does not require the 'https://github.com/gjr80/weewx-highcharts' extension to be installed first, however, if you already have that extension present there should be no conflicts between the two.

Although this extension is offered here as a manual install, the intention is to include it as a standard feature in a fully packaged future version of WX-HWS which is currently in preparation.

The following charts have been created: - Temperature, Humidity, Dewpoint, Temp/Hum/Dew, Indoor Temp, Windchill/HeatIndex, Barometer, Wind Speed, Wind Direction, Windrose, Wind Speed/Wind Gust/Wind Direction, UV, Radiation, Radiation/UV, Rainfall, Rainfall Monthly, Luminosity, Lightning, Barometer/Temp/Wind.

Most charts have both weekly (1hour, 6hours, 12hours, 24hours, 36hours and 7days) and yearly (1day, 1week, 1month, 6months and 1year) spans. Please note, the 6month button is only functional when there is at least 6 months data in the database.

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

