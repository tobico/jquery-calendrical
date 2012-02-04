# Calendrical

## What is it?

Calendrical is a plugin for jQuery that provides popup date and time pickers inspired by Google Calender.

## Installation

Copy and include the JavaScript file `jquery.calendrical.js`, and the style sheet `calendrical.css` in your project.

If you use SASS for your project, you can include the code in `calendrical.scss` instead of the css file. If you want to change the color scheme for Calendrical, you can edit the color definitions in the scss file and then regenerate the css using `build_css.sh`.

## Usage

You can add Calendrical date and time pickers to your existing text fields using the following functions:

  * .calendricalDate
  * .calendricalTime
  * .calendricalDateRange
  * .calendricalTimeRange
  * .calendricalDateTimeRange
  
See `example.html` for examples of how to use these functions.

## Options

All of the Calendrical functions can accept an options hash as a parameter.

Date options:

  * __usa__ - Use USA-style middle endian dates (7/21/2010), instead of the default European-style little endian dates (21/7/2010).
  * __separator__ - Symbol to use between components of the date. Default: `/`

Time options:

*Time values are parsed as an object with an hour and minute - example: `{hour: 15, minute: 30}`*

  * __isoTime__ - Use 24-hour clock (ISO 8601) instead of default 12 hour clock with am/pm.
  * __meridiemUpperCase__ - Use upper case meridiem (AM/PM) instead of am/pm
  * __defaultTime__ - Default time to scroll the dropdown time select box to,
  if the field doesn't already have a time value when it's shown
  * __timeInterval__ - Interval in minutes between each option in a time picker. Default: 30
  * __minTime__ - The earliest time selectable. This is also the base value when calculating increments, e.g. a start time of {hour: 9, minute: 15} with the default interval of 30 will give the options (9:15, 9:45, 10:15, ...)
  * __maxTime__ - The latest time selectable. If this value does not fall on a valid interval, the last interval before this one will be the latest time selectable (i.e. {hour: 11, minute: 34} becomes 11:30)
