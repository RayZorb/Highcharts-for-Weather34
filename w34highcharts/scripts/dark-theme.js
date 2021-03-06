/**
 * @license Highcharts JS v7.1.2 (2019-06-03)
 *
 * (c) 2009-2019 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/themes/dark-unica', ['highcharts'], function (Highcharts) {
            factory(Highcharts);
            factory.Highcharts = Highcharts;
            return factory;
        });
    } else {
        factory(typeof Highcharts !== 'undefined' ? Highcharts : undefined);
    }
}(function (Highcharts) {
    var _modules = Highcharts ? Highcharts._modules : {};
    function _registerModule(obj, path, args, fn) {
        if (!obj.hasOwnProperty(path)) {
            obj[path] = fn.apply(null, args);
        }
    }
    _registerModule(_modules, 'themes/dark-unica.js', [_modules['parts/Globals.js']], function (Highcharts) {
        /* *
         *
         *  (c) 2010-2019 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  Dark theme for Highcharts JS
         *
         * */


        /* global document */

        // Load the fonts

        Highcharts.createElement('link', {
            href: 'https://fonts.googleapis.com/css?family=Unica+One',
            rel: 'stylesheet',
            type: 'text/css'
        }, null, document.getElementsByTagName('head')[0]);

        Highcharts.theme = {
            colors: ['rgba(255, 124, 57, 0.8)', '#1ABECE', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066',
                '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
            chart: {
                backgroundColor: 'rgba(40, 45, 52,.4)',
                style: {
                    fontFamily: '\'arial\', sans-serif'
                },
                plotBorderColor: '#606063'
            },
            title: {
                style: {
                    color: '#ccc',
                    textTransform: 'none',
                    fontSize: '18px'
                }
            },
            subtitle: {
                style: {
                    color: '#ccc',
                    textTransform: 'none'
                }
            },
            xAxis: {
              	crosshair: {
            	width: 1,
            	color: '#009bab',
            	dashStyle: 'shortdash'
        	},
              	gridLineDashStyle: 'shortdot',
              	gridLineWidth: 1, 
              	gridLineColor: 'RGBA(64, 65, 66, 0.8)',
                labels: {
                    style: {
                        color: '#ccc'
                    }
                },
                lineColor: '#707073',
                minorGridLineColor: 'RGBA(64, 65, 66, 0.8)',
                tickColor: '#707073',
                title: {
                    style: {
                        color: '#ccc'

                    }
                }
            },
          		
            yAxis: {
                crosshair: {
            	width: 1,
            	color: '#ff832f',
            	dashStyle: 'shortdash'
        		},
    			gridLineDashStyle: 'shortdot',
              	gridLineWidth: 1,
              	gridLineColor: 'RGBA(64, 65, 66, 0.8)',
                labels: {
                    style: {
                        color: '#ccc'
                    }
                },
                lineColor: '#707073',
                minorGridLineColor: 'RGBA(64, 65, 66, 0.8)',
                tickColor: '#707073',
                tickWidth: 1,
                title: {
                    style: {
                        color: '#ccc'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(37, 41, 45, 0.65)',
                style: {
                    color: '#F0F0F0'
                }
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        color: '#ccc'
                    },
                    marker: {
                        lineColor: '#333'
                    }
                },
                boxplot: {
                    fillColor: '#505053'
                },
                candlestick: {
                    lineColor: 'white'
                },
                errorbar: {
                    color: 'white'
                }
            },
            legend: {
                itemStyle: {
                    color: '#ccc'
                },
                itemHoverStyle: {
                    color: '#FFF'
                },
                itemHiddenStyle: {
                    color: '#606063'
                }
            },
            credits: {
                style: {
                    color: '#666'
                }
            },
            labels: {
                style: {
                    color: '#ccc'
                }
            },

            drilldown: {
                activeAxisLabelStyle: {
                    color: '#F0F0F3'
                },
                activeDataLabelStyle: {
                    color: '#F0F0F3'
                }
            },

            exporting: {
        	buttons: {
            redButton: {
              symbol: 'circle',  
              symbolFill: '#EC6D6B',
              symbolStroke: '#EC6D6B',
              symbolStrokeWidth: 0,
 			  align: 'left',
              x: 10,
              
              theme: {
                        states: {
                            hover: {
                                stroke: 'rgba(40, 45, 52,.4)',
                              	fill: 'transparent'
                            },
                            select: {
                                stroke: 'rgba(40, 45, 52,.4)',
                              	fill: 'transparent'
                            }
                        }    
                    },
                            
            },
            yellowButton: {
              symbol: 'circle',
              symbolFill: '#FDBC40',
              symbolStroke: '#FDBC40',
              symbolStrokeWidth: 0,
              align: 'left',
              x: 30,
              
              backgroundColor: null,
              theme: {
                        states: {
                            hover: {
                                fill: 'transparent'
                            },
                            select: {
                                fill: 'transparent'
                            }
                        }    
                    },
            },
              greenButton: {
                 symbol: 'circle',
                symbolFill: '#33C84A',
                symbolStroke: '#33C84A',
                symbolStrokeWidth: 0,
                align: 'left',
              	x: 50,
                
                width: 24,
                backgroundColor: null,
                theme: {
                        fill: 'transparent',
                  		states: {
                            hover: {
                                fill: 'transparent'
                            },
                            select: {
                                fill: 'transparent'
                            }
                        }    
                    },
            
        }}
    },			
          	navigation: {
                buttonOptions: {
                    symbolStroke: '#DDDDDD',
                  
                    theme: {
                        fill: 'transparent'
                    }
                }
            },

            // scroll charts
            rangeSelector: {
                buttonTheme: {
                    fill: '#505053',
                    stroke: '#000000',
                    style: {
                        color: '#CCC'
                    },
                    states: {
                        hover: {
                            fill: '#707073',
                            stroke: '#000000',
                            style: {
                                color: 'white'
                            }
                        },
                        select: {
                            fill: '#000003',
                            stroke: '#000000',
                            style: {
                                color: 'white'
                            }
                        }
                    }
                },
                inputBoxBorderColor: '#505053',
                inputStyle: {
                    backgroundColor: '#333',
                    color: 'silver'
                },
                labelStyle: {
                    color: 'silver'
                }
            },

            navigator: {
              enabled: false,  
              handles: {
                    backgroundColor: '#666',
                    borderColor: '#AAA'
                },
                outlineColor: '#CCC',
                maskFill: 'rgba(255,255,255,0.1)',
                series: {
                    color: '#7798BF',
                    lineColor: '#A6C7ED'
                },
                xAxis: {
                    gridLineColor: '#505053'
                }
            },

            scrollbar: {
              	enabled: false,  
              	barBackgroundColor: '#808083',
                barBorderColor: '#808083',
                buttonArrowColor: '#CCC',
                buttonBackgroundColor: '#606063',
                buttonBorderColor: '#606063',
                rifleColor: '#FFF',
                trackBackgroundColor: '#404043',
                trackBorderColor: '#404043'
            },

            // special colors for some of the
            legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
            background2: '#505053',
            dataLabelsColor: '#B0B0B3',
            textColor: '#C0C0C0',
            contrastTextColor: '#F0F0F3',
            maskColor: 'rgba(255,255,255,0.3)'
        };

        // Apply the theme
        Highcharts.setOptions(Highcharts.theme);

    });
    _registerModule(_modules, 'masters/themes/dark-unica.src.js', [], function () {


    });
}));
