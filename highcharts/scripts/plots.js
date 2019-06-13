/*****************************************************************************

v0.2.2                                          Last Update: 4 September 2018

Javascript to setup, configure and display Highcharts plots of weewx weather
data.

Based on Highcharts documentation and examples, and a lot of Stackoverflow
Q&As.

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

To install/setup:
    -   install Highcharts for weewx extension and confirm proper generation
        of week and year JSON data files
    -   arrange for JSON data files to be transferred to your web server
        either by weewx or some other arrangement
    -   copy saratogaplots.js and weewxtheme.js to a suitable directory on your
        web server (the default directory used throughout is
        saratoga/scripts/js - remember this is relative to the root directory
        of your webserver so it could be /var/www/html/saratoga/scripts/js)
    -   if using the supplied wxgraphs2.php with the Saratoga templates then
        copy the file to the Saratoga templates folder on your web server
    -   if using the demo file, graphs.html, then copy the file to a suitable
        directory on your web server
    -   irrespective of what file you are using to display the plots make sure
        that any paths to the scripts in any <SCRIPT> tags reflect you setup
    -   check/set the paths to the JSON data files using the week_json and
        year_json variable below - remember the path is relative to your web
        server root
    -   open the wxgraphs2.php or graphs.html in your web browser
    -   once the default setup is working you may customise the display by
        changing the plot settings in this file and weewxtheme.js

History
    v0.2.2      4 September 2018
        - version number change only
    v0.2.0      4 May 2017
        - ignores appTemp and insolation plots if no relevant data is available
    v0.1.0      22 November 2016
        - initial implementation

*****************************************************************************/

/*****************************************************************************

Set names of div ids to which the various plots will be rendered

*****************************************************************************/
var plotIds = {
    temperature: 'temperatureplot',
    windChill: 'windchillplot',
    humidity: 'humidityplot',
    barometer: 'barometerplot',
    wind: 'windplot',
    windDir: 'winddirplot',
    windRose: 'windroseplot',
    rain: 'rainplot',
    radiation:  'radiationplot',
    uv: 'uvplot'
};

var createweeklyfunctions = {
    temperatureplot: [addWeekOptions, setTemp, create_temperature_chart],
    humidityplot: [addWeekOptions, setHumidity, create_humidity_chart],
    barometerplot: [addWeekOptions, setBarometer, create_barometer_chart],
    windchillplot: [addWeekOptions, setWindchill, create_windchill_chart],
    windplot: [addWeekOptions, setWind, create_wind_chart],
    winddirplot: [addWeekOptions, setWindDir, create_winddir_chart],
    windroseplot: [addWindRoseOptions, setWindRose, create_windrose_chart],
    rainplot: [addWeekOptions, setRain, create_rain_chart],
    radiationplot: [addWeekOptions, setRadiation, create_radiation_chart],
    uvplot: [addWeekOptions, setUv, setUvStock, create_uv_chart]
};

var createyearlyfunctions = {
    temperatureplot: [addYearOptions, setTempStock,create_temperature_chart],
    humidityplot: [addYearOptions, setHumidityStock, create_humidity_chart],
    barometerplot: [addYearOptions, setBarometerStock, create_barometer_chart],
    windchillplot: [addYearOptions, setWindchillStock, create_windchill_chart],
    windplot: [addYearOptions, setWindStock, create_wind_chart],
    winddirplot: [addYearOptions, setWindDirStock, create_winddir_chart],
    windroseplot: [addWindRoseOptions, setWindRose, create_windrose_chart],
    rainplot: [addYearOptions, setRainStock, create_rain_chart],
    radiationplot: [addYearOptions, setRadiationStock, create_radiation_chart],
    uvplot: [addYearOptions, setUvStock, setUvStock, create_uv_chart]
};
var windrosespans = ["Day","Week","Month","Year"];

/*****************************************************************************

Set paths/names of our week and year JSON data files

Paths are relative to the web server root

*****************************************************************************/
var week_json = 'json/week.json';
var year_json = 'json/year.json';

