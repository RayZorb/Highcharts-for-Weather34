/*****************************************************************************
Javascript to setup, configure and display Highcharts plots of weewx weather data.
Based on Highcharts documentation and examples, and a lot of Stackoverflow Q&As.
History
    v1.0.0      June 2019
        -  large rewrite of the original plots.js to support w34 type charts
*****************************************************************************/
var pathweewx = '/weewx/'   //Path from web server home location for weewx
var pathpws   = '/pws/'     //Path from web server home location for pws

var realtimefile =  pathpws   + "demodata/realtime.txt";    //Location of real-time data from home location of pws
var pathjsonfiles = pathweewx + "json/";                    //Location weewx report output json files from home location of weewx

var dayplotsurl =   pathpws   + "mbcharts/getDayChart.php";  //Location of day reports php file from home location of pws. Should not need to change
var pathjsondayfiles = "json/";                              //Location day report output json files from home location of where wee_report_34 run. Should not need to change.
var weereportcmd = "./wee_reports_w34";                      //Command to run  wee_report_34. Should not need to change.

var autoupdateinterval = 60; //This is seconds
var realtimeinterval = 10;  //This is seconds

//First array offset(s) to wanted real-time data(s)(can be empty),Second array offset(s) to data's real-time units(can be empty),Third array unit convert function(s)(can be empty), Fourth plot type
var realtimeplot = {
    temperatureplot:[[2,4],[14,14],['convert_temp','convert_temp'],['temperatureplot']],
    winddirplot:[[7],[13],['convert_wind'],['winddirplot']],
    windplot:[[6],[13],['convert_wind'],['windplot']],
    windallplot:[[5,40,46],[13,13,-1],['convert_wind','convert_wind',null],['windallplot']],
    barometerplot:[[10],[15],['convert_pressure'],['barometerplot']]
};

var createweeklyfunctions = {
    temperatureplot: [addWeekOptions, create_temperature_chart],
    indoorplot: [addWeekOptions, create_indoor_chart],
    tempallplot: [addWeekOptions, create_tempall_chart],
    tempderivedplot: [addWeekOptions, create_tempderived_chart],
    humidityplot: [addWeekOptions, create_humidity_chart],
    barometerplot: [addWeekOptions, create_barometer_chart],
    dewpointplot: [addWeekOptions, create_dewpoint_chart],
    windplot: [addWeekOptions, create_wind_chart],
    windallplot: [addWeekOptions, create_windall_chart],
    winddirplot: [addWeekOptions, create_winddir_chart],
    windroseplot: [addWindRoseOptions, setWindRose, create_windrose_chart],
    rainplot: [addWeekOptions, create_rain_chart],
    rainmonthplot: [create_rain_month_chart],
    radiationplot: [addWeekOptions, create_radiation_chart],
    raduvplot: [addWeekOptions, create_raduv_chart],
    uvplot: [addWeekOptions, create_uv_chart]
};

var createyearlyfunctions = {
    temperatureplot: [addYearOptions,create_temperature_chart],
    indoorplot: [addYearOptions, create_indoor_chart],
    tempsmallplot: [addYearOptions, setTempSmall, create_temperature_chart],
    tempallplot: [addYearOptions, create_tempall_chart],
    tempderivedplot: [addYearOptions, create_tempderived_chart],
    humidityplot: [addYearOptions, create_humidity_chart],
    barometerplot: [addYearOptions, create_barometer_chart],
    barsmallplot: [addYearOptions, setBarSmall, create_barometer_chart],
    dewpointplot: [addYearOptions, create_dewpoint_chart],
    windsmallplot: [addYearOptions, setWindSmall, create_wind_chart],
    winddirplot: [addYearOptions, create_winddir_chart],
    windplot: [addYearOptions, create_wind_chart],
    windallplot: [addYearOptions, create_windall_chart],
    windroseplot: [addWindRoseOptions, setWindRose, create_windrose_chart],
    rainplot: [addYearOptions, create_rain_chart],
    rainmonthplot: [create_rain_month_chart],
    rainsmallplot: [addYearOptions, setRainSmall, create_rain_chart],
    radiationplot: [addYearOptions, create_radiation_chart],
    raduvplot: [addYearOptions, create_raduv_chart],
    radsmallplot: [addYearOptions, setRadSmall, create_radiation_chart],
    uvplot: [addYearOptions, create_uv_chart],
    uvsmallplot: [addYearOptions, setUvSmall, create_uv_chart]
};

var postcreatefunctions = {
    tempsmallplot: [post_create_small_chart],
    barsmallplot: [post_create_small_chart],
    windsmallplot: [post_create_small_chart],
    rainsmallplot: [post_create_small_chart],
    rainmonthplot: [remove_range_selector],
    radsmallplot: [post_create_small_chart],
    uvsmallplot: [post_create_small_chart],
    windroseplot: [post_create_windrose_chart]
};

var jsonfileforplot = {
    temperatureplot: [['temp_week.json'],['year.json']],
    indoorplot: [['indoor_derived_week.json'],['year.json']],
    tempsmallplot: [['temp_week.json'],['year.json']],
    tempallplot: [['temp_week.json'],['year.json']],
    tempderivedplot: [['indoor_derived_week.json'],['year.json']],
    dewpointplot: [['temp_week.json'],['year.json']],
    humidityplot: [['temp_week.json'],['year.json']],
    barometerplot: [['bar_rain_week.json'],['year.json']],
    barsmallplot: [['bar_rain_week.json'],['year.json']],
    windplot: [['wind_week.json'],['year.json']],
    windsmallplot: [['wind_week.json'],['year.json']],
    windallplot: [['wind_week.json'],['year.json']],
    winddirplot: [['wind_week.json'],['year.json']],
    windroseplot: [['wind_week.json'],['year.json']],
    rainplot: [['bar_rain_week.json'],['year.json']],
    rainmonthplot: [['year.json'],['year.json']],
    rainsmallplot: [['bar_rain_week.json'],['year.json']],
    radiationplot: [['solar_week.json'],['year.json']],
    raduvplot: [['solar_week.json'],['year.json']],
    radsmallplot: [['solar_week.json'],['year.json']],
    uvplot: [['solar_week.json'],['year.json']],
    uvsmallplot: [['solar_week.json'],['year.json']]
};

