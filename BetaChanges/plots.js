/*****************************************************************************
Javascript to setup, configure and display Highcharts plots of weewx weather data.
Based on Highcharts documentation and examples, and a lot of Stackoverflow Q&As.
History
    v1.0.0      June 2019
        -  large rewrite of the original plots.js to support w34 type charts
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
    lightningplot: [addYearOptions, create_lightning_chart],
    luminosityplot: [addYearOptions, create_luminosity_chart],
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
    temperatureplot: [['temp_week.json'],['year.json'],['temp_week1.json']],
    indoorplot: [['indoor_derived_week.json'],['year.json'],['indoor_derived_week1.json']],
    tempsmallplot: [['temp_week.json'],['year.json'],[null]],
    tempallplot: [['temp_week.json'],['year.json'],['temp_week1.json']],
    tempderivedplot: [['indoor_derived_week.json'],['year.json'],['indoor_derived_week1.json']],
    dewpointplot: [['temp_week.json'],['year.json'],['temp_week1.json']],
    humidityplot: [['temp_week.json'],['year.json'],['temp_week1.json']],
    barometerplot: [['bar_rain_week.json'],['year.json'],['bar_rain_week1.json']],
    barsmallplot: [['bar_rain_week.json'],['year.json'],[null]],
    windplot: [['wind_week.json'],['year.json'],['wind_week1.json']],
    windsmallplot: [['wind_week.json'],['year.json'],[null]],
    windallplot: [['wind_week.json'],['year.json'],[null]],
    winddirplot: [['wind_week.json'],['year.json'],[null]],
    windroseplot: [['wind_rose_week.json'],['year.json'],[null]],
    rainplot: [['bar_rain_week.json'],['year.json'],[null]],
    rainmonthplot: [['year.json'],['year.json'],[null]],
    rainsmallplot: [['bar_rain_week.json'],['year.json'],[null]],
    lightningplot: [['year.json'],['year.json'],[null]],
    luminosityplot: [['year.json'],['year.json'],[null]],
    radiationplot: [['solar_week.json'],['year.json'],['solar_week1.json']],
    raduvplot: [['solar_week.json'],['year.json'],['solar_week1.json']],
    radsmallplot: [['solar_week.json'],['year.json'],[null]],
    uvplot: [['solar_week.json'],['year.json'],['solar_week1.json']],
    uvsmallplot: [['solar_week.json'],['year.json'],[null]]
};

var plotsnoswitch = ['tempsmallplot','barsmallplot','windsmallplot','rainsmallplot','rainmonthplot','radsmallplot','uvsmallplot','windroseplot','lightningplot', 'luminosityplot'];
var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var windrosespans = ["1h","24h","Week","Month","Year"];
var realtimeXscaleFactor = 300/realtimeinterval;
var realtimeinterval = 2;
var reload_plot_type = null;
var reload_span = null;
var compare_dates_ts = [];
var compare_dates = false;
var do_realtime = false;
var auto_update = false;
var day_plots = false;
var buttons = null;
var timer1 = null;
var timer2 = null;
var prevrealtime = "";
var windrosesamples = 0;
var windrosespeeds = [];
var windrosespan;
var categories;
var utcoffset;
var chart;

/*****************************************************************************
Read multiple json files at the same time found at this URL
https://stackoverflow.com/questions/19026331/call-multiple-json-data-files-in-one-getjson-request
*****************************************************************************/
jQuery.getMultipleJSON = function(){
  return jQuery.when.apply(jQuery, jQuery.map(arguments, function(jsonfile){
    return jQuery.getJSON(jsonfile).fail(function(){
      alert("!!!!NO DATA FOUND in database. Please choose another date!!!! " + jsonfile.split("/")[1]);return true;});
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
            boost: {useGPUTranslations: false},
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
                    units: [['day',[1]], ['week',[1]]]},
            },
            series: {states: {hover: {halo: {size: 0,}}}, 
                turboThreshold:100,
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
            valueDecimals: 2,
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
        xAxis: [{
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
            minRange: 1,
        },{
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
            opposite: true,
            minRange: 1,
            visible: false,
            labels: {formatter: function() {
                    for (var i = 0; i < compare_dates_ts.length; i++)
                        if (Math.abs(compare_dates_ts[i][0] - this.value) < 100000){
                            var time = Highcharts.dateFormat('%H:%M', compare_dates_ts[i][1]);
                            return time.split(":")[0] == 0 || time.split(":")[0] == 23 || time.split(":")[0] == 1 ? Highcharts.dateFormat('%e. %b', compare_dates_ts[i][1]):time;
                        }
                }
            },
        }],
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
                text: ''}
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
                text: ''}
        }],
    };
    return commonOptions;
};

function remove_range_selector(chart){
    chart.update({
        rangeSelector: {enabled: false}
    });
};

function add_realtime_button(units,plot_type){
    if (auto_update) return;
    if (do_realtime){
        if (timer2 != null){
            clearInterval(timer2);
            timer2 = null;
        }
        do_realtime = true;
    }
    realtimeXscaleFactor = realtimeplot[plot_type][4]/realtimeinterval;
    setTimeout(display_chart, 0, units, realtimeplot[plot_type][3], 'weekly',false,false,reload_plot_type+":"+reload_span, true);
}