/*****************************************************************************

Set default plot options

These are common plot options across all plots. Change them by all means but
make sure you know what you are doing. The Highcharts API documentation is
your reference.

*****************************************************************************/
var commonOptions = {
    chart: {
        plotBackgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [0, '#FFFFFF'],
                [1, '#FFFFFF']
            ]
        },
        spacing: [15, 20, 10, 0],
        zoomType: 'xy'
    },
    legend: {
        enabled: true
    },
    plotOptions: {
        area: {
            lineWidth: 1,
            marker: {
                enabled: false,
                radius: 2,
                symbol: 'circle'
            },
            fillOpacity: 0.05
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
    rangeSelector: {
    },
    series: [{
    }],
    tooltip: {
        crosshairs: true,
        enabled: true,
        dateTimeLabelFormats: {
            minute: '%e %B %Y %H:%M',
            hour: '%e %B %Y %H:%M',
            day: '%A %e %B %Y'
        },
        shared: true,
         //need to set valueSuffix so we can set it later if needed
        valueSuffix: ''
    },
    xAxis: {
        dateTimeLabelFormats: {
            day: '%e %b',
            week: '%e %b',
            month: '%b %y',
        },
        lineColor: '#555',
        lineWidth: 1,
        minorGridLineWidth: 0,
        minorTickColor: '#555',
        minorTickLength: 2,
        minorTickPosition: 'inside',
        minorTickWidth: 1,
        tickColor: '#555',
        tickLength: 4,
        tickPosition: 'inside',
        tickWidth: 1,
        title: {
            style: {
                font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
            }
        },
        type: 'datetime',
    },
    yAxis: {
        endOnTick: true,
        labels: {
            x: -8,
            y: 3
        },
        lineColor: '#555',
        lineWidth: 1,
        minorGridLineWidth: 0,
        minorTickColor: '#555',
        minorTickLength: 2,
        minorTickPosition: 'inside',
        minorTickWidth: 1,
        opposite: false,
        showLastLabel: true,
        startOnTick: true,
        tickColor: '#555',
        tickLength: 4,
        tickPosition: 'inside',
        tickWidth: 1,
        title: {
            text: ''
        }
    }
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

function addWindRoseOptions(options, span, seriesData, units, cb_func, plot_type) {
/*****************************************************************************

Function to add/set various plot options specific to the 'wind rose' plot.

*****************************************************************************/
    // set range selector buttons
    options.rangeSelector = {inputEnabled:false };
    options.rangeSelector.buttons = [{
        text: windrosespans[0],
        events: {click: function (e) {weekly(units, plot_type, cb_func, windrosespans[0]); return false;}}
    }, {
        text: windrosespans[1],
        events: {click: function (e) {weekly(units, plot_type, cb_func, windrosespans[1]); return false;}}
    }, {
        text: windrosespans[2],
        events: {click: function (e) {yearly(units, plot_type, cb_func, windrosespans[2]); return false;}}
    }, {
        text: windrosespans[3],
        events: {click: function (e) {yearly(units, plot_type, cb_func, windrosespans[3]); return false;}}
    }];
    // set default range selector button
    options.plotOptions.column.dataGrouping.enabled = false;
    return options
};
    
function addWeekOptions(obj) {
/*****************************************************************************

Function to add/set various plot options specific to the 'week' plot.

*****************************************************************************/
    // set range selector buttons
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
    // set default range selector button
    obj.rangeSelector.selected = 3;
    // turn off data grouping for each plot type
    obj.plotOptions.column.dataGrouping.enabled = false;
    obj.plotOptions.spline.dataGrouping.enabled = false;
    obj.plotOptions.scatter.dataGrouping.enabled = false;
    return obj
};


function addYearOptions(obj) {
/*****************************************************************************

Function to add/set various plot options specific to the 'year' plot.

*****************************************************************************/
    // set range selector buttons
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
    // set default range selector button
    obj.rangeSelector.selected = 2;
    // turn off data grouping for each plot type
    obj.plotOptions.spline.dataGrouping.enabled = false;
    obj.plotOptions.column.dataGrouping.enabled = false;
    obj.plotOptions.columnrange.dataGrouping.enabled = false;
    return obj
};

function setTemp(obj) {
/*****************************************************************************

Function to add/set various plot options specific to temperature spline plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.temperature;
    obj.chart.type = 'spline';
    obj.navigator = {
        series: {
            lineColor: '#B44242'
        },
    },
    obj.title = {
        text: 'Temperature'
    };
    obj.xAxis.minRange = 900000;
    obj.xAxis.minTickInterval = 900000;
    return obj
};

function setTempStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline temperature plots

*****************************************************************************/
    obj = setTemp(obj);
    obj.chart.type = 'columnrange';
    obj.series = [{
        color: '#F0B0B0',
        name: 'Temperature Range',
        type: 'columnrange',
        visible: true
    }, {
        color: '#B44242',
        name: 'Average Temperature',
        type: 'spline',
        visible: true
    }];
    obj.tooltip.valueDecimals = 1;
    return obj
};

function create_temperature_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create temperature chart

*****************************************************************************/
    if (span == "yearly"){
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.outTempminmax);
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.outTempaverage);
    }
    else if (span == "weekly"){        
        options.series[0] = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.outTemp);
        options.series[1] = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.dewpoint);
        if ("appTemp" in seriesData[0].temperatureplot.series) {
           options.series[2] = convert_temp(seriesData[0].temperatureplot.units, units.temp, seriesData[0].temperatureplot.series.appTemp);
        }
    }
    options.yAxis.title.text = "(" + units.temp + ")";
    options.tooltip.valueSuffix = units.temp;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    options.yAxis.minRange = seriesData[0].temperatureplot.minRange;
    return options;
}