var plotsnoswitch = ['tempsmallplot','barsmallplot','windsmallplot','rainsmallplot','rainmonthplot','radsmallplot','uvsmallplot','windroseplot'];
var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var windrosespans = ["24h","Week","Month","Year"];
var realtimeXscaleFactor = 300/realtimeinterval;
var do_realtime = false;
var auto_update = false;
var buttons= null;
var categories;
var utcoffset;
var chart;

/*****************************************************************************
Read multiple json files at the same time found at this URL
https://stackoverflow.com/questions/19026331/call-multiple-json-data-files-in-one-getjson-request
*****************************************************************************/
jQuery.getMultipleJSON = function(){
  jQuery.ajaxSetup({timeout:10000});
  return jQuery.when.apply(jQuery, jQuery.map(arguments, function(jsonfile){
    return jQuery.getJSON(jsonfile).fail(function(){
      alert("!!!!NO DATA FOUND in database for the chosen date. Please choose another date!!!!");return true;});
  })).then(function(){
    var def = jQuery.Deferred();
    return def.resolve.apply(def, jQuery.map(arguments, function(response){
      return response[0];}));
    });
};

function create_common_options(){
    var commonOptions = {
        chart: {
            renderTo: "plot_div",
            spacing: [10, 10, 0, -1],
            zoomType: 'xy',
        },
        legend: {
            enabled: true,
            itemDistance:15,
        },
        plotOptions: {
            area: {
                lineWidth: 1,
                marker: {
                    enabled: false,
                    radius: 2,
                    symbol: 'circle'
                },
            },
            column: {
                dataGrouping: {
                    dateTimeLabelFormats: {
                        hour: ['%e %B %Y hour to %H:%M', '%e %B %Y %H:%M', '-%H:%M'],
                        day: ['%e %B %Y', '%e %B', '-%e %B %Y'],
                        week: ['Week starting %e %B %Y', '%e %B', '-%e %B %Y'],
                        month: ['%B %Y', '%B', '-%B %Y'],
                        year: ['%Y', '%Y', '-%Y']
                    },
                    enabled: true,
                    //forced: false,
                    units: [['hour',[1]], ['day',[1]], ['week',[1]]]},
            },
            columnrange: {
                dataGrouping: {
                    dateTimeLabelFormats: {
                        hour: ['%e %B %Y hour to %H:%M', '%e %b %Y %H:%M', '-%H:%M'],
                        day: ['%e %B %Y', '%e %B', '-%e %B %Y'],
                        week: ['Week from %e %B %Y', '%e %B', '-%e %B %Y'],
                        month: ['%B %Y', '%B', '-%B %Y'],
                        year: ['%Y', '%Y', '-%Y']
                    },
                    enabled: true,
                    //forced: true,
                    units: [['day',[1]], ['week',[1]]]},
            },
            series: {states: {hover: {halo: {size: 0,}}}
            },
            scatter: {
                dataGrouping: {
                    dateTimeLabelFormats: {
                        hour: ['%e %B %Y hour to %H:%M', '%e %b %Y %H:%M', '-%H:%M'],
                        day: ['%e %b %Y', '%e %b', '-%e %b %Y'],
                        week: ['Week from %e %b %Y', '%e %b', '-%e %b %Y'],
                        month: ['%B %Y', '%B', '-%B %Y'],
                        year: ['%Y', '%Y', '-%Y']
                    },
                    enabled: true,
                    //forced: true,
                    units: [['hour',[1]], ['day',[1]], ['week',[1]]]
                },
                marker: {
                    radius: 1,
                    symbol: 'circle'
                },
                shadow: false,
                states: { hover: {halo: false,}}
            },
            spline: {
                dataGrouping: {
                    dateTimeLabelFormats: {
                        hour: ['%e %B %Y hour to %H:%M', '%e %b %Y %H:%M', '-%H:%M'],
                        day: ['%e %b %Y', '%e %b', '-%e %b %Y'],
                        week: ['Week from %e %b %Y', '%e %b', '-%e %b %Y'],
                        month: ['%B %Y', '%B', '-%B %Y'],
                        year: ['%Y', '%Y', '-%Y']
                    },
                    enabled: true,
                  //  forced: true,
                    units: [['hour',[1]], ['day',[1]], ['week',[1]]]
                },
                lineWidth: 1,
                marker: {
                    radius: 1,
                    enabled: false,
                    symbol: 'circle'
                },
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1,
                        lineWidthPlus: 1}}},
        },
        rangeSelector: {},
        series: [{}],
        tooltip: {
            valueDecimals: 1,
            crosshairs: true,
            enabled: true,
            followPointer: true,
            dateTimeLabelFormats: {
                minute: '%H:%M',
                hour: '%H:%M',
                day: ''
            },
            shared: true,
            split: false,
            valueSuffix: ''
        },
        xAxis: {
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b',
                month: '%b %y',
            },
            lineWidth: 1,
            minorGridLineWidth: 0,
            minorTickLength: 2,
            minorTickPosition: 'outside',
            minorTickWidth: 1,
            tickLength: 4,
            tickPosition: 'outside',
            tickWidth: 1,
            title: {},
            type: 'datetime',
        },
        yAxis: [{
            endOnTick: true,
            labels: {
                x: -4,
                y: 4,
            },
            lineWidth: 1,
            minorGridLineWidth: 0,
            minorTickLength: 2,
            minorTickPosition: 'outside',
            minorTickWidth: 1,
            opposite: false,
            showLastLabel: true,
            startOnTick: true,
            endOnTick: true,
            tickLength: 4,
            tickPosition: 'outside',
            tickWidth: 1,
            title: {text: ''}
            }, {
            labels: {
                x: 4,
                y: 4,
            },
            lineWidth: 1,
            minorGridLineWidth: 0,
            minorTickLength: 2,
            minorTickPosition: 'outside',
            minorTickWidth: 1,
            showLastLabel: true,
            opposite: true,
            startOnTick: true,
            endOnTick: true,
            tickLength: 4,
            tickPosition: 'outside',
            tickWidth: 1,
            title: {
                text: ''
            }
        }],
    };
    return commonOptions;
};

