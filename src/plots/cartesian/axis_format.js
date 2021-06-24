'use strict';

var docs = require('../../constants/docs');
var FORMAT_LINK = docs.FORMAT_LINK;
var DATE_FORMAT_LINK = docs.DATE_FORMAT_LINK;

function axisHoverFormat(x, noDates) {
    return {
        valType: 'string',
        dflt: '',
        editType: 'none',
        description: [
            'Sets the hover text formatting rule for `' + x + '`',
            ' using d3 formatting mini-languages which are very similar to those in Python.',
            'See: ' + FORMAT_LINK + (
                noDates ?
                    '' :
                    ' And for dates see: ' + DATE_FORMAT_LINK
                ),
            'By default the values are formatted using ' + (
                noDates ?
                    'generic number format' :
                    ('`' + x + 'axis.hoverformat`')
            ) + '.',
        ].join(' ')
    };
}

function descriptionOnlyNumbers(label) {
    return [
        'Sets the ' + label + ' formatting rule using d3 formatting mini-languages',
        'which are very similar to those in Python. For numbers, see: ' + FORMAT_LINK
    ].join(' ');
}

function descriptionWithDates(label) {
    return descriptionOnlyNumbers(label) + [
        ' And for dates see: ' + DATE_FORMAT_LINK,
        'We add one item to d3\'s date formatter: *%{n}f* for fractional seconds',
        'with n digits. For example, *2016-10-13 09:15:23.456* with tickformat',
        '*%H~%M~%S.%2f* would display *09~15~23.46*'
    ].join(' ');
}

module.exports = {
    axisHoverFormat: axisHoverFormat,
    descriptionOnlyNumbers: descriptionOnlyNumbers,
    descriptionWithDates: descriptionWithDates
};