function setWindchill(obj) {
/*****************************************************************************

Function to add/set various plot options specific to windchill spline plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.windChill;
    obj.chart.type = 'spline';
    obj.navigator = {
        series: {
            color: '#C07777',
            lineColor: '#047B04'
        },
    },
    obj.title = {
        text: 'Apparent Temperature/Wind Chill/Heat Index'
    };
    obj.xAxis.minRange = 900000;
    obj.xAxis.minTickInterval = 900000;
    return obj
};

function setWindchillStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline windchill plots

*****************************************************************************/
    obj = setWindchill(obj);
    obj.chart.type = 'columnrange';
    obj.series = [{
        color: '#A6D3A6',
        name: 'Apparent Temperature Range',
        type: 'columnrange',
        visible: true
    }, {
        color: '#047B04',
        name: 'Average Apparent Temperature',
        type: 'spline',
        visible: true
    }, {
        name: 'Average Wind Chill',
        type: 'spline',
        visible: true
    }, {
        name: 'Average Heat Index',
        type: 'spline',
        visible: true
    }];
    obj.tooltip.valueDecimals = 1;
    return obj
};

function create_windchill_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create windchill chart

*****************************************************************************/
    if (span == "yearly"){
        options.series[3].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.heatindexaverage);
        options.series[2].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.windchillaverage);
        if ("appTempminmax" in seriesData[0].windchillplot) {
            options.series[0].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.appTempminmax);
        } else {
            options.series.shift();
        }
        if ("appTempaverage" in seriesData[0].windchillplot) {
            options.series[1].data = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.appTempaverage);
        } else {
            options.series.shift();
        }
        if ((!("appTempminmax" in seriesData[0].windchillplot)) && (!("appTempaverage" in seriesData[0].windchillplot))) {
            options.title.text = 'Wind Chill/Heat Index';
        }
    }
    else {
        options.series[1] = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.series.windchill);
        options.series[0] = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.series.heatindex);
        if ("appTemp" in seriesData[0].temperatureplot.series) {
            options.series[2] = convert_temp(seriesData[0].windchillplot.units, units.temp, seriesData[0].windchillplot.series.appTemp);
        }
    }
    options.yAxis.title.text = "(" + units.temp + ")";
    options.tooltip.valueSuffix = units.temp;
    options.yAxis.minRange = seriesData[0].windchillplot.minRange;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}
        
