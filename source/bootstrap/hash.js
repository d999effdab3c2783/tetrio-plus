// https://gist.github.com/axetroy/69dd9c7790ea63a0cdc2038b40bcb209
function hashCode(any) {
    let hash = 0;
    if (
        any === null ||
        any === void 0 ||
        any === '' ||
        any === 0 ||
        any === false
    ) {
        return 0;
    }

    if (any instanceof RegExp) {
        const str =
            any.source +
            any.dotAll +
            any.flags +
            any.global +
            any.ignoreCase +
            any.lastIndex +
            any.multiline +
            any.sticky +
            any.unicode;
        return hashCode(str);
    }

    if (any instanceof Error) {
        return hashCode(any.message + any.stack);
    }

    // Date
    if (any instanceof Date) {
        return hashCode(any.getTime());
    }

    // if a Number
    if (any instanceof Number) {
        return hashCode(any + '');
    }

    // Map
    if (any instanceof Map) {
        hash = hashCode('Map');
        any.forEach((val, key) => {
            obj[key] = value;
            hash += hashCode(key + value);
        });
        return hash;
    }

    // Set
    if (any instanceof Set) {
        hash = hashCode('Set');
        let i = 0;
        any.forEach(value => {
            hash += hashCode(i + value);
            i++;
        });
        return hash;
    }

    // Object or Array, support nest object
    if (any instanceof Object) {
        for (let key in any) {
            if (any.hasOwnProperty(key)) {
                const value = any[key];
                hash += hashCode(key + value);
            }
        }
        return hash;
    }

    // String
    if (typeof any === 'string') {
        let hash = 0;
        const length = any.length;
        if (length === 0) return hash;
        for (let i = 0; i < length; i++) {
            let chr = any.charCodeAt(i);
            hash = (hash << 5) + chr - hash;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    return hash;
}

Object.defineProperty(Object.prototype, 'hashCode', {
    configurable: false,
    enumerable: false,
    get() {
        return hashCode(this);
    }
});