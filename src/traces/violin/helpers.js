'use strict';

var Lib = require('../../lib');

// Maybe add kernels more down the road,
// but note that the default `spanmode: 'soft'` bounds might have
// to become kernel-dependent
var kernels = {
    gaussian: function(v) {
        return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * v * v);
    }
};

exports.makeKDE = function(calcItem, trace, vals) {
    var len = vals.length;
    var kernel = kernels.gaussian;
    var bandwidth = calcItem.bandwidth;
    var factor = 1 / (len * bandwidth);

    // don't use Lib.aggNums to skip isNumeric checks
    return function(x) {
        var sum = 0;
        for(var i = 0; i < len; i++) {
            sum += kernel((x - vals[i]) / bandwidth);
        }
        return factor * sum;
    };
};

exports.getPositionOnKdePath = function(calcItem, trace, valuePx) {
    var posLetter, valLetter;

    if(trace.orientation === 'h') {
        posLetter = 'y';
        valLetter = 'x';
    } else {
        posLetter = 'x';
        valLetter = 'y';
    }

    var pointOnPath = Lib.findPointOnPath(
        calcItem.path,
        valuePx,
        valLetter,
        {pathLength: calcItem.pathLength}
    );

    var posCenterPx = calcItem.posCenterPx;
    var posOnPath0 = pointOnPath[posLetter];
    var posOnPath1 = trace.side === 'both' ?
        2 * posCenterPx - posOnPath0 :
        posCenterPx;

    return [posOnPath0, posOnPath1];
};

exports.getKdeValue = function(calcItem, trace, valueDist) {
    var pts = calcItem.pts;

    if(pts && pts.length) {
        var vals = pts.map(exports.extractVal);
        var kde = exports.makeKDE(calcItem, trace, vals);
        return kde(valueDist) / calcItem.posDensityScale;
    }

    // if pts are not available (precomputed case), use density
    var density = calcItem.density || [];
    var len = density.length;
    if(!len) return NaN;

    // if before range (very small chance), return first value
    if(valueDist <= density[0].t) {
        return density[0].v / calcItem.posDensityScale;
    }
    
    // if inside of range, linearly interpolate val
    for(var i = 1; i < len; i++) {
        var prev = density[i - 1];
        var curr = density[i];
        if(valueDist <= curr.t) {
            var span = curr.t - prev.t;
            var alpha = span ? (valueDist - prev.t) / span : 0;
            var interpolated = prev.v + alpha * (curr.v - prev.v);
            return interpolated / calcItem.posDensityScale;
        }
    }

    // if after range (very small chance), return last value
    return density[len - 1].v / calcItem.posDensityScale;
};

exports.extractVal = function(o) { return o.v; };