function addWindRoseOptions(options, span, seriesData, units, plot_type) {
    options.rangeSelector = {inputEnabled:false };
    options.rangeSelector.buttons = [{
        text: '1h',
        events: {click: function (e) {setTimeout(display_chart, 0, units, plot_type, ["weekly"]);windrosespan=windrosespans[0];return false;}}
    }, {
        text: '24h',
        events: {click: function (e) {setTimeout(display_chart, 0, units, plot_type, ["weekly"]);windrosespan=windrosespans[1];return false;}}
    }, {
        text: getTranslation(windrosespans[2]),
        events: {click: function (e) {setTimeout(display_chart, 0, units, plot_type, ["weekly"]);windrosespan=windrosespans[2];return false;}}
    }, {
        text: getTranslation(windrosespans[3]),
        events: {click: function (e) {setTimeout(display_chart, 0, units, plot_type, ["yearly"]);windrosespan=windrosespans[3];return false;}}
    }, {
        text: getTranslation(windrosespans[4]),
        events: {click: function (e) {setTimeout(display_chart, 0, units, plot_type, ["yearly"]);windrosespan=windrosespans[4];return false;}}
    }, {
        text: getTranslation("RT"),
        events: {click: function (e) {add_realtime_button(units, plot_type)}}
    }];
    options.rangeSelector.selected = 0;
    return options
};
    
function addWeekOptions(obj, span, seriesData, units, plot_type) {
    if (do_realtime) return obj;
    if (compare_dates)
         obj.rangeSelector = {inputEnabled:false };
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
        text: compare_dates ? '72h' : '7d'
    }]
    if (realtimeplot.hasOwnProperty(plot_type)){obj.rangeSelector.buttons.push({
        text: getTranslation("RT"),
        events: {click: function (e) {add_realtime_button(units, plot_type)}}})
    }
    obj.rangeSelector.selected = day_plots || compare_dates ? 5 : 3;
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
    var order = [], i, j, temp = [], temp1 = [], points = tooltip.points;
    if (points == undefined) points = [tooltip.point];
    for (j = 0; j < points.length; j++)
        order.push(j);
    if (first_line == "date"){
        temp = '<span style="font-size: 10px">' + Highcharts.dateFormat('%e %B %Y %H:%M',new Date(tooltip.x)) + '</span><br/>';
        if (compare_dates){
            for (i = 0; i < compare_dates_ts.length; i++)
                if (compare_dates_ts[i][0] == tooltip.x && compare_dates_ts[i][1] != null){
                    temp1  = '<span style="font-size: 10px">' + Highcharts.dateFormat('%e %B %Y %H:%M',compare_dates_ts[i][1]) + '</span><br/>';
                    temp = '<span style="font-size: 10px">' + Highcharts.dateFormat('%e %B %Y %H:%M',new Date(tooltip.x)) + '</span><br/>';
                    break;
                }
        }
    }else
       temp = '<span style="font-size: 10px">' + first_line[tooltip.x] + '</span><br/>';
    $(order).each(function(i,j){
        if (points[j] != undefined){
            temp += '<span style="color: '+points[j].series.color+'">' + points[j].series.name + ': ' + parseFloat(points[j].y.toFixed(2)) + points[j].series.tooltipOptions.valueSuffix + '</span><br/>';
            if (temp1.length > 0 && i == order.length/2 -1)
                temp += temp1;
        }
    });
    return temp;
};

function getTranslation(term){
    if (typeof translations == 'undefined') return term;
    if (translations.hasOwnProperty(term)) return translations[term];
    var parts = term.split(/([" ", "/", "&"])/);
    var translation = "";
    for (var i = 0; i < parts.length; i++)
       translation += translations.hasOwnProperty(parts[i]) ? translations[parts[i]] : parts[i];
    return translation.length > 0 ? translation : term;
};