function setHumidity(obj) {
/*****************************************************************************

Function to add/set various plot options specific to humidity spline plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.humidity;
    obj.chart.type = 'spline';
    obj.navigator = {
        series: {
            lineColor: '#4242B4'
        },
    },
    obj.plotOptions.series = {
        color: '#4242B4'
    };
    obj.title = {
        text: 'Humidity'
    };
    obj.tooltip.valueSuffix = '%';
    obj.xAxis.minRange = 900000;
    obj.xAxis.minTickInterval = 900000;
    obj.yAxis.max = 100;
    obj.yAxis.min = 0;
    obj.yAxis.minorTickInterval = 5;
    obj.yAxis.tickInterval = 25;
    return obj
};

function setHumidityStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
humidity spline plots

*****************************************************************************/
    obj = setHumidity(obj);
    obj.chart.type = 'columnrange';
    obj.navigator = {
        series: {
            color: '#C07777',
            lineColor: '#B06060'
        },
    },
    obj.series = [{
        color: '#8EC3D3',
        name: 'Humidity Range',
        type: 'columnrange',
        visible: true
    }, {
        color: '#4242B4',
        name: 'Average Humidity',
        type: 'spline',
        visible: true
    }];
    obj.tooltip.valueDecimals = 1;
    return obj
};

function create_humidity_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create humidity chart

*****************************************************************************/
    if (span == "yearly"){
        options.series[0].data = seriesData[0].humidityplot.outHumidityminmax;
        options.series[1].data = seriesData[0].humidityplot.outHumidityaverage;
    }
    else if (span == "weekly")
        options.series[0] = seriesData[0].humidityplot.series.outHumidity;
    options.yAxis.title.text = "(" + seriesData[0].humidityplot.units + ")";
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function setBarometer(obj) {
/*****************************************************************************

Function to add/set various plot options specific to barometric pressure
spline plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.barometer;
    obj.chart.type = 'spline';
    obj.navigator = {
        series: {
            lineColor: '#4242B4'
        },
    },
    obj.plotOptions.series = {
        color: '#4242B4'
    };
    obj.title = {
        text: 'Barometer'
    };
    obj.xAxis.minRange = 900000;
    obj.xAxis.minTickInterval = 900000;
    return obj
};

function setBarometerStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline barometric pressure plots

*****************************************************************************/
    obj = setBarometer(obj);
    obj.chart.type = 'columnrange';
    obj.navigator = {
        series: {
            color: '#C07777',
            lineColor: '#B06060'
        },
    },
    obj.series = [{
        color: '#8EC3D3',
        name: 'Barometeric Pressure Range',
        type: 'columnrange',
        visible: true
    }, {
        color: '#4242B4',
        name: 'Average Barometric Pressure',
        type: 'spline',
        visible: true
    }];
    obj.tooltip.valueDecimals = 1;
    return obj
};

function create_barometer_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create barometer chart

*****************************************************************************/
    if (span == "yearly"){
        options.series[0].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, seriesData[0].barometerplot.barometerminmax);
        options.series[1].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, seriesData[0].barometerplot.barometeraverage);
    }
    else if (span == "weekly")
        options.series[0] = convert_pressure(seriesData[0].barometerplot.units, units.pressure, seriesData[0].barometerplot.series.barometer);
    options.yAxis.title.text = "(" + units.pressure + ")";
    options.tooltip.valueSuffix = units.pressure;
    options.yAxis.minRange = seriesData[0].barometerplot.minRange;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options
}

function setWind(obj) {
/*****************************************************************************

Function to add/set various plot options specific to wind speed spline plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.wind;
    obj.chart.type = 'spline';
    obj.legend.reversed = true;
    obj.navigator = {
        series: {
            lineColor: '#439BB6'
        },
    },
    obj.title = {
        text: 'Wind/Gust Speed'
    };
    obj.xAxis.minRange = 900000;
    obj.xAxis.minTickInterval = 900000;
    obj.yAxis.min = 0;
    return obj
};

function setWindStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline wind speed plots

*****************************************************************************/
    obj = setWind(obj);
    obj.chart.type = 'spline';
    obj.series = [{
        name: 'Max Gust Speed',
        type: 'spline',
        color: '#B44242'
    },{
        name: 'Max 5 Minute Average Wind Speed',
        type: 'spline',
        color: '#4242B4'
    }, {
        name: 'Day Average Wind Speed',
        type: 'spline',
        color: '#439BB6'
    }];
    obj.tooltip.valueDecimals = 1;
    return obj
};

