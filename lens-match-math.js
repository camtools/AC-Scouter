/* Subject-size matching for the same sensor/crop. Distances are canonical metres.
   This is the requested focal-length ratio approximation, not a perspective match. */
(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.LensMatchMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const DEFAULT_FOCALS = Object.freeze([18, 21, 25, 27, 32, 35, 40, 50, 65, 75, 85, 100, 135]);
    const METRES_PER_UNIT = Object.freeze({ m: 1, cm: 0.01, ft: 0.3048 });

    function positiveNumber(value) {
        if (typeof value === 'string') {
            value = value.trim();
            if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value)) return null;
            value = Number(value.replace(',', '.'));
        }
        return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
    }

    function distanceForLens({ originalFocalMm, originalDistanceM, newFocalMm }) {
        const focalA = positiveNumber(originalFocalMm);
        const distanceA = positiveNumber(originalDistanceM);
        const focalB = positiveNumber(newFocalMm);
        if (focalA === null || distanceA === null || focalB === null) return null;
        return positiveNumber(distanceA * (focalB / focalA));
    }

    function lensForDistance({ originalFocalMm, originalDistanceM, newDistanceM }) {
        const focalA = positiveNumber(originalFocalMm);
        const distanceA = positiveNumber(originalDistanceM);
        const distanceB = positiveNumber(newDistanceM);
        if (focalA === null || distanceA === null || distanceB === null) return null;
        return positiveNumber(focalA * (distanceB / distanceA));
    }

    function toMetres(value, unit) {
        const number = positiveNumber(value);
        if (number === null || !Object.hasOwn(METRES_PER_UNIT, unit)) return null;
        return positiveNumber(number * METRES_PER_UNIT[unit]);
    }

    function fromMetres(value, unit) {
        const number = positiveNumber(value);
        if (number === null || !Object.hasOwn(METRES_PER_UNIT, unit)) return null;
        return positiveNumber(number / METRES_PER_UNIT[unit]);
    }

    function focalList(value) {
        const parts = typeof value === 'string' ? value.trim().split(/[\s,;/]+/).filter(Boolean) : value;
        if (!Array.isArray(parts) || parts.length === 0 || parts.length > 64) return null;
        const numbers = parts.map(positiveNumber);
        if (numbers.some(number => number === null)) return null;
        return [...new Set(numbers)].sort((a, b) => a - b);
    }

    function equivalentDistances({ originalFocalMm, originalDistanceM, focals = DEFAULT_FOCALS }) {
        const values = focalList(focals);
        if (!values) return [];
        return values.map(focalMm => ({
            focalMm, distanceM: distanceForLens({ originalFocalMm, originalDistanceM, newFocalMm: focalMm })
        }));
    }

    return Object.freeze({ DEFAULT_FOCALS, positiveNumber, distanceForLens, lensForDistance,
        toMetres, fromMetres, focalList, equivalentDistances });
});
