/*****************************************************************************

Javascript to setup, configure and display Highcharts plots of weewx weather data.

Based on Highcharts documentation and examples, and a lot of Stackoverflow Q&As.

Key points:
    -   displays week and year plots
    -   week plot displays 7+ days of archive data in a Highstocks spline plot
        with a zoomable window (default 24 hours)
    -   year plot displays last 12 months of daily summary data in a
        Highstocks columnrange plot with a zoomable window (default 1 month).
        Plots show day min/max range in a column and day averages in one or
        more spline plots.
    -   requires JSON data feed from Highcharts for weewx extension
    -   requires Highstocks
    -   units of measure are set in Highcharts for weewx supplied through the
        JSON data files

History
    v1.0.0      June 2019
        -  large rewrite to support w34 type charts
    v0.2.2      4 September 2018
        - version number change only
    v0.2.0      4 May 2017
        - ignores appTemp and insolation plots if no relevant data is available
    v0.1.0      22 November 2016
        - initial implementation

*****************************************************************************/
var createweeklyfunctions = {
    temperatureplot: [addWeekOptions, create_temperature_chart],
    indoorplot: [addWeekOptions, create_indoor_chart],
    tempallplot: [addWeekOptions, create_tempall_chart],
    tempderivedplot: [addWeekOptions, create_tempderived_chart],
    humidityplot: [addWeekOptions, create_humidity_chart],
    barometerplot: [addWeekOptions, create_barometer_chart],
    dewpointplot: [addWeekOptions, create_dewpoint_chart],
    windplot: [addWeekOptions, create_wind_chart],
    winddirplot: [addWeekOptions, create_winddir_chart],
    windroseplot: [addWindRoseOptions, setWindRose, create_windrose_chart],
    rainplot: [addWeekOptions, create_rain_chart],
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
    windroseplot: [addWindRoseOptions, setWindRose, create_windrose_chart],
    rainplot: [addYearOptions, create_rain_chart],
    rainsmallplot: [addYearOptions, setRainSmall, create_rain_chart],
    radiationplot: [addYearOptions, create_radiation_chart],
    raduvplot: [addYearOptions, create_raduv_chart],
    radsmallplot: [addYearOptions, setRadSmall, create_radiation_chart],
    uvplot: [addYearOptions, create_uv_chart],
    uvsmallplot: [addYearOptions, setUvSmall, create_uv_chart]
};

var postcreatefunctions={
    tempsmallplot: [post_create_small_chart],
    barsmallplot: [post_create_small_chart],
    windsmallplot: [post_create_small_chart],
    rainsmallplot: [post_create_small_chart],
    radsmallplot: [post_create_small_chart],
    uvsmallplot: [post_create_small_chart],
    windroseplot: [post_create_windrose_chart]
};

var jsonfileforplot={
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
    winddirplot: [['wind_week.json'],['year.json']],
    windroseplot: [['wind_week.json'],['year.json']],
    rainplot: [['bar_rain_week.json'],['year.json']],
    rainsmallplot: [['bar_rain_week.json'],['year.json']],
    radiationplot: [['solar_week.json'],['year.json']],
    raduvplot: [['solar_week.json'],['year.json']],
    radsmallplot: [['solar_week.json'],['year.json']],
    uvplot: [['solar_week.json'],['year.json']],
    uvsmallplot: [['solar_week.json'],['year.json']]
};

var pathjsonfiles = '../../weewx/json/';
var windrosespans = ["24h","Week","Month","Year"];
var categories;
var chart;

/*****************************************************************************

Read multiple json files at the same time found at this URL
https://stackoverflow.com/questions/19026331/call-multiple-json-data-files-in-one-getjson-request

*****************************************************************************/
jQuery.getMultipleJSON = function(){
  return jQuery.when.apply(jQuery, jQuery.map(arguments, function(jsonfile){
    return jQuery.getJSON(jsonfile);
  })).then(function(){
    var def = jQuery.Deferred();
    return def.resolve.apply(def, jQuery.map(arguments, function(response){
      return response[0];}));
    });
};