function create_chart_options(options, type, title, valueSuffix, values, first_line = "date"){
    var fields = ['name', 'type', 'yAxis', 'visible', 'showInLegend', 'tooltip', 'xAxis'];
    options.series = [];
    options.chart.type = type;
    if (first_line != null)
        options.tooltip.formatter = function() {return custom_tooltip(this, first_line)};
    if (valueSuffix != null) options.tooltip.valueSuffix = valueSuffix;
    options.xAxis[0].minTickInterval = do_realtime ? 450000 : 900000;
    options.title = {text: getTranslation(title)};
    for (var i = 0; i < values.length; i++){
        options.series[i] = [];
        for (field in fields) options.series[i].push(field);
        for (var j = 0; j < fields.length; j++)
            if (values[i][j] != null){
                options.series[i][fields[j]] = (fields[j] == 'name' ? getTranslation(values[i][j]) : values[i][j]);  
                if (fields[j] == 'xAxis'){
                    options[fields[j]][values[i][j]].visible = true;
                    options[fields[j]][values[i][j]].linkedTo = 0;
                }
            }
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

function reinflate_time(series, ts_start = null, returnDate = false){
    series[0][0] = ts_start == null ? (series[0][0] + (utcoffset *60)) *1000: ts_start; 
    for (var i = 1; i < series.length; i++)
        series[i][0] = returnDate ? new Date((series[0][0] + (series[i][0] *1000))) : series[0][0] + (series[i][0] *1000);
    if (returnDate) series[0][0] = new Date(series[0][0]);
    return series;
};

function create_compare_days_ts(series, series1){
    compare_dates_ts = [];
    var a = series.map(function(arr){return arr.slice(0,1);});
    var b = reinflate_time(series1.map(function(arr){return arr.slice(0,1);}),null,true);
    for(var i=0;i<a.length;i++)compare_dates_ts.push([a[i] == undefined ? null : a[i], b[i] == undefined ? null : b[i]].flat());
}

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
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Temperature Dewpoint', '\xB0' + units.temp, [['Temperature', 'spline'],['Dewpoint','spline'],['Feels', 'spline',, false, false], ['Temperature', 'spline',,,,,1],['Dewpoint','spline',,,,,1],['Feels', 'spline',,false,false,,1]]);
        else
            options = create_chart_options(options, 'spline', 'Temperature Dewpoint', '\xB0' + units.temp, [['Temperature', 'spline'],['Dewpoint','spline'],['Feels', 'spline',, false, false]])
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.outTemp));
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.dewpoint));
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].temperatureplot.outTemp);
            options.series[3].data = convert_temp(seriesData[1].temperatureplot.units, units.temp, reinflate_time(seriesData[1].temperatureplot.outTemp, options.series[0].data[0][0]));
            options.series[4].data = convert_temp(seriesData[1].temperatureplot.units, units.temp, reinflate_time(seriesData[1].temperatureplot.dewpoint, options.series[0].data[0][0]));
        }
        if ("appTemp" in seriesData[0].temperatureplot) {
            options.series[2].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.appTemp));
            options.series[2].visible = true;
            options.series[2].showInLegend = true;
            if (compare_dates){
                options.series[5].data = convert_temp(seriesData[1].temperatureplot.units, units.temp, reinflate_time(seriesData[1].temperatureplot.appTemp, options.series[0].data[0][0]));
                options.series[5].visible = true;
                options.series[5].showInLegend = true;
            }
        }
    }
    options.yAxis[0].title.text = "(\xB0" + units.temp + ")";
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
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Greenhouse Temperature Humidity', '\xB0' + units.temp, [['Temperature', 'spline'],['Humidity','spline', 1,,, {valueSuffix: '%'}], ['Temperature', 'spline',,,,,1],['Humidity','spline', 1,,, {valueSuffix: '%'},1]]);
        else
            options = create_chart_options(options, 'spline', 'Greenhouse Temperature Humidity', '\xB0' + units.temp, [['Temperature', 'spline'],['Humidity','spline', 1,,, {valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.inTemp));
        options.series[1].data = reinflate_time(seriesData[0].humidityplot.inHumidity);
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].temperatureplot.inTemp);
            options.series[2].data = convert_temp(seriesData[1].temperatureplot.units, units.temp, reinflate_time(seriesData[1].temperatureplot.inTemp, options.series[0].data[0][0]));
            options.series[3].data = reinflate_time(seriesData[1].humidityplot.inHumidity, options.series[0].data[0][0]);
        }
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
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Temperature Dewpoint Humidity', '\xB0' + units.temp, [['Temperature', 'spline'],['Dewpoint','spline'],['Humidity', 'spline', 1,,,{valueSuffix: '%'}],['Temperature', 'spline',,,,,1],['Dewpoint','spline',,,,,1],['Humidity', 'spline', 1,,,{valueSuffix: '%'},1]]);
        else
            options = create_chart_options(options, 'spline', 'Temperature Dewpoint Humidity', '\xB0' + units.temp, [['Temperature', 'spline'],['Dewpoint','spline'],['Humidity', 'spline', 1,,,{valueSuffix: '%'}]]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.outTemp));
        options.series[1].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.dewpoint));
        options.series[2].data = reinflate_time(seriesData[0].humidityplot.outHumidity);
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].temperatureplot.outTemp);
            options.series[3].data = convert_temp(seriesData[1].temperatureplot.units, units.temp, reinflate_time(seriesData[1].temperatureplot.outTemp, options.series[0].data[0][0]));
            options.series[4].data = convert_temp(seriesData[1].temperatureplot.units, units.temp, reinflate_time(seriesData[1].temperatureplot.dewpoint, options.series[0].data[0][0]));
            options.series[5].data = reinflate_time(seriesData[1].humidityplot.outHumidity, options.series[0].data[0][0]);
        }
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
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Windchill HeatIndex Apparent', '\xB0' + units.temp, [['Windchill', 'spline'],['Heatindex','spline'],['Apparent', 'spline',,false,false],['Windchill', 'spline',,,,,1],['Heatindex','spline',,,,,1],['Apparent', 'spline',,false,false,,1]]);
        else
            options = create_chart_options(options, 'spline', 'Windchill HeatIndex Apparent', '\xB0' + units.temp, [['Windchill', 'spline'],['Heatindex','spline'],['Apparent', 'spline',,false,false]]);
        options.series[0].data = convert_temp(seriesData[0].windchillplot.units, units.temp, reinflate_time(seriesData[0].windchillplot.windchill));
        options.series[1].data = convert_temp(seriesData[0].windchillplot.units, units.temp, reinflate_time(seriesData[0].windchillplot.heatindex));
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].windchillplot.windchill);
            options.series[4].data = convert_temp(seriesData[1].windchillplot.units, units.temp, reinflate_time(seriesData[1].windchillplot.windchill, options.series[0].data[0][0]));
            options.series[5].data = convert_temp(seriesData[1].windchillplot.units, units.temp, reinflate_time(seriesData[1].windchillplot.heatindex, options.series[0].data[0][0]));
        }
        if ("appTemp" in seriesData[0].temperatureplot){
            options.series[2].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.appTemp));
            if (compare_dates)
                options.series[6].data = convert_temp(seriesData[1].temperatureplot.units, units.temp, reinflate_time(seriesData[1].temperatureplot.appTemp, options.series[0].data[0][0]));
        }
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
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Dewpoint', '\xB0' + units.temp, [['Dewpoint', 'spline'],['Dewpoint', 'spline',,,,,1]]);
        else
            options = create_chart_options(options, 'spline', 'Dewpoint', '\xB0' + units.temp, [['Dewpoint', 'spline']]);
        options.series[0].data = convert_temp(seriesData[0].temperatureplot.units, units.temp, reinflate_time(seriesData[0].temperatureplot.dewpoint));
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].temperatureplot.dewpoint);
            options.series[1].data = convert_temp(seriesData[1].temperatureplot.units, units.temp, reinflate_time(seriesData[1].temperatureplot.dewpoint, options.series[0].data[0][0]));
        }
    }
    options.yAxis[0].title.text = "(\xB0" + units.temp + ")";
    return options;
};