function remove_range_selector(chart){
    chart.update({
        rangeSelector: {enabled: false}
    });
};

function addWindRoseOptions(options, span, seriesData, units, plot_type, day_plots) {
    options.rangeSelector = {inputEnabled:false };
    options.rangeSelector.buttons = [{
        text: '24h',
        events: {click: function (e) {setTimeout(display_chart, 50, units, plot_type, ["weekly", windrosespans[0]], day_plots);return false;}}
    }, {
        text: windrosespans[1],
        events: {click: function (e) {setTimeout(display_chart, 50, units, plot_type, ["weekly", windrosespans[1]], day_plots);return false;}}
    }, {
        text: windrosespans[2],
        events: {click: function (e) {setTimeout(display_chart, 50, units, plot_type, ["yearly", windrosespans[2]], day_plots);return false;}}
    }, {
        text: windrosespans[3],
        events: {click: function (e) {setTimeout(display_chart, 50, units, plot_type, ["yearly", windrosespans[3]], day_plots);return false;}}
    }];
    options.rangeSelector.selected = 0;
    return options
};
    
function addWeekOptions(obj) {
    if (do_realtime) return obj;
    obj.rangeSelector.buttons = [{
        type: 'hour',
        count: 1,
        text: '1h'
    }, {
        type: 'hour',
        count: 6,
        text: '6h'
    }, {
        type: 'hour',
        count: 12,
        text: '12h'
    }, {
        type: 'hour',
        count: 24,
        text: '24h'
    }, {
        type: 'hour',
        count: 36,
        text: '36h'
    }, {
        type: 'all',
        text: '7d'
    }],
    obj.rangeSelector.selected = 3;
    obj.plotOptions.column.dataGrouping.enabled = false;
    obj.plotOptions.spline.dataGrouping.enabled = false;
    obj.plotOptions.scatter.dataGrouping.enabled = false;
    return obj
};

function addYearOptions(obj) {
    obj.rangeSelector.buttons = [{
        type: 'day',
        count: 1,
        text: '1d'
    }, {
        type: 'week',
        count: 1,
        text: '1w'
    }, {
        type: 'month',
        count: 1,
        text: '1m'
    }, {
        type: 'month',
        count: 6,
        text: '6m'
    }, {
        type: 'all',
        text: '1y'
    }],
    obj.rangeSelector.selected = 4;
    obj.plotOptions.spline.dataGrouping.enabled = false;
    obj.plotOptions.column.dataGrouping.enabled = false;
    obj.plotOptions.columnrange.dataGrouping.enabled = false;
    return obj
};

function custom_tooltip(tooltip, first_line) {
    var order = [], i, j, temp = [], points = tooltip.points;
    if (points == undefined) points = [tooltip.point];
    for(i=0; i < points.length; i++){
        j=0;
        if( order.length ){
            while( points[order[j]] && points[order[j]].y > points[i].y )
                j++;
        }
        temp = order.splice(0, j);
        temp.push(i);
        order = temp.concat(order);
    }
    if (first_line == "date")
       temp = '<span style="font-size: 10px">' + Highcharts.dateFormat('%e %B %Y %H:%M',new Date(tooltip.x)) + '</span><br/>';
    else
       temp = '<span style="font-size: 10px">' + first_line[tooltip.x] + '</span><br/>';
    $(order).each(function(i,j){
        temp += '<span style="color: '+points[j].series.color+'">' + points[j].series.name + ': ' + points[j].y + points[j].series.tooltipOptions.valueSuffix + '</span><br/>';
    });
    return temp;
};

function getTranslation(term){
    if (typeof translations == 'undefined') return term;
    if (translations.hasOwnProperty(term)) return translations[term];
    var parts = term.split(/([" ", "/"])/);
    var translation = "";
    for (var i = 0; i < parts.length; i++)
       translation += translations.hasOwnProperty(parts[i]) ? translations[parts[i]] : parts[i];
    return translation.length > 0 ? translation : term;
};

function create_chart_options(options, type, title, valueSuffix, values, first_line = "date"){
    var fields = ['name', 'type', 'yAxis', 'visible', 'showInLegend', 'tooltip'];
    options.series = [];
    options.chart.type = type;
    if (first_line != null)
        options.tooltip.formatter = function() {return custom_tooltip(this, first_line)};
    if (valueSuffix != null) options.tooltip.valueSuffix = valueSuffix;
    options.xAxis.minTickInterval = do_realtime ? 600000 : 900000;
    options.title = {text: getTranslation(title)};
    for (var i = 0; i < values.length; i++){
        options.series[i] = [];
        for (field in fields) options.series[i].push(field);
        for (var j = 0; j < fields.length; j++)
            if (values[i][j] != null)
                options.series[i][fields[j]] = (fields[j] == 'name' ? getTranslation(values[i][j]) : values[i][j]);  
    }
    return options;
};