/*****************************************************************************

Set default plot options

These are common plot options across all plots. Change them by all means but
make sure you know what you are doing. The Highcharts API documentation is
your reference.

*****************************************************************************/
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
                forced: false,
                units: [[
                    'hour',
                        [1]
                    ], [
                    'day',
                        [1]
                    ], [
                    'week',
                        [1]
                    ]
                ]
            },
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
                forced: true,
                units: [[
                    'day',
                        [1]
                    ], [
                    'week',
                        [1]
                    ]
                ]
            },
        },
        series: {
            states: {
                hover: {
                    halo: {
                        size: 0,
                    }
                }
            }
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
                forced: true,
                units: [[
                    'hour',
                        [1]
                    ], [
                    'day',
                        [1]
                    ], [
                    'week',
                        [1]
                    ]
                ]
            },
            marker: {
                radius: 1,
                symbol: 'circle'
            },
            shadow: false,
            states: {
                hover: {
                    halo: false,
                }
            }
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
                forced: true,
                units: [[
                    'hour',
                        [1]
                    ], [
                    'day',
                        [1]
                    ], [
                    'week',
                        [1]
                    ]
                ]
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
                    lineWidthPlus: 1
                }
            }
        },
    },
    rangeSelector: {},
    series: [{}],
    tooltip: {
        crosshairs: true,
        enabled: true,
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
        title: {
        },
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
        title: {
            text: ''
            }
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
        opposite: false,
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

function clone(obj) {
/*****************************************************************************

Function to clone an object

As found at http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object

*****************************************************************************/
    var copy;
    // Handle the 3 simple types, and null or undefined
    if (null === obj || 'object' !== typeof obj) {
        return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = clone(obj[attr]);
            }
        }
        return copy;
    }
    throw new Error('Unable to copy obj! Its type isn\'t supported.');
};

function addWindRoseOptions(options, span, seriesData, units, plot_type, cb_func) {
/*****************************************************************************

Function to add/set various plot options specific to the 'wind rose' plot.

*****************************************************************************/
    options.rangeSelector = {inputEnabled:false };
    options.rangeSelector.buttons = [{
        text: '24h',
        events: {click: function (e) {setTimeout(display_chart, 50, units, plot_type, cb_func, ["weekly", windrosespans[0]]);return false;}}
    }, {
        text: windrosespans[1],
        events: {click: function (e) {setTimeout(display_chart, 50, units, plot_type, cb_func, ["weekly", windrosespans[1]]);return false;}}
    }, {
        text: windrosespans[2],
        events: {click: function (e) {setTimeout(display_chart, 50, units, plot_type, cb_func, ["yearly", windrosespans[2]]);return false;}}
    }, {
        text: windrosespans[3],
        events: {click: function (e) {setTimeout(display_chart, 50, units, plot_type, cb_func, ["yearly", windrosespans[3]]);return false;}}
    }];
    options.plotOptions.column.dataGrouping.enabled = false;
    return options
};
    
function addWeekOptions(obj) {
/*****************************************************************************

Function to add/set various plot options specific to the 'week' plot.

*****************************************************************************/
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
/*****************************************************************************

Function to add/set various plot options specific to the 'year' plot.

*****************************************************************************/
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
    obj.rangeSelector.selected = 2;
    obj.plotOptions.spline.dataGrouping.enabled = false;
    obj.plotOptions.column.dataGrouping.enabled = false;
    obj.plotOptions.columnrange.dataGrouping.enabled = false;
    return obj
};