function create_wind_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create wind chart

*****************************************************************************/
    if (span == "yearly"){
        options.series[0].data = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windmax);
        options.series[1].data = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windAvmax);
        options.series[2].data = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.windaverage);
    }
    else if (span == "weekly"){
        options.series[0] = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.series.windSpeed);
        options.series[1] = convert_wind(seriesData[0].windplot.units, units.wind, seriesData[0].windplot.series.windGust);
    }
    options.yAxis.title.text = "(" + units.wind + ")";
    options.tooltip.valueSuffix = units.wind;
    options.yAxis.minRange = seriesData[0].windplot.minRange;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function setWindDir(obj) {
/*****************************************************************************

Function to add/set various plot options specific to wind direction spline
plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.windDir;
    obj.chart.type = 'scatter';
    obj.navigator = {
        series: {
            lineColor: '#439BB6'
        },
    },
    obj.title = {
        text: 'Wind Direction'
    };
    obj.xAxis.minRange = 900000;
    obj.xAxis.minTickInterval = 900000;
    obj.yAxis.max = 360;
    obj.yAxis.min = 0;
    obj.yAxis.tickInterval = 90;
    obj.plotOptions.series = {
        marker: {
            radius: 2
        },
        color: '#4242B4'
    };
    obj.series.marker = {
        lineWidth: 0,
        lineColor: null,
        radius: 10
    };
    obj.tooltip.headerFormat = '<span style="font-size: 10px">{point.key}</span><br/>'
    obj.tooltip.pointFormat = '<span style="color: {series.color}">●</span> {series.name}: <b>{point.y}</b>'
    obj.tooltip.valueSuffix = '\u00B0'
    obj.tooltip.xDateFormat = '%e %B %Y %H:%M';
    return obj
};

function setWindDirStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline wind direction plots

*****************************************************************************/
    obj = setWindDir(obj);
    obj.navigator = {
        series: {
            lineColor: '#439BB6'
        },
    };
    obj.series = [{
        name: 'Vector Average Wind Direction',
        color: '#439BB6'
    }];
    obj.tooltip.valueDecimals = 1;
    obj.tooltip.xDateFormat = '%e %B %Y';
    return obj
};

function create_winddir_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create wind direction chart