function post_create_small_chart(chart, height){
    chart.update({
        exporting: {enabled: false },
        rangeSelector: {enabled: false},
        navigator: {enabled: false},
        scrollbar: {enabled: false},
        legend:{enabled:false },
        title: {text: ''}
    });
};

function reinflate_time(series){
    series[0][0] *= 1000; 
    for (var i = 1; i < series.length; i++)
        series[i][0] = series[0][0] + (series[i][0] * 1000);
    return series;
};

function setTempSmall(options) {
    options.chart.marginBottom = 20;
    options.yAxis[0].height = "110";
    $("#plot_div").css("height", 140);
    return options
};

function create_temperature_chart(options, span, seriesData, units){
     if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Temperature Dewpoint Ranges & Averages', '\xB0' + units.temp, [['Temperature Range', 'columnrange'],['Average Temperature','spline'],['Dewpoint Range', 'columnrange'],['Average Dewpoint', 'spline']]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.outTempminmax));
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.outTempaverage));
        options.series[2].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].dewpointplot.dewpointminmax));
        options.series[3].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].dewpointplot.dewpointaverage));
    }
    else if (span[0] == "weekly"){        
        options = create_chart_options(options, 'spline', 'Temperature Dewpoint', '\xB0' + units.temp, [['Temperature', 'spline'],['Dewpoint','spline'],['Feels', 'spline',, false, false]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.outTemp));
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.dewpoint));
        if ("appTemp" in seriesData[0].temperatureplot) {
           options.series[2].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.appTemp));
           options.series[2].visible = true;
           options.series[2].showInLegend = true;
        }
    }
    options.yAxis[0].title.text = "(\xB0" + units.temp + ")";
    options.yAxis[0].title.rotation = 0;
    options.yAxis[0].tickInterval = 10;
    return options;
};

function create_indoor_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Greenhouse Temperature Humidity Ranges & Averages', '\xB0' + units.temp, [['Temperature Range', 'columnrange'],['Average Temperature','spline'],['Humidity Range', 'columnrange', 1,,, {valueSuffix: '%'}],['Humidity', 'spline', 1,,,{valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.inTempminmax));
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.inTempaverage))
        options.series[2].data = reinflate_time(seriesData[0].humidityplot.inHumidityminmax);
        options.series[3].data = reinflate_time(seriesData[0].humidityplot.inHumidityaverage);
    }
    else if (span[0] == "weekly"){        
        options = create_chart_options(options, 'spline', 'Greenhouse Temperature Humidity', '\xB0' + units.temp, [['Temperature', 'spline'],['Humidity','spline', 1,,, {valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.inTemp));
        options.series[1].data = reinflate_time(seriesData[0].humidityplot.inHumidity);
    }
    options.yAxis[0].title.text = "(\xB0" + units.temp + ")";
    options.yAxis[1].title.text = "(%)";
    return options;
};

function create_tempall_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Temperature Dewpoint Humidity Ranges & Averages', '\xB0' + units.temp, [['Temp Range', 'columnrange'],['Average Temp','spline'],['Dewpoint Range', 'columnrange'],['Average Dewpoint','spline'],['Humidity Range', 'columnrange', 1,,, {valueSuffix: '%'}],['Humidity Avg', 'spline', 1,,,{valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.outTempminmax));
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.outTempaverage));
        options.series[2].data = convert_temp(seriesData[0].dewpointplot.units, units.temp, reinflate_time(seriesData[0].dewpointplot.dewpointminmax));
        options.series[3].data = convert_temp(seriesData[0].dewpointplot.units, units.temp, reinflate_time(seriesData[0].dewpointplot.dewpointaverage));
        options.series[4].data = reinflate_time(seriesData[0].humidityplot.outHumidityminmax);
        options.series[5].data = reinflate_time(seriesData[0].humidityplot.outHumidityaverage);
    }
    else if (span[0] == "weekly"){        
        options = create_chart_options(options, 'spline', 'Temperature Dewpoint Humidity', '\xB0' + units.temp, [['Temperature', 'spline'],['Dewpoint','spline'],['Humidity', 'spline', 1,,,{valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.outTemp));
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.dewpoint));
        options.series[2].data = reinflate_time(seriesData[0].humidityplot.outHumidity);
    }
    options.yAxis[0].title.text = "(\xB0" + units.temp + ")";
    options.yAxis[1].title.text = "(%)";
    options.yAxis[0].tickInterval = 10;
    options.yAxis[1].tickInterval = 10;
    return options;
};

function create_tempderived_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Windchill Heatindex Apparent Ranges & Averages', '\xB0' + units.temp, [['Windchill Range', 'columnrange'],['Average Windchill','spline'],['Heatindex Range', 'columnrange'],['Average Heatindex','spline'],['Apparent Range', 'columnrange',, false,false],['Apparent Avg', 'spline',, false,false]]);
        options.series[0].data = convert_temp(seriesData[0].windchillplot.units, units.temp, reinflate_time(seriesData[0].windchillplot.windchillminmax));
        options.series[1].data = convert_temp(seriesData[0].windchillplot.units, units.temp, reinflate_time(seriesData[0].windchillplot.windchillaverage));
        options.series[2].data = convert_temp(seriesData[0].windchillplot.units, units.temp, reinflate_time(seriesData[0].windchillplot.heatindexminmax));
        options.series[3].data = convert_temp(seriesData[0].windchillplot.units, units.temp, reinflate_time(seriesData[0].windchillplot.heatindexaverage));
        if ("appTempaverage" in seriesData[0].temperatureplot) {
            options.series[4].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.appTempminmax));
            options.series[5].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.appTempaverage));
        }
    }
    else if (span[0] == "weekly"){        
        options = create_chart_options(options, 'spline', 'Windchill HeatIndex Apparent', '\xB0' + units.temp, [['Windchill', 'spline'],['Heatindex','spline'],['Apparent', 'spline',,false,false]]);
        options.series[0].data = convert_temp(seriesData[0].windchillplot.units, units.temp, reinflate_time(seriesData[0].windchillplot.windchill));
        options.series[1].data = convert_temp(seriesData[0].windchillplot.units, units.temp, reinflate_time(seriesData[0].windchillplot.heatindex));
        if ("appTemp" in seriesData[0].temperatureplot)
            options.series[2].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.appTemp));
    }
    options.yAxis[0].title.text = "(\xB0" + units.temp + ")";
    options.yAxis[0].tickInterval = 10;
    return options;
};