function custom_tooltip(tooltip) {
    var order = [], i, j, temp = [], points = tooltip.points;
    for(i=0; i<points.length; i++){
        j=0;
        if( order.length ){
            while( points[order[j]] && points[order[j]].y > points[i].y )
                j++;
        }
        temp = order.splice(0, j);
        temp.push(i);
        order = temp.concat(order);
    }
    temp = '<span style="font-size: 10px">' + Highcharts.dateFormat('%e %B %Y %H:%M',new Date(tooltip.x)) + '</span><br/>';
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

function create_chart_options(options, type, title, values){
    var fields = ['name', 'type', 'yAxis', 'visible', 'showInLegend', 'tooltip'];
    options.series = [];
    options.chart.type = type;
    if (type == 'columnrange')
        options.tooltip.positioner = function(labelWidth, labelHeight, point){var tooltipX = point.plotX + 20; var tooltipY = point.plotY - 30;return {x: tooltipX,y: tooltipY}};
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

function setTempSmall(options) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline temperature plots

*****************************************************************************/
    options.chart.marginBottom = 20;
    options.yAxis[0].height = "110";
    $("#plot_div").css("height", 140);
    return obj
};

function create_temperature_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create temperature chart

*****************************************************************************/
     if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Temperature Dewpoint', [['Temperature Range', 'columnrange'],['Average Temperature','spline'],['Dewpoint Range', 'columnrange'],['Average Dewpoint', 'spline']]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.outTempminmax);
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.outTempaverage);
        options.series[2].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].dewpointplot.dewpointminmax);
        options.series[3].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].dewpointplot.dewpointaverage);
    }
    else if (span[0] == "weekly"){        
        options = create_chart_options(options, 'spline', 'Temperature Dewpoint', [['Temperature', 'spline'],['Dewpoint','spline'],['Feels', 'spline',, false, false]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.outTemp).data;
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.dewpoint).data;
        if ("appTemp" in seriesData[0].temperatureplot.series) {
           options.series[2].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.appTemp).data;
           options.series[2].visible = true;
           options.series[2].showInLegend = true;
        }
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};    
    options.tooltip.valueDecimals = 1;
    options.tooltip.valueSuffix = units.temp;
    options.yAxis[0].title.text = "(" + units.temp + ")";
    options.yAxis[0].title.rotation = 0;
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    options.yAxis[0].tickInterval = 10;
    return options;
};

function create_indoor_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create indoor temperature chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Greenhouse Temperature Humidity', [['Temperature Range', 'columnrange'],['Average Temperature','spline'],['Humidity Range', 'columnrange', 1,,, {valueSuffix: '%'}],['Humidity', 'spline', 1,,,{valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.inTempminmax);
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.inTempaverage)
        options.series[2].data = seriesData[0].humidityplot.inHumidityminmax;
        options.series[3].data = seriesData[0].humidityplot.inHumidityaverage;
    }
    else if (span[0] == "weekly"){        
        options = create_chart_options(options, 'spline', 'Greenhouse Temperature Humidity', [['Temperature', 'spline'],['Humidity','spline', 1,,, "%"]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.inTemp).data;
        options.series[1].data = seriesData[0].humidityplot.series.inHumidity.data;
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};    
    options.tooltip.valueDecimals = 1;
    options.tooltip.valueSuffix = units.temp;
    options.yAxis[0].title.text = "(" + units.temp + ")";
    options.yAxis[1].title.text = "(%)";
    options.yAxis[0].title.rotation = 0;
    options.yAxis[1].title.rotation = 0;
    options.yAxis[1].opposite = true;
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
};