function create_humidity_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'columnrange', 'Humidity Ranges & Averages', null,[['Humidity Range', 'columnrange',,,,{valueSuffix: '%'}],['Average Humidity','spline',,,,{valueSuffix: '%'}]]);
        options.series[0].data = reinflate_time(seriesData[0].humidityplot.outHumidityminmax);
        options.series[1].data = reinflate_time(seriesData[0].humidityplot.outHumidityaverage);
    }
    else if (span[0] == "weekly"){
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Humidity', null, [['Humidity', 'spline',,,,{valueSuffix: '%'}], ['Humidity', 'spline',,,,{valueSuffix: '%'},1]]);
        else
            options = create_chart_options(options, 'spline', 'Humidity', null, [['Humidity', 'spline',,,,{valueSuffix: '%'}]]);
        options.series[0].data = reinflate_time(seriesData[0].humidityplot.outHumidity);
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].humidityplot.outHumidity);
            options.series[1].data = reinflate_time(seriesData[1].humidityplot.outHumidity, options.series[0].data[0][0]);
        }
    }
    options.yAxis.min = 0;
    options.yAxis.max = 100;
    options.yAxis[0].minorTickInterval = 5;
    options.yAxis[0].tickInterval = 25;
    options.yAxis[0].title.text = "(" + seriesData[0].humidityplot.units + ")";
    return options;
};

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
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Barometer', units.pressure, [['Barometer', 'spline'], ['Barometer', 'spline',,,,,1]]);
        else
            options = create_chart_options(options, 'spline', 'Barometer', units.pressure, [['Barometer', 'spline']]);
        options.series[0].data = convert_pressure(seriesData[0].barometerplot.units, units.pressure, reinflate_time(seriesData[0].barometerplot.barometer));
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].barometerplot.barometer);
            options.series[1].data = convert_pressure(seriesData[1].barometerplot.units, units.pressure, reinflate_time(seriesData[1].barometerplot.barometer, options.series[0].data[0][0]));
        }
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
            if (compare_dates)
                options = create_chart_options(options, 'spline', 'Wind Speed Gust', units.wind,[['Wind Speed', 'spline'],['Wind Gust', 'spline'], ['Wind Speed', 'spline',,,,,1],['Wind Gust', 'spline',,,,,1]]);
            else
                options = create_chart_options(options, 'spline', 'Wind Speed Gust', units.wind,[['Wind Speed', 'spline'],['Wind Gust', 'spline']]);
            options.series[1].data = convert_wind(seriesData[0].windplot.units, units.wind, reinflate_time(seriesData[0].windplot.windGust));
        }
        options.series[0].data = convert_wind(seriesData[0].windplot.units, units.wind, reinflate_time(seriesData[0].windplot.windSpeed));
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].windplot.windSpeed);
            options.series[3].data = convert_wind(seriesData[1].windplot.units, units.wind, reinflate_time(seriesData[1].windplot.windGust, options.series[0].data[0][0]));
            options.series[2].data = convert_wind(seriesData[1].windplot.units, units.wind, reinflate_time(seriesData[1].windplot.windSpeed, options.series[0].data[0][0]));
        }
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
        itemStyle: {font: '12pt Trebuchet MS, Verdana, sans-serif'},
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
    options.xAxis[0].showLastLabel = false;
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
    if (!windrosespans.includes(windrosespan)) windrosespan = windrosespans[1];
    if (do_realtime) windrosespan = windrosespans[0];
    if (windrosespan == windrosespans[0]){
        convertlegend(seriesData[0].windroseHour.series, units);
        options.series = seriesData[0].windroseHour.series;
        options.xAxis.categories = seriesData[0].windroseHour.xAxis.categories;
        windrosesamples = seriesData[0].windroseHour.samples;
    }
    else if (windrosespan == windrosespans[1]){
        convertlegend(seriesData[0].windroseDay.series, units);
        options.series = seriesData[0].windroseDay.series;
        options.xAxis.categories = seriesData[0].windroseDay.xAxis.categories;
    }
    else if (windrosespan == windrosespans[2]){
        convertlegend(seriesData[0].windroseWeek.series, units);
        options.series = seriesData[0].windroseWeek.series;
        options.xAxis.categories = seriesData[0].windroseWeek.xAxis.categories;
    }
    else if (windrosespan == windrosespans[3]){
        convertlegend(seriesData[0].windroseMonth.series, units);
        options.series = seriesData[0].windroseMonth.series;
        options.xAxis.categories = seriesData[0].windroseMonth.xAxis.categories;
    }
    else if (windrosespan == windrosespans[4]){
        convertlegend(seriesData[0].windroseYear.series, units);
        options.series = seriesData[0].windroseYear.series;
        options.xAxis.categories = seriesData[0].windroseYear.xAxis.categories;
    }
    categories = options.xAxis.categories;
    options.title = {text: getTranslation("Wind Rose ") + (do_realtime ? getTranslation('Real Time') : windrosespan)};
    return options;
};