function create_dewpoint_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Dewpoint Ranges & Averages', '\xB0' + units.temp, [['Dewpoint Range', 'columnrange'],['Dewpoint','spline']]);
        options.series[0].data = convert_temp(seriesData[0].dewpointplot.units, units.temp, reinflate_time(seriesData[0].dewpointplot.dewpointminmax));
        options.series[1].data = convert_temp(seriesData[0].dewpointplot.units, units.temp, reinflate_time(seriesData[0].dewpointplot.dewpointaverage));
    }
    else if (span[0] == "weekly"){                
        options = create_chart_options(options, 'spline', 'Dewpoint', '\xB0' + units.temp, [['Dewpoint', 'spline']]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.dewpoint));
    }
    options.yAxis[0].title.text = "(\xB0" + units.temp + ")";
    return options;
}

function create_humidity_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Humidity Ranges & Averages', null,[['Humidity Range', 'columnrange',,,,{valueSuffix: '%'}],['Average Humidity','spline',,,,{valueSuffix: '%'}]]);
        options.series[0].data = reinflate_time(seriesData[0].humidityplot.outHumidityminmax);
        options.series[1].data = reinflate_time(seriesData[0].humidityplot.outHumidityaverage);
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Humidity', null, [['Humidity', 'spline',,,,{valueSuffix: '%'}]]);
        options.series[0].data = reinflate_time(seriesData[0].humidityplot.outHumidity);
    }
    options.yAxis.min = 0;
    options.yAxis.max = 100;
    options.yAxis[0].minorTickInterval = 5;
    options.yAxis[0].tickInterval = 25;
    options.yAxis[0].title.text = "(" + seriesData[0].humidityplot.units + ")";
    return options;
}

function setBarSmall(obj) {
    obj.chart.marginBottom = 20;
    obj.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return obj
};

function create_barometer_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Barometer Ranges & Averages',units.pressure,[['Barometer Range', 'columnrange'],['Average Barometer','spline']]);
        options.series[0].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, reinflate_time(seriesData[0].barometerplot.barometerminmax));
        options.series[1].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, reinflate_time(seriesData[0].barometerplot.barometeraverage));
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Barometer', units.pressure, [['Barometer', 'spline']]);
        options.series[0].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, reinflate_time(seriesData[0].barometerplot.barometer));
    }
    options.yAxis[0].title.text = "(" + units.pressure + ")";
    return options;
};

function setWindSmall(options) {
    options.chart.marginBottom = 20;
    options.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return options;
};

function create_wind_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'area', 'Wind Speed Gust Max & Averages', units.wind,[['Wind Gust', 'area'],['Average Gust','area'],['Average Wind','area']]);
        options.series[0].data = convert_wind(seriesData[0].windplot.units, units.wind, reinflate_time(seriesData[0].windplot.windmax));
        options.series[1].data = convert_wind(seriesData[0].windplot.units, units.wind, reinflate_time(seriesData[0].windplot.windAvmax));
        options.series[2].data = convert_wind(seriesData[0].windplot.units, units.wind, reinflate_time(seriesData[0].windplot.windaverage));
    }
    else if (span[0] == "weekly"){
        if (do_realtime)
            options = create_chart_options(options, 'spline', 'Wind Speed', units.wind,[['Wind Speed', 'spline']]);
        else{
            options = create_chart_options(options, 'spline', 'Wind Speed Gust', units.wind,[['Wind Speed', 'spline'],['Wind Gust', 'spline']]);
            options.series[1].data = convert_wind(seriesData[0].windplot.units, units.wind, reinflate_time(seriesData[0].windplot.windGust));
        }
        options.series[0].data = convert_wind(seriesData[0].windplot.units, units.wind, reinflate_time(seriesData[0].windplot.windSpeed));
    }
    options.yAxis[0].min = 0;
    options.yAxis[0].title.text = "(" + units.wind + ")";
    return options;
};

function create_winddir_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'scatter', 'Wind Direction Average', null, [['Wind Direction Average', 'scatter']]);
        options.series[0].data = reinflate_time(seriesData[0].winddirplot.windDir);
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'scatter', 'Wind Direction', null, [['Wind Direction', 'scatter']]);
        options.series[0].data = reinflate_time(seriesData[0].winddirplot.windDir);
    }
    options.yAxis[0].title.text = "Direction";
    options.yAxis[0].tickPositioner = function(){var positions = [0,90,180,270,360]; return positions;};
    return options;
};