function create_tempall_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create temperature chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Temperature Dewpoint Humidity Ranges & Averages', [['Temp Range', 'columnrange'],['Average Temp','spline'],['Dewpoint Range', 'columnrange'],['Average Dewpoint','spline'],['Humidity Range', 'columnrange', 1,,, {valueSuffix: '%'}],['Humidity Avg', 'spline', 1,,,{valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.outTempminmax);
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.outTempaverage);
        options.series[2].data = convert_temp(seriesData[0].dewpointplot.units, units.temp, seriesData[0].dewpointplot.dewpointminmax);
        options.series[3].data = convert_temp(seriesData[0].dewpointplot.units, units.temp, seriesData[0].dewpointplot.dewpointaverage);
        options.series[4].data = seriesData[0].humidityplot.outHumidityminmax;
        options.series[5].data = seriesData[0].humidityplot.outHumidityaverage;
        options.yAxis[0].height = "150";
        options.yAxis[1].labels = {x: 16, y: 4};
    }
    else if (span[0] == "weekly"){        
        options = create_chart_options(options, 'spline', 'Temperature Dewpoint Humidity', [['Temperature', 'spline'],['Dewpoint','spline'],['Humidity', 'spline', 1,,,{valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.outTemp).data;
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.dewpoint).data;
        options.series[2].data = seriesData[0].humidityplot.series.outHumidity.data;
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};
    options.tooltip.valueDecimals = 1;
    options.tooltip.valueSuffix = units.temp;
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    options.yAxis[0].title.text = "(" + units.temp + ")";
    options.yAxis[1].title.text = "(%)";
    options.yAxis[0].tickInterval = 10;
    options.yAxis[1].tickInterval = 10;
    options.yAxis[1].opposite = true;
    return options;
};

function create_tempderived_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create temperature chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Windchill Heatindex Apparent Ranges & Averages', [['Windchill Range', 'columnrange'],['Average Windchill','spline'],['Heatindex Range', 'columnrange'],['Average Heatindex','spline'],['Apparent Range', 'columnrange',, false,false],['Apparent Avg', 'spline',, false,false]]);
        options.series[0].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.windchillminmax);
        options.series[1].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.windchillaverage);
        options.series[2].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.heatindexminmax);
        options.series[3].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.heatindexaverage)
        //options.series[4].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.appTempminmax);
        //options.series[5].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.appTempaverage);
        options.yAxis[0].height = "150";
    }
    else if (span[0] == "weekly"){        
        options = create_chart_options(options, 'spline', 'Windchill HeatIndex Apparent', [['Windchill', 'spline'],['Heatindex','spline'],['Apparent', 'spline',,false,false]]);
        options.series[0].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.series.windchill).data;
        options.series[1].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.series.heatindex).data;
        //options.series[2].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.appTemp).data;
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};    
    options.tooltip.valueDecimals = 1;
    options.tooltip.valueSuffix = units.temp;
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    options.yAxis[0].title.text = "(" + units.temp + ")";
    options.yAxis[0].tickInterval = 10;
    return options;
};

function create_dewpoint_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create dewpoint chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Dewpoint Ranges & Averages', [['Dewpoint Range', 'columnrange'],['Dewpoint','spline']]);
        options.series[0].data = convert_temp(seriesData[0].dewpointplot.units, units.temp, seriesData[0].dewpointplot.dewpointminmax);
        options.series[1].data = convert_temp(seriesData[0].dewpointplot.units, units.temp, seriesData[0].dewpointplot.dewpointaverage);
    }
    else if (span[0] == "weekly"){                
        options = create_chart_options(options, 'spline', 'Dewpoint', [['Dewpoint', 'spline']]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.dewpoint).data;
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};    
    options.yAxis[0].title.text = "(" + units.temp + ")";
    options.tooltip.valueSuffix = units.temp;
    options.tooltip.valueDecimals = 1;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    options.xAxis.minTickInterval = 900000;
    return options;
}

function create_humidity_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create humidity chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Humidity Ranges & Averages', [['Humidity Range', 'columnrange',,,,{valueSuffix: '%'}],['Average Humidity','spline',,,,{valueSuffix: '%'}]]);
        options.series[0].data = seriesData[0].humidityplot.outHumidityminmax;
        options.series[1].data = seriesData[0].humidityplot.outHumidityaverage;
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Humidity', [['Humidity', 'spline',,,,{valueSuffix: '%'}]]);
        options.series[0].data = seriesData[0].humidityplot.series.outHumidity.data;
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};
    options.tooltip.valueDecimals = 1;
    options.yAxis.min = 0;
    options.yAxis.max = 100;
    options.yAxis[0].minorTickInterval = 5;
    options.yAxis[0].tickInterval = 25;
    options.yAxis[0].title.text = "(" + seriesData[0].humidityplot.units + ")";
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function setBarSmall(obj) {
/*****************************************************************************

Function to do small barometer chart

*****************************************************************************/
    obj.chart.marginBottom = 20;
    obj.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return obj
};