*****************************************************************************/
    if (span == "yearly")
        options.series[0].data = seriesData[0].winddirplot.windDir;
    else if (span == "weekly")
        options.series[0] = seriesData[0].winddirplot.series.windDir;
    options.yAxis.minRange = seriesData[0].winddirplot.minRange;
    options.yAxis.title.text = "(" + units.wind + ")";
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function setWindRose(options)
 {
/*****************************************************************************

Function to add/set various plot options specific to wind rose plots

*****************************************************************************/
    options.chart.renderTo = plotIds.windRose;
    options.legend= {
        align: 'right',
        verticalAlign: 'top',
        y: 100,
        layout: 'vertical',
        text: 'Wind Speed',
        enabled: true
    };
    options.chart.polar = true;
    options.chart.type = 'column';
    options.chart.pane = {size: '100%'};
    options.title = {text: 'Wind Rose'};

    options.xAxis.tickmarkPlacement = "on";
    options.yAxis= {
        lineColor: '#555',
        lineWidth: 1,
        minorGridLineWidth: 0,
        minorTickColor: '#555',
        minorTickLength: 2,
        minorTickWidth: 1,
        opposite: false,
        showLastLabel: true,
        startOnTick: true,
        tickColor: '#555',
        tickLength: 4,
        tickWidth: 1,
    };
    options.yAxis.endOnTick = false;
    options.yAxis.showLastLabel = true;
    options.yAxis.title = {text: 'Frequency (%)'};
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

function create_windrose_chart(options, span, seriesData){
/*****************************************************************************

Function to create wind rose chart

*****************************************************************************/
    if (!windrosespans.includes(span)) span = 'Day'; // need weekly for first time
    if (span == windrosespans[0]){
        options.series=seriesData[0].windroseDay.series;
        //options.yAxis.min = seriesData[0].windroseDay.yAxis.min;
        //options.yAxis.max = seriesData[0].windroseDay.yAxis.max;
        options.xAxis.categories = seriesData[0].windroseDay.xAxis.categories;
    }
    if (span == windrosespans[1]){
        options.series=seriesData[0].windroseWeek.series;
        //options.yAxis.min = seriesData[0].windroseWeek.yAxis.min;
        //options.yAxis.max = seriesData[0].windroseWeek.yAxis.max;
        options.xAxis.categories = seriesData[0].windroseWeek.xAxis.categories;
    }
    if (span == windrosespans[2]){
        options.series=seriesData[0].windroseMonth.series;
        //options.yAxis.min = seriesData[0].windroseMonth.yAxis.min;
        //options.yAxis.max = seriesData[0].windroseMonth.yAxis.max;
        options.xAxis.categories = seriesData[0].windroseMonth.xAxis.categories;
    }
    if (span == windrosespans[3]){
        options.series=seriesData[0].windroseYear.series;
        //options.yAxis.min = seriesData[0].windroseYear.yAxis.min;
        //options.yAxis.max = seriesData[0].windroseYear.yAxis.max;
        options.xAxis.categories = seriesData[0].windroseYear.xAxis.categories;
    }
    options.subtitle = {text: span};
    return options;
};
 
function setRain(obj) {
/*****************************************************************************

Function to add/set various plot options specific to rainfall plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.rain;
    obj.chart.type = 'column';
    obj.plotOptions.column.dataGrouping.enabled = true;
    obj.title = {
        text: 'Rainfall'
    };
    obj.xAxis.minRange = 3600000;
    obj.xAxis.minTickInterval = 900000;
    obj.yAxis.min = 0;
    obj.plotOptions.column.color = '#72B2C4';
    obj.plotOptions.column.borderWidth = 0;
    obj.plotOptions.column.marker = {
        enabled: false,
    };
    obj.plotOptions.series.pointPadding = 0;
    obj.plotOptions.series.groupPadding = 0;
    obj.plotOptions.series.borderWidth = 0;
    obj.tooltip.headerFormat = '<span style="font-size: 10px">{point.key}</span><br/>';
    obj.tooltip.pointFormat = '<tr><td><span style="color: {series.color}">{series.name}</span>: </td>' + '<td style="text-align: right"><b>{point.y}</b></td></tr>';
    obj.tooltip.crosshairs = false;
    obj.tooltip.xDateFormat = '%e %B %Y hour to %H:%M';
    return obj
};

function setRainStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline rainfall plots

*****************************************************************************/
    obj = setRain(obj);
    obj.navigator = {
        enabled: true
    };
    obj.plotOptions.column.dataGrouping.dateTimeLabelFormats.hour = [
        '%e %B %Y', '%e %B %Y %H:%M', '-%H:%M'
    ];
    obj.plotOptions.column.dataGrouping.enabled = true;
    obj.plotOptions.column.dataGrouping.groupPixelWidth = 50;
    obj.series = [{
        name: 'Rainfall',
        type: 'column',
        color: '#439BB6'
    }];
    obj.title = {
        text: 'Rainfall'
    };
    obj.tooltip.valueDecimals = 1;
    obj.tooltip.xDateFormat = '%e %B %Y';

    obj.tooltip.headerFormat = '<span style="font-size: 10px">{point.key}</span><br/>';
    obj.tooltip.pointFormat = '<span style="color: {series.color}">●</span> {series.name}: <b>{point.y}</b>'
    obj.tooltip.crosshairs = false;
    obj.yAxis.allowDecimals = true;
    obj.yAxis.labels = {
        format: '{value:.0f}',
    };
    return obj
};

function create_rain_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create rain chart

*****************************************************************************/
    if (span == "yearly")
        options.series[0].data = convert_rain(seriesData[0].rainplot.units, units.rain, seriesData[0].rainplot.rainsum);
    if (span == "weekly")
        options.series[0] = convert_rain(seriesData[0].rainplot.units, units.rain, seriesData[0].rainplot.series.rain);
    options.yAxis.title.text = "(" + units.rain + ")";
    options.tooltip.valueSuffix = units.rain;
    options.yAxis.minRange = seriesData[0].rainplot.minRange;
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    options.title.text = 'Rainfall';
    return options;
}