function create_windall_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'area', 'Wind Speed/Gust/Direction Max & Averages', units.wind,[['Max Wind Gust', 'area'],['Average Gust','area'],['Average Wind','area'],['Average Wind Direction', 'scatter',1,,,{valueSuffix: '\xB0'}]]);
        options.series[0].data = reinflate_time(convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windmax));
        options.series[1].data = reinflate_time(convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windAvmax));
        options.series[2].data = reinflate_time(convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windaverage));
        options.series[3].data = reinflate_time(seriesData[0].winddirplot.windDir);
    }
    else if (span[0] == "weekly"){
        if (do_realtime)
            options = create_chart_options(options, 'spline', 'Average Wind Speed/Gust/Direction', units.wind,[['Avg Wind Speed', 'spline'], ['Avg Wind Gust', 'spline'], ['Avg Wind Direction', 'scatter',1,,,{valueSuffix: '\xB0'}]]);
        else
            options = create_chart_options(options, 'scatter', 'Wind Speed/Gust/Direction', units.wind,[['Wind Speed', 'spline'],['Wind Gust', 'spline'],['Wind Direction', 'scatter',1,,,{valueSuffix: '\xB0'}]]);
        options.series[0].data = reinflate_time(convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windSpeed));
        options.series[1].data = reinflate_time(convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windGust));
        options.series[2].data = reinflate_time(seriesData[0].winddirplot.windDir);
    }
    options.tooltip.shared = false;
    options.yAxis[0].min = 0;
    options.yAxis[0].title.text = "(" + units.wind + ")";
    options.yAxis[1].title.text = "Direction";
    options.yAxis[1].tickPositioner = function(){var positions = [0,90,180,270,360]; return positions;};
    return options;
};

function setWindRose(options){
    options.legend= {
        align: 'right',
        verticalAlign: 'top',
        y: 100,
        layout: 'vertical',
        text: getTranslation('Wind Speed'),
        enabled: true
    };
    options.chart.polar = true;
    options.chart.type = 'column';
    options.chart.pane = {size: '100%'};
    options.title = {text: getTranslation('Wind Rose')};
    options.tooltip.split = false; 
    options.tooltip.shared = false;
    options.tooltip.valueSuffix ='%';
    options.xAxis.tickmarkPlacement = "on";
    options.yAxis= {
        lineWidth: 1,
        minorGridLineWidth: 0,
        minorTickLength: 2,
        minorTickWidth: 1,
        opposite: false,
        showLastLabel: true,
        startOnTick: true,
        tickLength: 4,
        tickWidth: 1,
    };
    options.yAxis.endOnTick = false;
    options.yAxis.title = {text: getTranslation('Frequency (%)')};
    options.yAxis.labels = {formatter: function () {return this.value + '%';}};
    options.yAxis.reversedStacks = false;
    options.plotOptions.series = {
            stacking: 'normal',
            shadow: false,
            groupPadding: 0,
            pointPlacement: 'on'
    };   
    return options
};

function create_windrose_chart(options, span, seriesData, units){
    Highcharts.setOptions({lang:{rangeSelectorZoom: ""}});
    if (!windrosespans.includes(span[1])) span[1] = windrosespans[0];
    if (span[1] == windrosespans[0]){
        convertlegend(seriesData[0].windroseDay.series, units);
        options.series = seriesData[0].windroseDay.series;
        options.xAxis.categories = seriesData[0].windroseDay.xAxis.categories;
    }
    else if (span[1] == windrosespans[1]){
        convertlegend(seriesData[0].windroseWeek.series, units);
        options.series = seriesData[0].windroseWeek.series;
        options.xAxis.categories = seriesData[0].windroseWeek.xAxis.categories;
    }
    else if (span[1] == windrosespans[2]){
        convertlegend(seriesData[0].windroseMonth.series, units);
        options.series = seriesData[0].windroseMonth.series;
        options.xAxis.categories = seriesData[0].windroseMonth.xAxis.categories;
    }
    else if (span[1] == windrosespans[3]){
        convertlegend(seriesData[0].windroseYear.series, units);
        options.series = seriesData[0].windroseYear.series;
        options.xAxis.categories = seriesData[0].windroseYear.xAxis.categories;
    }
    categories = options.xAxis.categories;
    options.title = {text: getTranslation("Wind Rose ") + span[1]};
    return options;
};

function convertlegend(series, units){
    for (var i = 0; i < series.length; i++){
        var percent = 0;
        var newName = "";
        var parts = series[i].name.split("-");
        for (var j = 0; j < parts.length; j++){
            newName += convert_wind(series[i].name.replace(/[0-9-.]/g,''), units['wind'], parseInt(parts[j]), 1);
            if (j + 1 < parts.length) newName += "-";
        }
        for (var j = 0; j < series[i].data.length; j++)
            percent += series[i].data[j];
        series[i].name = newName + " " + units['wind'] + " (" + percent.toFixed(1) + "%)";
    }
};
 
function post_create_windrose_chart(chart){
    chart.update({
        xAxis: {
            type: "category",
            categories: categories 
        },
        navigator: {enabled: false},
        scrollbar: {enabled: false}
    });
};

function setRainSmall(options) {
    options.chart.marginBottom = 20;
    options.yAxis[0].height = "170";
    $("#plot_div").css("height", 200);
    return options;
};

function create_rain_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'column', 'Rainfall', units.rain,[['Rainfall', 'column']]);
        options.series[0].data = convert_rain(seriesData[0].rainplot.units, units.rain, reinflate_time(seriesData[0].rainplot.rainsum));
        options.plotOptions.column.dataGrouping.dateTimeLabelFormats.hour = ['%e %B %Y', '%e %B %Y %H:%M', '-%H:%M'];
    }
    if (span[0] == "weekly"){
        options = create_chart_options(options, 'column', 'Rainfall', units.rain,[['Rainfall', 'column'], ['RainRate', 'column', 1]], null);
        options.series[0].data = convert_rain(seriesData[0].rainplot.units, units.rain, reinflate_time(seriesData[0].rainplot.rain));
        options.series[1].data = convert_rain(seriesData[0].rainplot.units, units.rain, reinflate_time(seriesData[0].rainplot.rainRate));
        options.yAxis[1].title.text = "(" + units.rain + ")";
        options.yAxis[1].min = 0;
        options.yAxis[1].tickInterval = 1;
        options.yAxis[1].allowDecimals = true;
    }
    options.plotOptions.column.dataGrouping.groupPixelWidth = 50;
    options.plotOptions.column.dataGrouping.enabled = true;
    options.plotOptions.column.marker = {enabled: false,};
    options.plotOptions.series.pointPadding = 0;
    options.plotOptions.series.groupPadding = 0;
    options.plotOptions.series.borderWidth = 0;
    options.yAxis[0].title.text = "(" + units.rain + ")";
    options.yAxis[0].min = 0;
    options.yAxis[0].tickInterval = 1;
    options.yAxis[0].allowDecimals = true;
    return options;
};

