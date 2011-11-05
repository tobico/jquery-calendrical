/*global document:true, $:true window:true */
/*jslint indent:4 maxlen:80 */
// Default JS file

"use strict";


(function ($) {
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    function getToday()
    {
        var date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function areDatesEqual(date1, date2)
    {
        return String(date1) === String(date2);
    }

    function daysInMonth(year, month)
    {
        var leapYear;
        if (year instanceof Date) {
            return daysInMonth(year.getFullYear(), year.getMonth());
        }
        if (month === 1) {
            leapYear = (year % 4 === 0) &&
                (!(year % 100 === 0) || (year % 400 === 0));
            return leapYear ? 29 : 28;
        } else if (month === 3 || month === 5 || month === 8 || month === 10) {
            return 30;
        } else {
            return 31;
        }
    }

    function dayAfter(date)
    {
        var year, month, day, lastDay;
        year = date.getFullYear();
        month = date.getMonth();
        day = date.getDate();
        lastDay = daysInMonth(date);
        return (day === lastDay) ?
            ((month === 11) ?
                new Date(year + 1, 0, 1) :
                new Date(year, month + 1, 1)
            ) :
            new Date(year, month, day + 1);
    }

    function dayBefore(date)
    {
        var year, month, day;
        year = date.getFullYear();
        month = date.getMonth();
        day = date.getDate();
        return (day === 1) ?
            ((month === 0) ?
                new Date(year - 1, 11, daysInMonth(year - 1, 11)) :
                new Date(year, month - 1, daysInMonth(year, month - 1))
            ) :
            new Date(year, month, day - 1);
    }

    function monthAfter(year, month)
    {
        return (month === 11) ?
            new Date(year + 1, 0, 1) :
            new Date(year, month + 1, 1);
    }

    function formatDate(date, usa)
    {
        return (usa ?
            ((date.getMonth() + 1) + '/' + date.getDate()) :
            (date.getDate() + '/' + (date.getMonth() + 1))
        ) + '/' + date.getFullYear();
    }

    function parseDate(date, usa)
    {
        var a, day, month;
        if (usa) {
            return new Date(date);
        }
        a = date.split(/[\.\-\/]/);
        day = a.shift();
        month = a.shift();
        a.unshift(day);
        a.unshift(month);
        return new Date(a.join('/'));
    }

    function formatTime(hour, minute, options)
    {
        var printMinute, printHour, half;
        printMinute = minute;
        if (minute < 10) {
            printMinute = '0' + minute;
        }

        if (options.isoTime) {
            printHour = hour;
            if (printHour < 10) {
                printHour = '0' + hour;
            }
            return printHour + ':' + printMinute;
        } else {
            printHour = hour % 12;
            if (printHour === 0) {
                printHour = 12;
            }

            if (options.meridiemUpperCase) {
                half = (hour < 12) ? 'AM': 'PM';
            } else {
                half = (hour < 12) ? 'am' : 'pm';
            }

            return printHour + ':' + printMinute + half;
        }
    }

    function parseTime(text)
    {
        var match, hour, minute;
        match = match = /(\d+)\s*[:\-\.,]\s*(\d+)\s*(am|pm)?/i.exec(text);
        if (match && match.length >= 3) {
            hour = Number(match[1]);
            minute = Number(match[2]);
            if (hour === 12 && match[3]) {
                hour -= 12;
            }
            if (match[3] && match[3].toLowerCase() === 'pm') {
                hour += 12;
            }
            return {
                hour:   hour,
                minute: minute
            };
        } else {
            return null;
        }
    }

    function timeToMinutes(time)
    {
        return time && (time.hour * 60 + time.minute);
    }

    /**
     * Generates calendar header, with month name, << and >> controls, and
     * initials for days of the week.
     */
    function renderCalendarHeader(element, year, month, options)
    {
        var thead, titleRow, dayNames;
        //Prepare thead element
        thead = $('<thead />');
        titleRow = $('<tr />').appendTo(thead);

        //Generate << (back a month) link
        $('<th />').addClass('monthCell').append(
            $('<a href="javascript:;">&laquo;</a>')
                .addClass('prevMonth')
                .mousedown(function (e) {
                    renderCalendarPage(element,
                                       month === 0 ? (year - 1) : year,
                                       month === 0 ? 11 : (month - 1), options
                                      );
                    e.preventDefault();
                })
        ).appendTo(titleRow);

        //Generate month title
        $('<th />').addClass('monthCell').attr('colSpan', 5).append(
            $('<a href="javascript:;">' + monthNames[month] + ' ' +
                year + '</a>').addClass('monthName')
        ).appendTo(titleRow);

        //Generate >> (forward a month) link
        $('<th />').addClass('monthCell').append(
            $('<a href="javascript:;">&raquo;</a>')
                .addClass('nextMonth')
                .mousedown(function () {
                    renderCalendarPage(element,
                        month === 11 ? (year + 1) : year,
                        month === 11 ? 0 : (month + 1), options
                    );
                })
        ).appendTo(titleRow);

        //Generate weekday initials row
        dayNames = $('<tr />').appendTo(thead);
        $.each(String('SMTWTFS').split(''), function (k, v) {
            $('<td />').addClass('dayName').append(v).appendTo(dayNames);
        });

        return thead;
    }

    function renderCalendarPage(element, year, month, options)
    {
        var today, date, endDate, ff, i, table, tbody, row,
        rewind, td, thisDate, isToday, isSelected, dow;
        options = options || {};

        today = getToday();

        date = new Date(year, month, 1);

        //Wind end date forward to saturday week after month
        endDate = monthAfter(year, month);
        ff = 6 - endDate.getDay();
        if (ff < 6) {
            ff += 7;
        }
        for (i = 0; i < ff; i = i + 1) {
            endDate = dayAfter(endDate);
        }

        table = $('<table />');
        renderCalendarHeader(element, year, month, options).appendTo(table);

        tbody = $('<tbody />').appendTo(table);
        row = $('<tr />');

        //Rewind date to monday week before month
        rewind = date.getDay() + 7;
        for (i = 0; i < rewind; i = i + 1) {
            date = dayBefore(date);
        }
        while (date <= endDate) {
            td = $('<td />')
                .addClass('day')
                .append(
                    $('<a href="javascript:;">' +
                        date.getDate() + '</a>'
                    ).click((function () {
                        thisDate = date;

                        return function () {
                            if (options && options.selectDate) {
                                options.selectDate(thisDate);
                            }
                        };
                    } () ))
                )
                .appendTo(row);

            isToday     = areDatesEqual(date, today);
            isSelected  = options.selected &&
                            areDatesEqual(options.selected, date);

            if (isToday) {
                td.addClass('today');
            }
            if (isSelected) {
                td.addClass('selected');
            }
            if (isToday && isSelected) {
                td.addClass('today_selected');
            }
            if (date.getMonth() !== month) {
                td.addClass('nonMonth');
            }

            dow = date.getDay();
            if (dow === 6) {
                tbody.append(row);
                row = $('<tr />');
            }
            date = dayAfter(date);
        }
        if (row.children().length) {
            tbody.append(row);
        } else {
            row.remove();
        }

        element.empty().append(table);
    }

    function renderTimeSelect(element, options)
    {
        var minTime, maxTime, defaultTime, selection, scrollTo, ul, time;
        minTime = timeToMinutes(options.minTime);
        maxTime = timeToMinutes(options.maxTime);
        defaultTime = timeToMinutes(options.defaultTime);
        selection = options.selection &&
                        timeToMinutes(parseTime(options.selection));

        // Round selection to nearest time interval so that it matches
        // a list item
        selection = selection && (
            (
                Math.floor((selection - minTime) / options.timeInterval) *
                options.timeInterval
            ) + minTime
        );

        ul = $('<ul />');

        for (time = minTime; time <= maxTime; time += options.timeInterval)  {
            (function (time) {
                var hour, minute, timeText, fullText, duration, li;
                hour = Math.floor(time / 60);
                minute = time % 60;
                timeText = formatTime(hour, minute, options);
                fullText = timeText;
                if (options.showDuration) {
                    duration = time - minTime;
                    if (duration < 60) {
                        fullText += ' (' + duration + ' mins)';
                    } else if (duration === 60) {
                        fullText += ' (1 hr)';
                    } else {
                        //Round partial hours to 1 decimal place
                        fullText += ' (' + (Math.round(
                            duration / 60.0 * 100.0) / 100.0) + ' hrs)';
                    }
                }
                li = $('<li />').append(
                    $('<a href="javascript:;">' + fullText + '</a>')
                    .click(function () {
                        if (options && options.selectTime) {
                            options.selectTime(timeText);
                        }
                    }).mousemove(function () {
                        $('li.selected', ul).removeClass('selected');
                    })
                ).appendTo(ul);

                //Set to scroll to the default hour, unless already set
                if (!scrollTo && time === defaultTime) {
                    scrollTo = li;
                }

                if (selection === time) {
                    //Highlight selected item
                    li.addClass('selected');

                    //Set to scroll to the selected hour
                    //
                    //This is set even if scrollTo is already set, since
                    //scrolling to selected hour is more important than
                    //scrolling to default hour
                    scrollTo = li;
                }
            })(time);
        }
        if (scrollTo) {
            //Set timeout of zero so code runs immediately after any calling
            //functions are finished (this is needed, since box hasn't been
            //added to the DOM yet)
            setTimeout(function () {
                //Scroll the dropdown box so that scrollTo item is in
                //the middle
                element[0].scrollTop =
                    scrollTo[0].offsetTop - scrollTo.height() * 2;
            }, 0);
        }
        element.empty().append(ul);
    }

    $.fn.calendricalDate = function (options)
    {
        var element, div, within, offset, padding, selected;
        options = options || {};
        options.padding = options.padding || 4;

        return this.each(function () {
            element = $(this);
            within = false;

            element.bind('focus click', function () {
                if (div) {
                    return;
                }
                offset = element.position();
                padding = element.css('padding-left');
                div = $('<div />')
                    .addClass('calendricalDatePopup')
                    .mouseenter(function () {
                        within = true;
                    })
                    .mouseleave(function () {
                        within = false;
                    })
                    .mousedown(function (e) {
                        e.preventDefault();
                    })
                    .css({
                        position: 'absolute',
                        left: offset.left,
                        top: offset.top + element.height() +
                            options.padding * 2
                    });
                element.after(div);

                selected = parseDate(element.val(), options.usa);
                if (!selected.getFullYear()) {
                    selected = getToday();
                }

                renderCalendarPage(
                    div,
                    selected.getFullYear(),
                    selected.getMonth(), {
                        selected: selected,
                        selectDate: function (date) {
                            within = false;
                            element.val(formatDate(date, options.usa));
                            div.remove();
                            div = null;
                            if (options.endDate) {
                                var endDate = parseDate(
                                    options.endDate.val(), options.usa
                                );
                                if (endDate >= selected) {
                                    options.endDate.val(formatDate(
                                        new Date(
                                            date.getTime() +
                                            endDate.getTime() -
                                            selected.getTime()
                                        ),
                                        options.usa
                                    ));
                                }
                            }
                        }
                    }
                );
            }).blur(function () {
                if (within) {
                    if (div) {
                        element.focus();
                        return;
                    }
                }
                if (!div) {
                    return;
                }
                div.remove();
                div = null;
            });
        });
    };

    $.fn.calendricalDateRange = function (options)
    {
        if (this.length >= 2) {
            $(this[0]).calendricalDate($.extend({
                endDate:   $(this[1])
            }, options));
            $(this[1]).calendricalDate(options);
        }
        return this;
    };

    $.fn.calendricalTime = function (options)
    {
        options = options || {};
        options.timeInterval = options.timeInterval || 30;
        options.padding = options.padding || 4;

        return this.each(function () {
            var element, div, within, offset, renderOptions, startTime;
            element = $(this);
            within = false;

            element.bind('focus click', function () {
                if (div) {
                    return;
                }

                offset = element.position();
                div = $('<div />')
                    .addClass('calendricalTimePopup')
                    .mouseenter(function () {
                        within = true;
                    })
                    .mouseleave(function () {
                        within = false;
                    })
                    .mousedown(function (e) {
                        e.preventDefault();
                    })
                    .css({
                        position: 'absolute',
                        left: offset.left,
                        top: offset.top + element.height() +
                            options.padding * 2
                    });

                element.after(div);

                var renderOptions = {
                    selection: element.val(),
                    selectTime: function (time) {
                        within = false;
                        element.val(time);
                        div.remove();
                        div = null;
                    },
                    isoTime:        options.isoTime || false,
                    meridiemUpperCase: options.meridiemUpperCase || false,
                    defaultTime:    options.defaultTime || {hour: 8, minute: 0},
                    minTime:        options.minTime || {hour: 0, minute: 0},
                    maxTime:        options.maxTime || {hour: 23, minute: 59},
                    timeInterval:   options.timeInterval || 30
                };

                if (options.startTime) {
                    startTime = parseTime(options.startTime.val());
                    //Don't display duration if part of a datetime range,
                    //and start and end times are on different days
                    if (options.startDate && options.endDate &&
                        !areDatesEqual(parseDate(options.startDate.val()),
                            parseDate(options.endDate.val()))) {
                        startTime = null;
                    }
                    if (startTime) {
                        renderOptions.minTime = startTime;
                        renderOptions.showDuration = true;
                        div.addClass('calendricalEndTimePopup');
                    }
                }

                renderTimeSelect(div, renderOptions);
            }).blur(function () {
                if (within) {
                    if (div) {
                        element.focus();
                        return;
                    }
                }
                if (!div) {
                    return;
                }
                div.remove();
                div = null;
            });
        });
    };

    $.fn.calendricalTimeRange = function (options)
    {
        if (this.length >= 2) {
            $(this[0]).calendricalTime(options);
            $(this[1]).calendricalTime($.extend({
                startTime: $(this[0])
            }, options));
        }
        return this;
    };

    $.fn.calendricalDateTimeRange = function (options)
    {
        if (this.length >= 4) {
            $(this[0]).calendricalDate($.extend({
                endDate:   $(this[2])
            }, options));
            $(this[1]).calendricalTime(options);
            $(this[2]).calendricalDate(options);
            $(this[3]).calendricalTime($.extend({
                startTime: $(this[1]),
                startDate: $(this[0]),
                endDate:   $(this[2])
            }, options));
        }
        return this;
    };
})(jQuery);