function setRadiation(obj) {
/*****************************************************************************

Function to add/set various plot options specific to solar radiation spline
plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.radiation;
    obj.chart.type = 'spline';
    obj.navigator = {
        series: {
            lineColor: '#B44242'
        },
    },
    obj.title = {
        text: 'Solar Radiation'
    };
    obj.xAxis.minRange = 900000;
    obj.xAxis.minTickInterval = 900000;
    obj.yAxis.min = 0;
    obj.tooltip.formatter = function() {
        var order = [], i, j, temp = [],
            points = this.points;

        for(i=0; i<points.length; i++)
        {
            j=0;
            if( order.length )
            {
                while( points[order[j]] && points[order[j]].y > points[i].y )
                    j++;
            }
            temp = order.splice(0, j);
            temp.push(i);
            order = temp.concat(order);
        }
        console.log(order);
        temp = '<span style="font-size: 10px">' + Highcharts.dateFormat('%e %B %Y %H:%M',new Date(this.x)) + '</span><br/>';
        $(order).each(function(i,j){
            temp += '<span style="color: '+points[j].series.color+'">' +
                points[j].series.name + ': ' + points[j].y + 'W/m\u00B2</span><br/>';
        });
        return temp;
    };
    return obj
};

function setRadiationStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline solar radiation plots

*****************************************************************************/
    obj = setRadiation(obj);
    obj.chart.type = 'column';
    obj.series = [{
        name: 'Maximum Solar Radiation',
        type: 'column',
        color: '#F0B0B0',
    }, {
        name: 'Average Solar Radiation',
        type: 'spline',
        color: '#B44242',
    }];
    obj.tooltip.valueSuffix = 'W/m\u00B2';
    return obj
};

function create_radiation_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create radiation chart

*****************************************************************************/
    if (span == "yearly"){
        options.series[0].data = seriesData[0].radiationplot.radiationmax;
        options.series[1].data = seriesData[0].radiationplot.radiationaverage;
    }
    else if (span == "weekly"){
        options.series[0] = seriesData[0].radiationplot.series.radiation;
        if ("insolation" in seriesData[0].radiationplot.series) {
            options.series[1] = seriesData[0].radiationplot.series.insolation;
            options.series[1].type = 'area';
        }
    }    
    options.yAxis.minRange = seriesData[0].radiationplot.minRange;
    options.yAxis.title.text = "(" + seriesData[0].radiationplot.units + ")";
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    return options;
}

function setUv(obj) {
/*****************************************************************************

Function to add/set various plot options specific to UV index spline plots

*****************************************************************************/
    obj.chart.renderTo = plotIds.uv;
    obj.chart.type = 'spline';
    obj.navigator = {
        series: {
            lineColor: '#9933FF'
        },
    },
    obj.plotOptions.spline.color = '#9933FF';
    obj.title = {
        text: 'UV Index'
    };
    obj.xAxis.minRange = 900000;
    obj.xAxis.minTickInterval = 900000;
    obj.yAxis.max = 20;
    obj.yAxis.min = 0;
    obj.yAxis.minorTickInterval = 1;
    obj.yAxis.tickInterval = 4;
    return obj
};

function setUvStock(obj) {
/*****************************************************************************

Function to add/set various plot options specific to combined columnrange
spline UV index plots

*****************************************************************************/
    obj = setUv(obj);
    obj.chart.type = 'column';
    obj.series = [{
        name: 'Maximum UV Index',
        type: 'column',
        color: '#E0C2FF',
    }, {
        name: 'Average UV Index',
        type: 'spline',
        color: '#9933FF',
    }];
    obj.tooltip.valueDecimals = 1;
    return obj
};