function create_rain_month_chart(options, span, seriesData, units){
    var data = convert_rain(seriesData[0].rainplot.units, units.rain, reinflate_time(seriesData[0].rainplot.rainsum));
    var index = 0;
    var month_data = [];
    var month_name = [];
    month_name[index] = getTranslation(monthNames[new Date(data[0][0]).getMonth()]);
    month_data[index] = data[0][1];
    for (var i = 1; i < data.length; i++){
        var new_month = getTranslation(monthNames[new Date(data[i][0]).getMonth()]);
        if (month_name[index] != new_month){
            index  +=1;
            month_name[index] = new_month;
            month_data[index] = data[i][1];
        }
        else
           month_data[index] +=  data[i][1];
    }
    options = create_chart_options(options, 'column', 'Monthly Rainfall', units.rain,[['Rainfall', 'column']], month_name);
    options.series[0].data = convert_rain(seriesData[0].rainplot.units, units.rain, month_data);
    options.plotOptions.column.dataGrouping.groupPixelWidth = 50;
    options.plotOptions.column.dataGrouping.enabled = true;
    options.plotOptions.column.marker = {enabled: false,};
    options.plotOptions.series.pointPadding = 0;
    options.plotOptions.series.groupPadding = 0;
    options.plotOptions.series.borderWidth = 0;
    options.yAxis[0].title.text = "(" + units.rain + ")";
    options.yAxis[0].min = 0;
    options.yAxis[0].tickInterval = 1;
    options.yAxis[0].allowDecimals = true;
    options.xAxis.minTickInterval =0;
    options.xAxis.type ='category';
    options.xAxis.labels = {formatter: function (){return month_name[this.value]}};
    return options;
};

function setRadSmall(options) {
    options.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return options;
};

function create_radiation_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'column', 'Max Solar Radiation','W/m\u00B2', [['Max Solar Radiation', 'column'], ["Average Solar Radiation", 'spline']]);
        options.series[0].data = reinflate_time(seriesData[0].radiationplot.radiationmax);
        options.series[1].data = reinflate_time(seriesData[0].radiationplot.radiationaverage);
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Solar Radiation','W/m\u00B2', [['Solar Radiation', 'spline'], ["Insolation", 'area',,false,false]]);
        options.series[0].data = reinflate_time(seriesData[0].radiationplot.radiation);
        if ("insolation" in seriesData[0].radiationplot) {
            options.series[1].data = reinflate_time(seriesData[0].radiationplot.insolation);
            options.series[1].visible = true;
            options.series[1].showInLegend = true;
        }
    }
    options.yAxis[0].min = 0;
    options.yAxis[0].title.text = "(" + seriesData[0].radiationplot.units + ")";
    return options;
};

function create_raduv_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'spline', 'Solar Radiation/UV Index Max & Avg', null, [['Solar Radiation Max', 'spline',,,,{valueSuffix: ' W/m\u00B2'}],['Solar Radiation Avg', 'spline',1,,,{valueSuffix: ' W/m\u00B2'}],["UV Index Max", 'spline',1],["UV Index Avg", 'spline',1]]);
        options.series[0].data = reinflate_time(seriesData[0].radiationplot.radiationmax);
        options.series[1].data = reinflate_time(seriesData[0].radiationplot.radiationaverage);
        options.series[2].data = reinflate_time(seriesData[0].uvplot.uvmax);
        options.series[3].data = reinflate_time(seriesData[0].uvplot.uvaverage);
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Solar Radiation UV Index', null, [['Solar Radiation', 'spline'], ['UV Index', 'spline',1], ["Insolation", 'area',,false,false]]);
        options.series[0].data = reinflate_time(seriesData[0].radiationplot.radiation);
        options.series[1].data = reinflate_time(seriesData[0].uvplot.uv);
        if ("insolation" in seriesData[0].radiationplot) {
            options.series[2].data = reinflate_time(seriesData[0].radiationplot.insolation);
            options.series[2].visible = true;
            options.series[2].showInLegend = true;
        }
    }
    options.yAxis[0].title.text = "(" + seriesData[0].radiationplot.units + ")";
    options.yAxis[1].title.text = "(" + seriesData[0].uvplot.units + ")";
    options.yAxis[0].min = 0;
    return options;
};

function setUvSmall(options) {
    options.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return options
};

function create_uv_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'column', 'UV Index Maximum & Average', null, [['UV Maximum Index', 'column'], ['UV Average Index', 'spline']]);
        options.series[0].data = reinflate_time(seriesData[0].uvplot.uvmax);
        options.series[1].data = reinflate_time(seriesData[0].uvplot.uvaverage);
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'UV Index', null, [['UV Index', 'spline']]);
        options.series[0].data = reinflate_time(seriesData[0].uvplot.uv);
    }
    options.yAxis[0].min = 0;
    options.yAxis[0].max = 20;
    options.yAxis[0].minorTickInterval = 1;
    options.yAxis[0].tickInterval = 4;
    options.yAxis[0].title.text = "(" + seriesData[0].uvplot.units + ")";
    return options;
};