function convertlegend(series, units, usey = false){
    if (!usey) windrosespeeds = [];
    var totalPercent = 0;
    for (var i = 0; i < series.length; i++)
        for (var j = 0; j < series[i].data.length; j++)
            totalPercent += usey ? series[i].data[j].y : series[i].data[j];
    for (var i = 0; i < series.length; i++){
        var percent = 0, newName = "", speed = 0, firstspeed = 0, parts = series[i].name.replace("> ","").split("-"), legendname = "";
        for (var j = 0; j < parts.length; j++){
            firstspeed = speed;
            if (usey) firstspeed = windrosespeeds[0];
            speed = convert_wind(series[i].name.replace(/[0-9-.]/g,''), units['wind'], parseInt(parts[j]), 0);
            if (!usey) 
                windrosespeeds.push(speed);
            newName += speed;
            if (j + 1 < parts.length && i != 0) newName += "-";
        }
        for (var j = 0; j < series[i].data.length; j++)
            percent += usey ? series[i].data[j].y : series[i].data[j];
        legendname = (i == 0 ? "> " + firstspeed: newName) + " " + units['wind'] + " (" + (totalPercent == 0 ? "0.0" : ((percent/totalPercent)*100.0).toFixed(1)) + "%)";
        series[i].name = legendname;
        if (chart != undefined)
            $(chart.legend.allItems[i].legendItem.element.childNodes).text(legendname)
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
        options = create_chart_options(options, 'column', 'RainFall', units.rain,[['RainFall', 'column']]);
        options.series[0].data = convert_rain(seriesData[0].rainplot.units, units.rain, reinflate_time(seriesData[0].rainplot.rainsum));
        options.plotOptions.column.dataGrouping.dateTimeLabelFormats.hour = ['%e %B %Y', '%e %B %Y %H:%M', '-%H:%M'];
    }
    if (span[0] == "weekly"){
        options = create_chart_options(options, 'column', 'RainFall', units.rain,[['RainFall', 'column'], ['RainRate', 'spline', 1]], null);
        options.series[0].data = convert_rain(seriesData[0].rainplot.units, units.rain, reinflate_time(seriesData[0].rainplot.rain));
        options.series[1].data = convert_rain(seriesData[0].rainplot.units, units.rain, reinflate_time(seriesData[0].rainplot.rainRate));
        options.yAxis[1].title.text = "(" + units.rain + ")";
        options.yAxis[1].min = 0;
        if (do_realtime){
            realtimeplot['rainplot'][5] = [0];
            for (var i = options.series[0].data.length-1; i > 0; i--)
                if (options.series[0].data[options.series[0].data.length-1][0] -3600*1000 < options.series[0].data[i][0])
                    realtimeplot['rainplot'][5][0] += options.series[0].data[i][1];
                else break;
        }
    }
    options.yAxis[0].title.text = "(" + units.rain + ")";
    options.yAxis[0].min = 0;
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

function create_lightning_chart(options, span, seriesData, units){
    options = create_chart_options(options, 'column', 'Lightning Distance/Strikes/Energy Max & Avg', null, [['Distance Max', 'column'], ['Distance Avg', 'column'], ['Strikes Max', 'column',1], ['Strikes Avg', 'column',1], ['Energy Max', 'column',2], ['Energy Avg', 'column',2]]);
    options.series[0].data = reinflate_time(seriesData[0].lightningplot.distanceMax);
    options.series[1].data = reinflate_time(seriesData[0].lightningplot.distanceAvg);
    options.series[2].data = reinflate_time(seriesData[0].lightningplot.strikesMax);
    options.series[3].data = reinflate_time(seriesData[0].lightningplot.strikesAvg);
    options.series[4].data = reinflate_time(seriesData[0].lightningplot.energyMax);
    options.series[5].data = reinflate_time(seriesData[0].lightningplot.energyAvg);
    options.yAxis[0].title.text = "Average Distance";
    options.yAxis[0].min = 0;
    options.yAxis[0].tickInterval = 1;
    options.yAxis[0].allowDecimals = true;
    options.yAxis[1].title.text = "Number of Strikes";
    options.yAxis[1].tickInterval = 1;
    options.yAxis[1].min = 0;
    options.yAxis[2].title.text = "Energy";
    options.yAxis[2].tickInterval = 1;
    options.yAxis[2].min = 0;
    options.xAxis.minTickInterval =0;
    return options;
};

function create_luminosity_chart(options, span, seriesData, units){
    options = create_chart_options(options, 'column', 'Luminosity Spectrum/Visible/Infrared Max & Avg', null, [['Spectrum Max', 'column'], ['Spectrum Avg', 'column'], ['Visible Max', 'column'], ['Visible Avg', 'column'], ['Infrared Max', 'column'], ['Infrared Avg', 'column']]);
    options.series[0].data = reinflate_time(seriesData[0].uvplot.full_spectrumMax);
    options.series[1].data = reinflate_time(seriesData[0].uvplot.full_spectrumAvg);
    options.series[2].data = reinflate_time(seriesData[0].uvplot.visibleMax);
    options.series[3].data = reinflate_time(seriesData[0].uvplot.visibleAvg);
    options.series[4].data = reinflate_time(seriesData[0].uvplot.infraredMax);
    options.series[5].data = reinflate_time(seriesData[0].uvplot.infraredAvg);
    options.yAxis[0].title.text = "Lux";
    options.yAxis[0].min = 0;
    options.yAxis[0].tickInterval = 1;
    options.yAxis[0].allowDecimals = true;
    options.xAxis.minTickInterval =0;
    return options;
};

function setRadSmall(options) {
    options.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return options;
};

function create_radiation_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'column', 'Solar Radiation Maximum & Average','W/m\u00B2', [['Max Solar Radiation', 'column'], ["Avg Solar Radiation", 'column'], ['Max UVAWm', 'column',,false,false], ["Avg UVAWm", 'column',,false,false], ['Max UVBWm', 'column',,false,false], ["Avg UVBWm", 'column',,false,false]]);
        options.series[0].data = reinflate_time(seriesData[0].radiationplot.radiationmax);
        options.series[1].data = reinflate_time(seriesData[0].radiationplot.radiationaverage);
        if ("uvaWmMax" in seriesData[0].radiationplot){
            options.series[2].data = reinflate_time(seriesData[0].radiationplot.uvaWmMax);
            options.series[2].visible = true;
            options.series[2].showInLegend = true;
        }
        if ("uvaWmAvg" in seriesData[0].radiationplot){
            options.series[3].data = reinflate_time(seriesData[0].radiationplot.uvaWmAvg);
            options.series[3].visible = true;
            options.series[3].showInLegend = true;
        }
        if ("uvbWmMax" in seriesData[0].radiationplot){
            options.series[4].data = reinflate_time(seriesData[0].radiationplot.uvbWmMax);
            options.series[4].visible = true;
            options.series[4].showInLegend = true;
        }
        if ("uvbWmAvg" in seriesData[0].radiationplot){
            options.series[5].data = reinflate_time(seriesData[0].radiationplot.uvbWmAvg);
            options.series[5].visible = true;
            options.series[5].showInLegend = true;
        }
    }
    else if (span[0] == "weekly"){
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Solar Radiation','W/m\u00B2', [['Solar Radiation', 'spline'], ["Insolation", 'area',,false,false],['Solar Radiation', 'spline',,,,,1], ["Insolation", 'area',,false,false,,1]]);
        else
            options = create_chart_options(options, 'spline', 'Solar Radiation','W/m\u00B2', [['Solar Radiation', 'spline'], ["Insolation", 'area',,false,false]]);
        options.series[0].data = reinflate_time(seriesData[0].radiationplot.radiation);
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].radiationplot.radiation);
            options.series[2].data = reinflate_time(seriesData[1].radiationplot.radiation, options.series[0].data[0][0]);
        }
        if ("insolation" in seriesData[0].radiationplot) {
            options.series[1].data = reinflate_time(seriesData[0].radiationplot.insolation);
            options.series[1].visible = true;
            options.series[1].showInLegend = true;
            if (compare_dates){
                options.series[3].data = reinflate_time(seriesData[1].radiationplot.insolation, options.series[0].data[0][0]);
                options.series[3].visible = true;
                options.series[3].showInLegend = true;
            }
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
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'Solar Radiation UV Index', null, [['Solar Radiation', 'spline'], ['UV Index', 'spline',1], ["Insolation", 'area',,false,false], ['Solar Radiation', 'spline',,,,,1], ['UV Index', 'spline',1,,,,1], ["Insolation", 'area',,false,false,,1]]);
        else
            options = create_chart_options(options, 'spline', 'Solar Radiation UV Index', null, [['Solar Radiation', 'spline'], ['UV Index', 'spline',1], ["Insolation", 'area',,false,false]]);
        options.series[0].data = reinflate_time(seriesData[0].radiationplot.radiation);
        options.series[1].data = reinflate_time(seriesData[0].uvplot.uv);
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].radiationplot.radiation);
            options.series[3].data = reinflate_time(seriesData[1].radiationplot.radiation, options.series[0].data[0][0]);
            options.series[4].data = reinflate_time(seriesData[1].uvplot.uv, options.series[0].data[0][0]);
        }
        if ("insolation" in seriesData[0].radiationplot) {
            options.series[2].data = reinflate_time(seriesData[0].radiationplot.insolation);
            options.series[2].visible = true;
            options.series[2].showInLegend = true;
            if (compare_dates){
                options.series[5].data = reinflate_time(seriesData[1].radiationplot.insolation, options.series[0].data[0][0]);
                options.series[5].visible = true;
                options.series[5].showInLegend = true;
            }
        }
    }
    options.yAxis[0].title.text = "(" + seriesData[0].radiationplot.units + ")";
    options.yAxis[1].title.text = "(" + seriesData[0].uvplot.units + ")";
    options.yAxis[0].min = 0;
    options.yAxis[1].max = 20;
    return options;
};