function create_uv_chart(options, span, seriesData, units){
/*****************************************************************************

Function to create uv chart

*****************************************************************************/
    if (span == "yearly"){
        options.series[0].data = seriesData[0].uvplot.uvmax;
        options.series[1].data = seriesData[0].uvplot.uvaverage;
    }
    else if (span == "weekly")
        options.series[0] = seriesData[0].uvplot.series.uv;
    options.yAxis.minRange = seriesData[0].uvplot.minRange;
    options.yAxis.title.text = "(" + seriesData[0].uvplot.units + ")";
    options.xAxis.min = seriesData[0].timespan.start;
    options.xAxis.max = seriesData[0].timespan.stop;
    Highcharts.setOptions({
        global: {
            timezoneOffset: -seriesData[0].utcoffset,
        },
    });
    return options;
}

function setup_weekly_plots(seriesData, units, options, cb_func, plot_type, span){
/*****************************************************************************

Function to add/set various weekly plot options specific to the 'week' plot.

*****************************************************************************/
    var i;
    for (i = 0; i < createweeklyfunctions[plot_type].length; i++)
       options = createweeklyfunctions[plot_type][i](options, span, seriesData, units, cb_func,plot_type);
    return options
};

function display_chart(units, plot_type, cb_func, span){console.log(units, plot_type, cb_func, span);
/*****************************************************************************

Function to choose weekly or yearly charts

*****************************************************************************/
    this[span].apply(this,[units, plot_type, cb_func, span]);
};

function weekly(units, plot_type, cb_func, span){
/*****************************************************************************

Function to add/set various plot options and then plot each week plot

*****************************************************************************/
    // gather all fixed plot options for each plot
    $.getJSON(week_json, function(seriesData) {
        var options = setup_weekly_plots(seriesData, units, clone(commonOptions), cb_func, plot_type, span);
        var categories = options.xAxis.categories; //Needs to be here possible Highcharts bug
        // generate/display the actual plots
        Highcharts.setOptions({
            lang:{
                rangeSelectorZoom: (plot_type == 'windroseplot' ? "" : "Zoom")
            }
        });
        var chart = new Highcharts.StockChart(options,function(chart){setTimeout(function(){$('input.highcharts-range-selector',$('#'+chart.options.chart.renderTo)).datepicker()},0)});
        if (cb_func != null){
            var i;
            for (i = 0; i < chart.series.length; i++){
                chart.series[i].update({
                    cursor: 'pointer',
                    point: {
                       events: {click: function(e){cb_func(e);}}
                    }
                });
            }
        }
        if (plot_type == 'windroseplot') //Needs to be here possible Highcharts bug
            chart.update({
                xAxis: {
                    type: "category",
                    categories: categories 
                },
                navigator: {enabled: false},
                scrollbar: {enabled: false}
            });
    });
};

function setup_yearly_plots(seriesData, units, options, cb_func, plot_type, span){
/*****************************************************************************

Function to add/set various yearly plot options specific to the 'week' plot.

*****************************************************************************/
    var i;
    for (i = 0; i < createyearlyfunctions[plot_type].length; i++)
       options = createyearlyfunctions[plot_type][i](options, span, seriesData, units, cb_func, plot_type);
    return options
};

function yearly(units, plot_type, cb_func, span){
/*****************************************************************************

Function to add/set various plot options and then plot each year plot

*****************************************************************************/
    // gather all fixed plot options for each plot
    $.getJSON(year_json, function(seriesData) {
        var options = setup_yearly_plots(seriesData, units, clone(commonOptions), cb_func, plot_type, span);
        var categories = options.xAxis.categories; //Needs to be here possible Highcharts bug
        // generate/display the actual plots
        Highcharts.setOptions({
            lang:{
                rangeSelectorZoom: (plot_type == 'windroseplot' ? "" : "Zoom")
            }
        });
        var chart = new Highcharts.StockChart(options,function(chart){setTimeout(function(){$('input.highcharts-range-selector',$('#'+chart.options.chart.renderTo)).datepicker()},0)});
        if (cb_func != null){
            var i;
            for (i = 0; i < chart.series.length; i++){
                chart.series[i].update({
                    cursor: 'pointer',
                    point: {
                       events: {click: function(e){cb_func(e);}}
                    }
                });
            }
        }
        if (plot_type == 'windroseplot') //Needs to be here possible Highcharts bug
            chart.update({
                xAxis: {
                    type: "category",
                    categories: categories 
                },
                navigator: {enabled: false},
                scrollbar: {enabled: false}
            });
    });
};
