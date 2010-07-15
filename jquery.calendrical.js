// (function($) {
    
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
        
    function getToday()
    {
        var date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    
    function areDatesEqual(date1, date2)
    {
        return String(date1) == String(date2);
    }
    
    function daysInMonth(year, month)
    {
        if (year instanceof Date) return daysInMonth(year.getFullYear(), year.getMonth());
        if (month == 1) {
            var leapYear = (year % 4 == 0) &&
                (!(year % 100 == 0) || (year % 400 == 0));
            return leapYear ? 29 : 28;
        } else if (month == 3 || month == 5 || month == 8 || month == 10) {
            return 30;
        } else {
            return 31;
        }
    }
    
    function dayAfter(date)
    {
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var lastDay = daysInMonth(date);
        return (day == lastDay) ?
            ((month == 11) ?
                new Date(year + 1, 0, 1) :
                new Date(year, month + 1, 1)
            ) :
            new Date(year, month, day + 1);
    }
    
    function dayBefore(date)
    {
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        return (day == 1) ?
            ((month == 0) ?
                new Date(year - 1, 11, daysInMonth(year - 1, 11)) :
                new Date(year, month - 1, daysInMonth(year, month - 1))
            ) :
            new Date(year, month, day - 1);
    }
    
    function monthAfter(year, month)
    {
        return (month == 11) ?
            new Date(year + 1, 0, 1) :
            new Date(year, month + 1, 1);
    }
    
    function renderCalendarPage(element, year, month, options)
    {
        options = options || {};
        
        var today = getToday();
        
        var date = new Date(year, month, 1);
        
        //Wind end date forward to saturday week after month
        var endDate = monthAfter(year, month);
        var ff = 6 - endDate.getDay();
        if (ff < 6) ff += 7;
        for (var i = 0; i < ff; i++) endDate = dayAfter(endDate);
        
        var table = $('<table />');
        var thead = $('<thead />').appendTo(table);
        $('<th />').addClass('monthCell').attr('colspan', 7).append(
            $('<a href="javascript:;">&laquo;</a>')
                .addClass('prevMonth')
                .mousedown(function(e) {
                    renderCalendarPage(element,
                        month == 0 ? (year - 1) : year,
                        month == 0 ? 11 : (month - 1), options
                    );
                    e.preventDefault();
                }),
            $('<a href="javascript:;">' + monthNames[date.getMonth()] + ' ' +
                date.getFullYear() + '</a>').addClass('monthName'),
            $('<a href="javascript:;">&raquo;</a>')
                .addClass('nextMonth')
                .mousedown(function() {
                    renderCalendarPage(element,
                        month == 11 ? (year + 1) : year,
                        month == 11 ? 0 : (month + 1), options
                    );
                })
        ).appendTo(thead);
        var dayNames = $('<tr />').appendTo(thead);
        $.each(String('SMTWTFS').split(''), function(k, v) {
            $('<td />').addClass('dayName').append(v).appendTo(dayNames);
        });
        var tbody = $('<tbody />').appendTo(table);
        var row = $('<tr />');

        //Rewind date to monday week before month
        var rewind = date.getDay() + 7;
        for (var i = 0; i < rewind; i++) date = dayBefore(date);
        
        while (date <= endDate) {
            var td = $('<td />')
                .addClass('day')
                .append(
                    $('<a href="javascript:;">' +
                        date.getDate() + '</a>'
                    ).click((function() {
                        var thisDate = date;
                        
                        return function() {
                            if (options && options.selectDate) {
                                options.selectDate(thisDate);
                            }
                        }
                    }()))
                )
                .appendTo(row);
            
            var isToday     = areDatesEqual(date, today);
            var isSelected  = options.selected &&
                                areDatesEqual(options.selected, date);
            
            if (isToday)                    td.addClass('today');
            if (isSelected)                 td.addClass('selected');
            if (isToday && isSelected)      td.addClass('today_selected');
            if (date.getMonth() != month)   td.addClass('nonMonth');
            
            dow = date.getDay();
            if (dow == 6) {
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
    
    function formatDate(date, usa)
    {
        return (usa ?
            ((date.getMonth() + 1) + '/' + date.getDate()) :
            (date.getDate() + '/' + (date.getMonth() + 1))
        ) + '/' + date.getFullYear(); 
    }
    
    function parseDate(date, usa)
    {
        if (usa) return new Date(date);
        a = date.split(/[\.-\/]/);
        var day = a.shift();
        var month = a.shift();
        a.unshift(day);
        a.unshift(month);
        return new Date(a.join('/'));
    }
    
    $.fn.calendricalDate = function(options)
    {
        options = options || {};
        
        return this.each(function() {
            var element = $(this);
            var div;
            
            element.bind('focus click', function() {
                if (div) return;
                var offset = element.offset();
                var padding = element.css('padding-left');
                div = $('<div />')
                    .addClass('calendricalDatePopup')
                    .mousedown(function(e) {
                        e.preventDefault();
                    })
                    .css({
                        position: 'absolute',
                        left: offset.left - padding,
                        top: offset.top + element.height() + padding * 2
                    });
                element.after(div); 
                
                var selected = parseDate(element.val(), options.usa);
                
                renderCalendarPage(
                    div,
                    selected.getFullYear(),
                    selected.getMonth(), {
                        selected: selected,
                        selectDate: function(date) {
                            element.val(formatDate(date, options.usa));
                            div.remove();
                            div = null;
                        }
                    }
                );
            }).blur(function() {
                if (!div) return;
                div.remove();
                div = null;
            });
        });
    }
// })(jQuery);