function create_barometer_chart(options, span, seriesData, units, plot_type){
/*****************************************************************************

Function to create barometer chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Barometer Ranges & Averages', [['Barometer Range', 'columnrange'],['Average Barometer','spline']]);
        options.series[0].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, seriesData[0].barometerplot.barometerminmax);
        options.series[1].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, seriesData[0].barometerplot.barometeraverage);
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Barometer', [['Barometer', 'spline']]);
        options.series[0].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, seriesData[0].barometerplot.series.barometer).data;
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};
    options.tooltip.valueDecimals = 1;
    options.yAxis[0].title.text = "(" + units.pressure + ")";
    options.tooltip.valueSuffix = units.pressure;
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function setWindSmall(options) {
/*****************************************************************************

Function to do wind small chart

*****************************************************************************/
    options.chart.marginBottom = 20;
    options.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return options;
};

function create_wind_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create wind chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'area', 'Wind Speed Gust Max & Averages', [['Wind Gust', 'area'],['Average Gust','area'],['Average Wind','area']]);
        options.series[0].data = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windmax);
        options.series[1].data = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windAvmax);
        options.series[2].data = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windaverage);
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Wind Speed Gust', [['Wind Speed', 'spline'],['Wind Gust', 'spline']]);
        options.series[0].data = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.series.windSpeed).data;
        options.series[1].data = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.series.windGust).data;
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};
    options.tooltip.valueDecimals = 1;
    options.tooltip.valueSuffix = units.wind;
    options.yAxis[0].min = 0;
    options.yAxis[0].title.text = "(" + units.wind + ")";
    options.yAxis[0].tickInterval = 10;
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function create_winddir_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create wind direction chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'scatter', 'Wind Direction Average', [['Wind Direction Average', 'scatter']]);
        options.series[0].data = seriesData[0].winddirplot.windDir;
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'scatter', 'Wind Direction', [['Wind Direction', 'scatter']]);
        options.series[0].data = seriesData[0].winddirplot.series.windDir.data;
    }
    options.plotOptions.series = { marker: { radius: 2}};
    options.series.marker = { lineWidth: 0, radius: 10 };
    options.tooltip.headerFormat = '<span style="font-size: 10px">{point.key}</span><br/>'
    options.tooltip.pointFormat = '<span style="color: {series.color}">●</span> {series.name}: <b>{point.y}</b>'
    options.tooltip.valueSuffix = '\u00B0'
    options.tooltip.xDateFormat = '%e %B %Y %H:%M';
    options.tooltip.valueDecimals = 1;
    options.tooltip.xDateFormat = '%e %B %Y';
    options.yAxis[0].min = 0;
    options.yAxis[0].max = 360;
    options.yAxis[0].tickInterval = 90;
    options.yAxis[0].title.text = "(" + units.wind + ")";
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function setWindRose(options){
/*****************************************************************************

Function to add/set various plot options specific to wind rose plots

*****************************************************************************/
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
/*****************************************************************************

Function to create wind rose chart

*****************************************************************************/
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
/*****************************************************************************

Function to convert wind rose legend display units

*****************************************************************************/
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
}
 
function post_create_windrose_chart(chart){
/*****************************************************************************

Function to post create for wind rose chart

*****************************************************************************/
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
/*****************************************************************************

Function to add small rain chart

*****************************************************************************/
    options.chart.marginBottom = 20;
    options.yAxis[0].height = "170";
    $("#plot_div").css("height", 200);
    return options;
};

