const test = require('node:test');
const assert = require('node:assert/strict');
const math = require('../lens-match-math.js');
const original = { originalFocalMm: 32, originalDistanceM: 1.5 };
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} ≠ ${expected}`);

test('32 mm at 1.50 m becomes 50 mm at 2.34375 m; unchanged focal keeps distance', () => {
    close(math.distanceForLens({ ...original, newFocalMm: 50 }), 2.34375);
    close(math.distanceForLens({ ...original, newFocalMm: 32 }), 1.5);
    close(math.distanceForLens({ ...original, newFocalMm: 18 }), 0.84375);
});

test('the inverse calculation gives 64 mm at 3.00 m, and reverses every available lens', () => {
    close(math.lensForDistance({ ...original, newDistanceM: 3 }), 64);
    for (const focal of math.DEFAULT_FOCALS) {
        const distance = math.distanceForLens({ ...original, newFocalMm: focal });
        close(math.lensForDistance({ ...original, newDistanceM: distance }), focal);
    }
});

test('available lens distances keep full precision until presentation', () => {
    const rows = math.equivalentDistances({ ...original, focals: [32, 40, 50, 65, 75, 85] });
    assert.deepEqual(rows.map(row => row.distanceM.toFixed(2)), ['1.50', '1.88', '2.34', '3.05', '3.52', '3.98']);
    close(rows[3].distanceM, 3.046875);
});

test('comma decimals are accepted without accepting partial or non-finite numbers', () => {
    assert.equal(math.positiveNumber('1,50'), 1.5);
    assert.equal(math.positiveNumber(' 32.5 '), 32.5);
    for (const value of ['', ' ', '32mm', '1,2,3', '1/2', '1e3', null, undefined, false, 0, -1, NaN, Infinity]) {
        assert.equal(math.positiveNumber(value), null, String(value));
    }
});

test('zero, invalid and overflowing inputs never produce a misleading distance or focal length', () => {
    for (const value of [null, '', 0, -10, NaN, Infinity]) {
        for (const key of ['originalFocalMm', 'originalDistanceM', 'newFocalMm']) {
            assert.equal(math.distanceForLens({ ...original, newFocalMm: 50, [key]: value }), null);
        }
        for (const key of ['originalFocalMm', 'originalDistanceM', 'newDistanceM']) {
            assert.equal(math.lensForDistance({ ...original, newDistanceM: 3, [key]: value }), null);
        }
    }
    assert.equal(math.distanceForLens({ originalFocalMm: 1, originalDistanceM: 1e308, newFocalMm: 1e308 }), null);
});

test('unit conversion preserves physical distance through metres, centimetres and feet', () => {
    close(math.toMetres('150', 'cm'), 1.5);
    close(math.toMetres('1,50', 'm'), 1.5);
    close(math.toMetres('10', 'ft'), 3.048);
    for (const unit of ['m', 'cm', 'ft']) close(math.toMetres(math.fromMetres(2.34375, unit), unit), 2.34375);
    assert.equal(math.toMetres(1, 'constructor'), null);
    assert.equal(math.fromMetres(1, 'unknown'), null);
});

test('custom focal lists are validated, deduplicated and sorted without changing defaults', () => {
    assert.deepEqual(math.focalList('85 / 32 / 50 / 27.5 / 50'), [27.5, 32, 50, 85]);
    assert.deepEqual(math.focalList('18, 21; 25 27'), [18, 21, 25, 27]);
    for (const list of ['', '25 / -50', '0, 32', '25mm / 50', {}, Array(65).fill(50)]) assert.equal(math.focalList(list), null);
    assert.deepEqual(math.DEFAULT_FOCALS, [18, 21, 25, 27, 32, 35, 40, 50, 65, 75, 85, 100, 135]);
    assert.deepEqual(math.equivalentDistances({ ...original, focals: [] }), []);
});
