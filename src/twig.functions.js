//     Twig.js
//     Copyright (c) 2011-2012 John Roepke
//                   2012 Hadrien Lanneau
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.functions.js
//
// This file handles parsing filters.
var Twig = (function (Twig) {

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    Twig.functions = {
        //  attribute, block, constant, date, dump, parent, random,.
        
        // Range function from http://phpjs.org/functions/range:499
        // Used under an MIT License
        range: function (low, high, step) {
            // http://kevin.vanzonneveld.net
            // +   original by: Waldo Malqui Silva
            // *     example 1: range ( 0, 12 );
            // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            // *     example 2: range( 0, 100, 10 );
            // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
            // *     example 3: range( 'a', 'i' );
            // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
            // *     example 4: range( 'c', 'a' );
            // *     returns 4: ['c', 'b', 'a']
            var matrix = [];
            var inival, endval, plus;
            var walker = step || 1;
            var chars = false;

            if (!isNaN(low) && !isNaN(high)) {
                inival = parseInt(low);
                endval = parseInt(high);
            } else if (isNaN(low) && isNaN(high)) {
                chars = true;
                inival = low.charCodeAt(0);
                endval = high.charCodeAt(0);
            } else {
                inival = (isNaN(low) ? 0 : low);
                endval = (isNaN(high) ? 0 : high);
            }

            plus = ((inival > endval) ? false : true);
            if (plus) {
                while (inival <= endval) {
                    matrix.push(((chars) ? String.fromCharCode(inival) : inival));
                    inival += walker;
                }
            } else {
                while (inival >= endval) {
                    matrix.push(((chars) ? String.fromCharCode(inival) : inival));
                    inival -= walker;
                }
            }

            return matrix;
        },
        cycle: function(arr, i) {
            var pos = i % arr.length;
            return arr[pos];
        },
        dump: function() {
            var EOL = '\n',
            	indentChar = '  ',
            	indentTimes = 0,
            	out = '',
				args = Array.prototype.slice.call(arguments),
				indent = function(times) {
                	var ind	 = '';
                    while (times > 0) {
                        times--;
                        ind += indentChar;
                    }
                    return ind;
                },
				displayVar = function(variable) {
                    out += indent(indentTimes);
                    if (typeof(variable) === 'object') {
                        dumpVar(variable);
                    } else if (typeof(variable) === 'function') {
                        out += 'function()' + EOL;
                    } else if (typeof(variable) === 'string') {
                        out += 'string(' + variable.length + ') "' + variable + '"' + EOL;
                    } else if (typeof(variable) === 'number') {
                        out += 'number(' + variable + ')' + EOL;
                    } else if (typeof(variable) === 'boolean') {
                        out += 'bool(' + variable + ')' + EOL;
                    }
                },
             	dumpVar = function(variable) {
					var	i;
	                if (variable === null) {
	                    out += 'NULL' + EOL;
	                } else if (variable === undefined) {
	                    out += 'undefined' + EOL;
	                } else if (typeof variable === 'object') {
	                    out += indent(indentTimes) + typeof(variable);
	                    indentTimes++;
	                    out += '(' + (function(obj) {
	                        var size = 0, key;
	                        for (key in obj) {
	                            if (obj.hasOwnProperty(key)) {
	                                size++;
	                            }
	                        }
	                        return size;
	                    })(variable) + ') {' + EOL;
	                    for (i in variable) {
	                        out += indent(indentTimes) + '[' + i + ']=> ' + EOL;
	                        displayVar(variable[i]);
	                    }
	                    indentTimes--;
	                    out += indent(indentTimes) + '}' + EOL;
	                } else {
	                    displayVar(variable);
	                }
	            };

			// handle no argument case by dumping the entire render context
			if (args.length == 0) args.push(this.context);

			args.forEach(function(variable) {
				dumpVar(variable);
			});

            return out;
        },
        date: function(date, time) {
            var dateObj;
            if (date == undefined) {
                dateObj = new Date();
            } else if (Twig.lib.is("Date", date)) {
                dateObj = date;
            } else if (Twig.lib.is("String", date)) {
                dateObj = new Date(Twig.lib.strtotime(date) * 1000);
            } else if (Twig.lib.is("Number", date)) {
                // timestamp
                dateObj = new Date(date * 1000);
            } else {
                throw new Twig.Error("Unable to parse date " + date);
            }
            return dateObj;
        },
        parent: function() {
            // Add a placeholder
            return Twig.placeholders.parent;
        }
    };

    Twig._function = function(_function, value, params) {
        if (!Twig.functions[_function]) {
            throw "Unable to find function " + _function;
        }
        return Twig.functions[_function](value, params);
    }

    Twig._function.extend = function(_function, definition) {
        Twig.functions[_function] = definition;
    };

    return Twig;

})(Twig || { });
