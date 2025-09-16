'use strict';

function buildAliasMaps(aliasOption) {
    var groups = Object.create(null);
    var reverse = Object.create(null);

    if(aliasOption) {
        Object.keys(aliasOption).forEach(function(key) {
            var list = aliasOption[key];
            if(!Array.isArray(list)) list = [list];

            var group = [key];
            for(var i = 0; i < list.length; i++) {
                if(list[i] === undefined || list[i] === null) continue;
                group.push(list[i]);
            }

            groups[key] = group;
            for(var j = 0; j < group.length; j++) {
                reverse[group[j]] = key;
            }
        });
    }

    return {groups: groups, reverse: reverse};
}

function isNumberLike(value) {
    return /^-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(value);
}

function isOptionLike(token) {
    if(token === undefined) return false;
    if(token === '--') return false;
    if(token === '-') return false;
    if(token.length === 0) return false;
    if(token[0] !== '-') return false;
    return !(isNumberLike(token) || /^-0x[0-9a-f]+$/i.test(token));
}

function toBoolean(value) {
    if(typeof value === 'string') {
        var lower = value.toLowerCase();
        if(lower === 'false' || lower === '0' || lower === 'off' || lower === 'no') return false;
        if(lower === 'true' || lower === '1' || lower === 'on' || lower === 'yes') return true;
    }
    return Boolean(value);
}

function coerceValue(value, canonical, stringSet) {
    if(stringSet.has(canonical)) {
        if(value === true) return '';
        return value === undefined ? '' : String(value);
    }

    if(value === undefined) return true;
    if(value === true || value === false) return value;
    if(typeof value !== 'string') return value;
    if(value.length === 0) return value;

    var num = Number(value);
    return Number.isNaN(num) ? value : num;
}

module.exports = function parseArgs(argv, opts) {
    if(!Array.isArray(argv)) argv = [];
    opts = opts || {};

    var aliasMaps = buildAliasMaps(opts.alias);
    var aliasGroups = aliasMaps.groups;
    var reverseAlias = aliasMaps.reverse;

    function canonicalKey(name) {
        return reverseAlias[name] || name;
    }

    function getGroup(name) {
        var canonical = canonicalKey(name);
        var group = aliasGroups[canonical];
        if(group) return group;
        return [canonical];
    }

    var result = { _: [] };

    var booleanCanonical = new Set();
    var booleanSet = new Set();
    (opts.boolean || []).forEach(function(name) {
        var canonical = canonicalKey(name);
        booleanCanonical.add(canonical);
        getGroup(name).forEach(function(n) {
            booleanSet.add(n);
        });
    });

    var stringSet = new Set();
    (opts.string || []).forEach(function(name) {
        getGroup(name).forEach(function(n) {
            stringSet.add(n);
        });
    });

    function syncGroup(canonical) {
        var group = aliasGroups[canonical];
        if(!group) return;
        var value = result[canonical];
        for(var i = 0; i < group.length; i++) {
            var name = group[i];
            if(name !== canonical) result[name] = value;
        }
    }

    function assignValue(canonical, value) {
        if(Object.prototype.hasOwnProperty.call(result, canonical)) {
            var current = result[canonical];
            if(Array.isArray(current)) {
                current.push(value);
            } else {
                result[canonical] = [current, value];
            }
        } else {
            result[canonical] = value;
        }
        syncGroup(canonical);
    }

    for(var i = 0; i < argv.length; i++) {
        var arg = argv[i];

        if(arg === '--') {
            for(var rest = i + 1; rest < argv.length; rest++) {
                result._.push(argv[rest]);
            }
            break;
        }

        if(arg.length > 2 && arg.slice(0, 2) === '--') {
            var keyValue = arg.slice(2);

            if(keyValue.slice(0, 3) === 'no-') {
                var candidate = canonicalKey(keyValue.slice(3));
                if(booleanSet.has(candidate)) {
                    assignValue(candidate, false);
                    continue;
                }
            }

            var eqIndex = keyValue.indexOf('=');
            var key = eqIndex === -1 ? keyValue : keyValue.slice(0, eqIndex);
            var value = eqIndex === -1 ? undefined : keyValue.slice(eqIndex + 1);
            var canonical = canonicalKey(key);
            var isBoolean = booleanSet.has(canonical);

            if(value === undefined && isBoolean) {
                var nextBool = argv[i + 1];
                if(nextBool !== undefined && !isOptionLike(nextBool)) {
                    value = nextBool;
                    i++;
                }
            } else if(value === undefined && !isBoolean) {
                var next = argv[i + 1];
                if(next !== undefined && !isOptionLike(next)) {
                    value = next;
                    i++;
                }
            }

            if(isBoolean) {
                var boolValue = value === undefined ? true : toBoolean(value);
                assignValue(canonical, boolValue);
            } else {
                var coerced = coerceValue(value, canonical, stringSet);
                assignValue(canonical, coerced);
            }

            continue;
        }

        if(arg.length > 1 && arg[0] === '-') {
            var letters = arg.slice(1);
            if(letters.length === 0) {
                result._.push(arg);
                continue;
            }

            var shortEqIdx = letters.indexOf('=');
            var shortKey = shortEqIdx === -1 ? letters : letters.slice(0, shortEqIdx);
            var shortValue = shortEqIdx === -1 ? undefined : letters.slice(shortEqIdx + 1);
            var canonicalShort = canonicalKey(shortKey);
            var isShortBoolean = booleanSet.has(canonicalShort);

            if(shortValue === undefined && isShortBoolean) {
                var nextShortBool = argv[i + 1];
                if(nextShortBool !== undefined && !isOptionLike(nextShortBool)) {
                    shortValue = nextShortBool;
                    i++;
                }
            } else if(shortValue === undefined && !isShortBoolean) {
                var nextShort = argv[i + 1];
                if(nextShort !== undefined && !isOptionLike(nextShort)) {
                    shortValue = nextShort;
                    i++;
                }
            }

            if(isShortBoolean) {
                assignValue(canonicalShort, shortValue === undefined ? true : toBoolean(shortValue));
            } else {
                var shortCoerced = coerceValue(shortValue, canonicalShort, stringSet);
                assignValue(canonicalShort, shortCoerced);
            }

            continue;
        }

        result._.push(arg);
    }

    var defaults = opts.default || {};
    Object.keys(defaults).forEach(function(key) {
        var canonical = canonicalKey(key);
        if(!Object.prototype.hasOwnProperty.call(result, canonical)) {
            result[canonical] = defaults[key];
            syncGroup(canonical);
        }
    });

    booleanCanonical.forEach(function(canonical) {
        if(!Object.prototype.hasOwnProperty.call(result, canonical)) {
            result[canonical] = false;
            syncGroup(canonical);
        }
    });

    if(!Array.isArray(result._)) result._ = [];

    return result;
};