function create_rain_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create rain chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'column', 'Rainfall', [['Rainfall', 'column']]);
        options.series[0].data = convert_rain(seriesData[0].rainplot.units, units.rain, seriesData[0].rainplot.rainsum);
        options.plotOptions.column.dataGrouping.dateTimeLabelFormats.hour = ['%e %B %Y', '%e %B %Y %H:%M', '-%H:%M'];
        options.tooltip.xDateFormat = '%e %B %Y';
    }
    if (span[0] == "weekly"){
        options = create_chart_options(options, 'column', 'Rainfall', [['Rainfall', 'column']]);
        options.series[0].data = convert_rain(seriesData[0].rainplot.units, units.rain, seriesData[0].rainplot.series.rain).data;
        options.tooltip.xDateFormat = '%e %B %Y hour to %H:%M';
    }
    options.plotOptions.column.dataGrouping.groupPixelWidth = 50;
    options.plotOptions.column.dataGrouping.enabled = true;
    options.plotOptions.column.marker = {enabled: false,};
    options.plotOptions.series.pointPadding = 0;
    options.plotOptions.series.groupPadding = 0;
    options.plotOptions.series.borderWidth = 0;
    options.tooltip.formatter = function() {return custom_tooltip(this)};
    options.tooltip.valueSuffix = units.rain;
    options.tooltip.valueDecimals = 1;
    options.yAxis[0].title.text = "(" + units.rain + ")";
    options.yAxis[0].min = 0;
    options.yAxis[0].tickInterval = 1;
    options.yAxis[0].allowDecimals = true;
    options.yAxis[0].labels = { format: '{value:.0f}'};
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    options.xAxis.minTickInterval = 900000;
    return options;
}

function setRadSmall(options) {
/*****************************************************************************

Function to add small radition chart

*****************************************************************************/
    options.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return options;
};

function create_radiation_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create radiation chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'column', 'Max Solar Radiation', [['Max Solar Radiation', 'column'], ["Average Solar Radiation", 'spline']]);
        options.series[0].data = seriesData[0].radiationplot.radiationmax;
        options.series[1].data = seriesData[0].radiationplot.radiationaverage;
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Solar Radiation', [['Solar Radiation', 'spline'], ["Insolation", 'area',,false,false]]);
        options.series[0].data = seriesData[0].radiationplot.series.radiation.data;
        if ("insolation" in seriesData[0].radiationplot.series) {
            options.series[1] = seriesData[0].radiationplot.series.insolation;
            options.series[1].type = 'area';
            options.series[1].visible = true;
            options.series[1].showInLegend = true;
        }
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};
    options.tooltip.valueSuffix = 'W/m\u00B2';
    options.yAxis[0].min = 0;
    options.yAxis[0].title.text = "(" + seriesData[0].radiationplot.units + ")";
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function create_raduv_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create radiation chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'spline', 'Solar Radiation/UV Index Max & Avg', [['Solar Radiation Max', 'spline',,,,{valueSuffix: ' W/m\u00B2'}],['Solar Radiation Avg', 'spline',1,,,{valueSuffix: ' W/m\u00B2'}],["UV Index Max", 'spline',1],["UV Index Avg", 'spline',1]]);
        options.series[0].data = seriesData[0].radiationplot.radiationmax;
        options.series[1].data = seriesData[0].radiationplot.radiationaverage;
        options.series[2].data = seriesData[0].uvplot.uvmax;
        options.series[3].data = seriesData[0].uvplot.uvaverage;
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'Solar Radiation UV Index', [['Solar Radiation', 'spline'], ['UV Index', 'spline',1], ["Insolation", 'area',,false,false]]);
        options.series[0].data = seriesData[0].radiationplot.series.radiation.data;
        options.series[1].data = seriesData[0].uvplot.series.uv.data;
        if ("insolation" in seriesData[0].radiationplot.series) {
            options.series[2].data = seriesData[0].radiationplot.series.insolation.data;
            options.series[2].visible = true;
            options.series[2].showInLegend = true;
        }
    }
    options.tooltip.formatter = function() {return custom_tooltip(this)};
    options.yAxis[0].title.text = "(" + seriesData[0].radiationplot.units + ")";
    options.yAxis[1].title.text = "(" + seriesData[0].uvplot.units + ")";
    options.yAxis[1].opposite = true;
    options.yAxis[0].min = 0;
    options.xAxis.minTickInterval = 900000;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function setUvSmall(options) {
/*****************************************************************************

Function to add small uv chart

*****************************************************************************/
    options.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return options
};