function setUvSmall(options) {
    options.yAxis[0].height = "160";
    $("#plot_div").css("height", 190);
    return options
};

function create_uv_chart(options, span, seriesData, units){
    if (span[0] == "yearly"){
        options = create_chart_options(options, 'column', 'UV Index Maximum & Average', null, [['UV Max', 'column'], ['UV Avg', 'column'], ['UVA Max', 'column',, false, false], ['UVA Avg', 'column',, false, false], ['UVB Max', 'column',, false, false], ['UVB Avg', 'column',, false, false]]);
        options.series[0].data = reinflate_time(seriesData[0].uvplot.uvmax);
        options.series[1].data = reinflate_time(seriesData[0].uvplot.uvaverage);
        if ("uvaMax" in seriesData[0].uvplot){
            options.series[2].data = reinflate_time(seriesData[0].uvplot.uvaMax);
            options.series[2].visible = true;
            options.series[2].showInLegend = true;
        }
        if ("uvaAvg" in seriesData[0].uvplot){
            options.series[3].data = reinflate_time(seriesData[0].uvplot.uvaAvg);
            options.series[3].visible = true;
            options.series[3].showInLegend = true;
        }
        if ("uvbMax" in seriesData[0].uvplot){
            options.series[4].data = reinflate_time(seriesData[0].uvplot.uvbMax);
            options.series[4].visible = true;
            options.series[4].showInLegend = true;
        }
        if ("uvbAvg" in seriesData[0].uvplot){
            options.series[5].data = reinflate_time(seriesData[0].uvplot.uvbAvg);
            options.series[5].visible = true;
            options.series[5].showInLegend = true;
        }
    }
    else if (span[0] == "weekly"){
        if (compare_dates)
            options = create_chart_options(options, 'spline', 'UV Index', null, [['UV Index', 'spline'], ['UV Index', 'spline',,,,,1]]);
        else
            options = create_chart_options(options, 'spline', 'UV Index', null, [['UV Index', 'spline']]);
        options.series[0].data = reinflate_time(seriesData[0].uvplot.uv);
        if (compare_dates){
            create_compare_days_ts(options.series[0].data, seriesData[1].uvplot.uv);
            options.series[1].data = reinflate_time(seriesData[1].uvplot.uv, options.series[0].data[0][0]);
        }
    }
    options.yAxis[0].min = 0;
    options.yAxis[0].max = 20;
    options.yAxis[0].minorTickInterval = 1;
    options.yAxis[0].tickInterval = 4;
    options.yAxis[0].title.text = "(" + seriesData[0].uvplot.units + ")";
    return options;
};