function do_realtime_update(chart, plot_type, units){
    $.get(realtimefile, function(data) {
        if (!do_realtime) return;
        for (var j = 0; j < realtimeplot[plot_type][0].length; j++)
            if (chart.series[j].data.length > realtimeinterval*realtimeXscaleFactor)
                chart.series[j].setData(chart.series[j].data.slice(-realtimeinterval*realtimeXscaleFactor));
        var parts = data.split(" ");
        var tparts = (parts[0]+" "+parts[1]).match(/(\d{2})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
        var x = Date.UTC(+"20"+tparts[3],tparts[2]-1,+tparts[1],+tparts[4],+tparts[5],+tparts[6])-(utcoffset*60000);
        for (var j = 0; j < realtimeplot[plot_type][0].length; j++)
            if (realtimeplot[plot_type][2][j] == null)
                chart.series[j].addPoint([x, parseFloat(parts[realtimeplot[plot_type][0][j]])], true, true);
            else
                chart.series[j].addPoint([x, parseFloat(window[realtimeplot[plot_type][2][j]](parts[realtimeplot[plot_type][1][j]],units[realtimeplot[plot_type][2][j].split("_")[1]],parts[realtimeplot[plot_type][0][j]]))], true, true);
        setTimeout(do_realtime_update, realtimeinterval*1000, chart, plot_type, units);
    });
};

function do_auto_update(units, plot_type, span, buttonReload, day_plots){       
    if (buttonReload){
        display_chart(units, plot_type, span, day_plots);
        return;
    }
    auto_update = do_realtime ? false : !auto_update;
    for (var i = 0; i < buttons.length;i++)
       if (buttons[i].hasOwnProperty("text") && buttons[i].text.indexOf("Auto") == 0)
           buttons[i].text = "Auto Update Chart " + (auto_update ? "ON" : "OFF");
    if (auto_update)
        display_chart(units, plot_type, span, day_plots);
}

function setup_plots(seriesData, units, options, plot_type, span, day_plots){
    utcoffset = seriesData[0].utcoffset;
    Highcharts.setOptions({global:{timezoneOffset: - utcoffset,}});
    for (var i = 0; i < (span[0] == "weekly" ? createweeklyfunctions[plot_type].length : createyearlyfunctions[plot_type].length); i++)
       options = (span[0] == "weekly" ? createweeklyfunctions[plot_type][i](options, span, seriesData, units, plot_type, day_plots) : createyearlyfunctions[plot_type][i](options, span, seriesData, units, plot_type, day_plots));
    return options
};

function display_chart(units, plot_type, span, day_plots = false){
    if (!Array.isArray(span)) span = [span];
    console.log(units, plot_type, span);
    var results, files = [];
    if (!jsonfileforplot.hasOwnProperty(plot_type) || !(span[0] == "weekly" || span[0] == "yearly")){alert("Bad plot_type (" + plot_type + ") or span (" + span[0] + ")"); return};
    for (var i = 0; i < jsonfileforplot[plot_type][span[0] == "weekly" ? 0 : 1].length; i++)
        files[i] = (day_plots ? pathjsondayfiles : pathjsonfiles) + jsonfileforplot[plot_type][span[0] == "weekly" ? 0 : 1][i];
    if (buttons == null){
        function callback(units, plot_type, span, buttonReload, day_plots){return function(){do_realtime = false;do_auto_update(units, plot_type, span, buttonReload, false)}}
        function realtime_callback(){return function(){if (do_realtime) return;do_realtime=true;auto_update=false;display_chart(units, realtimeplot[plot_type][3], 'weekly', false)}}
        buttons = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;
        buttons.push({text: "Reload Chart", onclick: callback(units, plot_type, span, true, day_plots)});
        buttons.push({text: "Auto Update Chart OFF", onclick: callback(units, plot_type, span, false, day_plots)});
        if (realtimeplot.hasOwnProperty(plot_type))
            buttons.push({text: "Realtime Update", onclick: realtime_callback()});
    }
    jQuery.getMultipleJSON(...files).done(function(...results){
        var options = setup_plots(results.flat(), units, create_common_options(), plot_type, span, day_plots);
        if (day_plots) options.rangeSelector.selected = 5;
        chart = new Highcharts.StockChart(options,function(chart){setTimeout(function(){$('input.highcharts-range-selector',$('#'+chart.options.chart.renderTo)).datepicker()},0)});
        if (do_realtime){
            remove_range_selector(chart);           
            for (var j =0; j < realtimeplot[plot_type][0].length; j++)
                chart.series[j].setData(options.series[j].data.slice(-realtimeinterval*realtimeXscaleFactor));
            setTimeout(do_realtime_update, 50, chart, plot_type, units);
            return;
        }
        if (!plotsnoswitch.includes(plot_type)){
            for (var i = 0; i < chart.series.length; i++){
                chart.series[i].update({
                    cursor: 'pointer',
                    point: {
                       events: {click: function(e){
                            if (day_plots) 
                                setTimeout(display_chart, 50, units, plot_type, ['weekly']); 
                            else if (span[0] == 'yearly')
                                window.location.href= dayplotsurl+"?units="+units.temp+","+units.pressure+","+units.wind+","+units.rain+"&plot_type="+plot_type+","+pathjsondayfiles+jsonfileforplot[plot_type][0]+","+weereportcmd+"&epoch="+this.x/1000
                            else
                                setTimeout(display_chart, 50, units, plot_type, ['yearly'])}}
                    }
                });
            }
            return;
        }
        if (postcreatefunctions.hasOwnProperty(plot_type))
            for (var i = 0; i < postcreatefunctions[plot_type].length; i++)
                postcreatefunctions[plot_type][i](chart);
    }).fail(function(){
        $("#plot_div").load("../404.html");
        return;
    });
    if (auto_update)
        setTimeout(display_chart, autoupdateinterval*1000, units, plot_type, span, day_plots);
};