function create_uv_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create uv chart

*****************************************************************************/
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'column', 'UV Index Maximum & Average', [['UV Maximum Index', 'column'], ['UV Average Index', 'spline']]);
        options.series[0].data = seriesData[0].uvplot.uvmax;
        options.series[1].data = seriesData[0].uvplot.uvaverage;
    }
    else if (span[0] == "weekly"){
        options = create_chart_options(options, 'spline', 'UV Index', [['UV Index', 'spline']]);
        options.series[0].data = seriesData[0].uvplot.series.uv.data;
    }
    options.tooltip.valueDecimals = 1;
    options.tooltip.formatter = function() {return custom_tooltip(this)};
    options.yAxis[0].min = 0;
    options.yAxis[0].max = 20;
    options.yAxis[0].minorTickInterval = 1;
    options.yAxis[0].tickInterval = 4;
    options.yAxis[0].title.text = "(" + seriesData[0].uvplot.units + ")";
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    options.xAxis.minTickInterval = 900000;
    Highcharts.setOptions({ global: { timezoneOffset: -seriesData[0].utcoffset,}});
    return options;
}

function setup_plots(seriesData, units, options, plot_type, cb_func, span){
/*****************************************************************************

Function to add/set various weekly plot options specific to the 'week' plot.

*****************************************************************************/
    Highcharts.setOptions({lang:{rangeSelectorZoom: (plot_type == 'windroseplot' ? "" : "Zoom")}});
    for (var i = 0; i < (span[0] == "weekly" ? createweeklyfunctions[plot_type].length : createyearlyfunctions[plot_type].length); i++)
       options = (span[0] == "weekly" ? createweeklyfunctions[plot_type][i](options, span, seriesData, units, plot_type, cb_func) : createyearlyfunctions[plot_type][i](options, span, seriesData, units, plot_type, cb_func));
    return options
};

function display_chart(units, plot_type, cb_func, span){
/*****************************************************************************

Function to display weekly or yearly charts

*****************************************************************************/
    if (!Array.isArray(span)) span = [span];
    console.log(units, plot_type, cb_func, span);
    var results, files = [];
    for (var i = 0; i < jsonfileforplot[plot_type][span[0] == "weekly" ? 0 : 1].length; i++)
        files[i] = pathjsonfiles + jsonfileforplot[plot_type][span[0] == "weekly" ? 0 : 1][i];
    jQuery.getMultipleJSON(...files).done(function(...results){
        var options = setup_plots(results.flat(), units, clone(commonOptions), plot_type, cb_func, span);
        chart = new Highcharts.StockChart(options,function(chart){setTimeout(function(){$('input.highcharts-range-selector',$('#'+chart.options.chart.renderTo)).datepicker()},0)});
        if (cb_func != null){
            for (var i = 0; i < chart.series.length; i++){
                chart.series[i].update({
                    cursor: 'pointer',
                    point: {
                       events: {click: function(e){cb_func(e);}}
                    }
                });
            }
        }       
        if (postcreatefunctions.hasOwnProperty(plot_type))
            for (var i = 0; i < postcreatefunctions[plot_type].length; i++)
                postcreatefunctions[plot_type][i](chart);
    });
};