function do_realtime_update(chart, plot_type, units){
    if (!do_realtime){
        if (timer2 != null){
            clearInterval(timer2);
            timer2 = null;
        }
        return;
    }
    if (realtimeplot[plot_type][0].length == 0){
        window.location.href= dayplotsurl+"?units="+units.temp+","+units.pressure+","+units.wind+","+units.rain+"&plot_type="+realtimeplot[plot_type][3]+","+pathjsondayfiles+jsonfileforplot[plot_type][0]+","+weereportcmd+","+reload_plot_type+":"+reload_span+",true"+"&weewxpathbin="+pathweewxbin+"&epoch="+0;
        return;
    }
    $.get(realtimefile, function(data) {
        try{
            var parts = data.split(" ");
            if (parts[0] + parts[1] == prevrealtime) return;
            else prevrealtime = parts[0] + parts[1];
            if (plot_type =='windroseplot'){
                var compassindex = 0, speedindex = 0; speed = 0;
                for (compassindex = 0; compassindex < categories.length; compassindex++)
                    if (parts[realtimeplot[plot_type][0][1]] == categories[compassindex])
                        break;
                speed = parseFloat(window[realtimeplot[plot_type][2][0]](parts[realtimeplot[plot_type][1][0]],units[realtimeplot[plot_type][2][0].split("_")[1]],parts[realtimeplot[plot_type][0][0]]));
                windrosesamples += 1;
                if (windrosesamples == 60*(60/realtimeinterval)+60){
                    clearTimeout(timer2);
                    setTimeout(display_chart, 0, units, realtimeplot[plot_type][3], 'weekly',false,false,reload_plot_type+":"+reload_span, true);
                    return;
                }
                if (speed > 0){
                    chart.setTitle(null,{text: speed +" "+units[realtimeplot[plot_type][2][0].split("_")[1]] + " " + categories[compassindex]});
                    for (var j = windrosespeeds.length-1; j > -1; j-=2)
                        if (speed < windrosespeeds[j-1] && speed <= windrosespeeds[j]){
                            speedindex = (j-1)/2 +1;
                            break;
                        }
                    if (chart.series[speedindex].data[compassindex] != undefined){
                        var newdata = [];
                        for (var i = 0; i < chart.series.length; i++){
                            newdata[i] = [];
                            for (var j = 0; j < chart.series[i].data.length; j++)
                                newdata[i].push(chart.series[i].data[j].y/100.0*(windrosesamples-1));
                        }
                        newdata[speedindex][compassindex] += 1;
                        for (var i = 0; i < newdata.length; i++){
                            for (var j = 0; j < newdata[i].length; j++)
                                newdata[i][j] = (newdata[i][j]/windrosesamples*100.0);
                            chart.series[i].setData(newdata[i]);
                        }
                        convertlegend(chart.series, units, true);
                        chart.redraw();
                    }
                }else chart.setTitle(null,{text: getTranslation("Calm")});
            }else{
                var tparts = (parts[0]+" "+parts[1]).match(/(\d{2})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
                var x = Date.UTC(+"20"+tparts[3],tparts[2]-1,+tparts[1],+tparts[4],+tparts[5],+tparts[6]) + (utcoffset *60);
                for (var j = 0; j < realtimeplot[plot_type][0].length; j++)
                    if (chart.series[j] != undefined && chart.series[j].data.length > realtimeinterval*realtimeXscaleFactor)
                        chart.series[j].setData(chart.series[j].data.slice(-realtimeinterval*realtimeXscaleFactor));
                for (var j = 0; j < realtimeplot[plot_type][0].length; j++)
                    if (realtimeplot[plot_type][2][j] == null)
                        chart.series[j].addPoint([x, check_for_delta_change(plot_type, j, parseFloat(parts[realtimeplot[plot_type][0][j]]))], true, true);
                    else
                        chart.series[j].addPoint([x, check_for_delta_change(plot_type, j, parseFloat(window[realtimeplot[plot_type][2][j]](parts[realtimeplot[plot_type][1][j]],units[realtimeplot[plot_type][2][j].split("_")[1]],parts[realtimeplot[plot_type][0][j]])))], true, true);
            }
        }catch(err) {console.log(err)}
    });
};

function check_for_delta_change(plot_type, index, value){
    var ret_value = value;
    if (realtimeplot[plot_type][5] != undefined && realtimeplot[plot_type][5][index] != undefined){
        ret_value = value - realtimeplot[plot_type][5][index];
        realtimeplot[plot_type][5][index] = value;
    }
    return ret_value;
}
    
function do_auto_update(units, plot_type, span, buttonReload){       
    if (buttonReload)
        setTimeout(display_chart, 0, units, reload_plot_type == null ? plot_type : reload_plot_type, reload_span == null ? span : reload_span);
    else
        setTimeout(display_chart, 0, units, plot_type, span);
};

function setup_plots(seriesData, units, options, plot_type, span){
    utcoffset = seriesData[0].utcoffset;
    for (var i = 0; i < (span[0] == "weekly" ? createweeklyfunctions[plot_type].length : createyearlyfunctions[plot_type].length); i++)
       options = (span[0] == "weekly" ? createweeklyfunctions[plot_type][i](options, span, seriesData, units, plot_type) : createyearlyfunctions[plot_type][i](options, span, seriesData, units, plot_type));
    return options
};

function display_chart(units, plot_type, span, dplots = false, cdates = false, reload_plot_type_span = null, realtime = false){
    if (!Array.isArray(span)) span = [span];
    console.log(units, plot_type, span, dplots, cdates, reload_plot_type_span, realtime);
    day_plots = dplots;
    compare_dates = cdates;
    reload_plot_type = plot_type;
    reload_span = span;
    do_realtime = realtime;
    if (reload_plot_type_span != null){
        reload_plot_type = reload_plot_type_span.split(":")[0];
        reload_span = reload_plot_type_span.split(":")[1];
    }
    Highcharts.setOptions({global:{timezoneOffset: 0,}});
    var results, files = [], index = 0;
    if (!jsonfileforplot.hasOwnProperty(plot_type) || !(span[0] == "weekly" || span[0] == "yearly")){alert("Bad plot_type (" + plot_type + ") or span (" + span[0] + ")"); return};
    for (var i = 0; i < jsonfileforplot[plot_type][span[0] == "weekly" ? 0 : 1].length; i++,index++)
        files[index] = (day_plots || compare_dates ? pathjsondayfiles : pathjsonfiles) + jsonfileforplot[plot_type][span[0] == "weekly" ? 0 : 1][i];
    for (var i = 0; i < jsonfileforplot[plot_type][2].length; i++,index++)
        if (compare_dates && jsonfileforplot[plot_type][2] != null)
            files[index] = pathjsondayfiles + jsonfileforplot[plot_type][2][i];
    if (buttons == null){
        function callback(units, plot_type, span, buttonReload){return function(){
                                    if (buttonReload){
                                        do_realtime = false;
                                        auto_update = false;
                                    }
                                    else {
                                        if (do_realtime) return;
                                        auto_update = !auto_update;
                                    }
                                    for (var i = 0; i < buttons.length;i++)
                                        if (buttons[i].hasOwnProperty("text") && buttons[i].text.indexOf("Auto") == 0)
                                            buttons[i].text = "Auto Update Chart " + (auto_update ? "ON" : "OFF");
                                    if (timer1 != null){
                                        clearInterval(timer1);
                                        timer1 = null;
                                    }                                
                                    setTimeout(display_chart, 0, units, plot_type,span,false,false,reload_plot_type+":"+reload_span, false)}}
        function realtime_callback(){return function(){add_realtime_button(units, plot_type)}}
        function compare_callback(){return function(){
                                    if (auto_update) return;
                                    if (do_realtime) return;
                                    var epoch  = (new Date($('input.highcharts-range-selector:eq(0)').val()).getTime()/1000);
                                    var epoch1 = (new Date($('input.highcharts-range-selector:eq(1)').val()).getTime()/1000);
                                    if (isNaN(epoch) || isNaN(epoch1)) return;
                                    for (var i= chart.series[0].data.length-1; i>0; i--)
                                        if (chart.series[0].data[i] != undefined && Math.abs(chart.series[0].data[i].x/1000 - epoch) < 100){
                                            epoch = chart.series[0].data[i].x/1000;
                                            break;
                                        }
                                    var tempepoch = epoch1;
                                    epoch1 = 0;
                                    for (var i= chart.series[0].data.length-1; i>0; i--)
                                        if (chart.series[0].data[i] != undefined && Math.abs(chart.series[0].data[i].x/1000 - tempepoch) < 100){
                                            epoch1 = chart.series[0].data[i].x/1000;
                                            break;
                                        }
                                    chart.showLoading('Loading data from database...');
                                    window.location.href= dayplotsurl+"?units="+units.temp+","+units.pressure+","+units.wind+","+units.rain+"&plot_type="+plot_type+","+pathjsondayfiles+jsonfileforplot[plot_type][0]+","+weereportcmd+","+pathjsondayfiles+jsonfileforplot[plot_type][2]+","+reload_plot_type+":"+reload_span+",false"+"&weewxpathbin="+pathweewxbin+"&epoch="+epoch+"&epoch1="+epoch1}};
        buttons = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;
        buttons.push({text: "Reload Chart", onclick: callback(units, plot_type, span, true)});
        buttons.push({text: "Auto Update Chart OFF", onclick: callback(units, plot_type, span, false)});
        if (realtimeplot.hasOwnProperty(plot_type))
            buttons.push({text: "Realtime Update", onclick: realtime_callback()});
        if (jsonfileforplot[plot_type][2][0] != null)
            buttons.push({text: "Compare Dates", onclick: compare_callback()});
    }
    jQuery.getMultipleJSON(...files).done(function(...results){
        var options = setup_plots(results.flat(), units, create_common_options(), plot_type, span);
        chart = new Highcharts.StockChart(options,function(chart){setTimeout(function(){$('input.highcharts-range-selector',$('#'+chart.options.chart.renderTo)).datepicker()},0)});
        chart.options.zoomType = 'x';
        chart.pointer.zoomX = true;
        chart.pointer.zoomHor = true;
        if (postcreatefunctions.hasOwnProperty(plot_type))
            for (var i = 0; i < postcreatefunctions[plot_type].length; i++)
                postcreatefunctions[plot_type][i](chart);
        if (do_realtime){
            remove_range_selector(chart);           
            for (var j =0; j < realtimeplot[plot_type][0].length; j++)
                chart.series[j].setData(options.series[j].data.slice(-realtimeinterval*realtimeXscaleFactor));
            timer2 = setInterval(do_realtime_update, (realtimeplot[plot_type][0].length == 0 ? realtimeplot[plot_type][4]*1000 : realtimeinterval*1000), chart, plot_type, units);
            return;
        }
        if (auto_update && timer1 == null){
            timer1 = setInterval(do_auto_update, autoupdateinterval*1000, units, plot_type, span, false);
            return;
        }
        if (!plotsnoswitch.includes(plot_type)){
            for (var i = 0; i < chart.series.length; i++){
                chart.series[i].update({
                    cursor: 'pointer',
                    point: {
                       events: {click: function(e){
                            if (day_plots) 
                                setTimeout(display_chart, 0, units, plot_type, ['weekly']); 
                            else if (span[0] == 'yearly'){
                                var epoch = 0;
                                for (var i= 0; i < this.series.data.length; i++)
                                    if (this.series.data[i].x == this.x){
                                       epoch = this.series.data[i].x;
                                       break;
                                     }
                                chart.showLoading('Loading data from database...');
                                window.location.href= dayplotsurl+"?units="+units.temp+","+units.pressure+","+units.wind+","+units.rain+"&plot_type="+plot_type+","+pathjsondayfiles+jsonfileforplot[plot_type][0]+","+weereportcmd+","+reload_plot_type+":"+reload_span+",false"+"&weewxpathbin="+pathweewxbin+"&epoch="+epoch/1000
                            }
                            else
                                setTimeout(display_chart, 0, units, plot_type, ['yearly'])}}
                    }
                });
            }
            return;
        }
    }).fail(function(){
        $("#plot_div").load(pathpws + "404.html");
        return;
    });
};
$.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    onSelect: function () {
        this.onchange();
        this.onblur();
    }
});
