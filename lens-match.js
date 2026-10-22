/* Lens Match UI. Calculation and unit conversion live in lens-match-math.js. */
(function () {
    'use strict';
    const math = window.LensMatchMath;
    const page = document.getElementById('lens-match-page');
    if (!math || !page) return;
    const storageKey = 'ac_scouter_lens_match_v1';
    const state = {
        mode: 'lens', unit: 'm', originalFocal: '32', originalDistanceM: 1.5,
        newFocal: '50', newDistanceM: 3, focals: [...math.DEFAULT_FOCALS]
    };
    const byId = id => document.getElementById('lm-' + id);
    const fields = {
        originalFocal: byId('original-focal'), originalDistance: byId('original-distance'),
        newFocal: byId('new-focal'), newDistance: byId('new-distance')
    };
    const units = byId('unit');
    const lensMode = byId('mode-lens'), distanceMode = byId('mode-distance');
    const list = byId('focals'), editor = byId('editor'), lensList = byId('lens-list');
    const numberFormat = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const focalFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });
    let lensButtons = [];

    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
            if (['lens', 'distance'].includes(saved.mode)) state.mode = saved.mode;
            if (['m', 'cm', 'ft'].includes(saved.unit)) state.unit = saved.unit;
            for (const key of ['originalFocal', 'newFocal']) {
                if (typeof saved[key] === 'string' && saved[key].length <= 20) state[key] = saved[key];
            }
            for (const key of ['originalDistanceM', 'newDistanceM']) {
                if (saved[key] === null || math.positiveNumber(saved[key]) !== null) state[key] = saved[key];
            }
            const focals = math.focalList(saved.focals);
            if (focals) state.focals = focals;
        }
    } catch (_) { /* A missing/corrupt store must not prevent calculations. */ }

    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
            byId('storage-status').hidden = true;
        } catch (_) {
            byId('storage-status').hidden = false;
        }
    }

    function distanceText(metres, unit = state.unit) {
        const value = math.fromMetres(metres, unit);
        return value === null ? '—' : numberFormat.format(value);
    }

    function feetInches(metres) {
        // Round once in inches before splitting, so 11.99 inches carries to 1 foot.
        const tenths = Math.round(metres / 0.0254 * 10);
        const feet = Math.floor(tenths / 120);
        const inches = (tenths % 120) / 10;
        return feet + '′ ' + inches.toFixed(1) + '″';
    }

    function syncFields() {
        units.value = state.unit;
        fields.originalFocal.value = state.originalFocal;
        fields.newFocal.value = state.newFocal;
        fields.originalDistance.value = state.originalDistanceM === null ? '' : distanceText(state.originalDistanceM).replace(/,/g, '');
        fields.newDistance.value = state.newDistanceM === null ? '' : distanceText(state.newDistanceM).replace(/,/g, '');
    }

    function buildLensButtons() {
        list.replaceChildren();
        lensButtons = state.focals.map(focal => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'lm-lens-button';
            const title = document.createElement('span');
            title.className = 'lm-lens-title';
            title.textContent = focalFormat.format(focal) + ' mm';
            const distance = document.createElement('span');
            distance.className = 'lm-lens-distance';
            button.append(title, distance);
            button.addEventListener('click', () => {
                state.mode = 'lens';
                state.newFocal = String(focal);
                fields.newFocal.value = state.newFocal;
                render(); save();
            });
            list.appendChild(button);
            return { focal, button, distance };
        });
    }

    function render() {
        const byLens = state.mode === 'lens';
        lensMode.setAttribute('aria-pressed', String(byLens));
        distanceMode.setAttribute('aria-pressed', String(!byLens));
        byId('lens-field').hidden = !byLens;
        byId('distance-field').hidden = byLens;
        byId('result-label').textContent = byLens ? 'NEW DISTANCE' : 'NEW FOCAL LENGTH';
        byId('distance-unit').textContent = state.unit;
        byId('new-distance-unit').textContent = state.unit;
        byId('feet-hint').hidden = state.unit !== 'ft';
        const originalFocalMm = math.positiveNumber(state.originalFocal);
        const newFocalMm = math.positiveNumber(state.newFocal);
        const originalDistanceM = state.originalDistanceM;
        const result = byLens
            ? math.distanceForLens({ originalFocalMm, originalDistanceM, newFocalMm })
            : math.lensForDistance({ originalFocalMm, originalDistanceM, newDistanceM: state.newDistanceM });
        byId('result-value').textContent = result === null ? '—' : (byLens ? distanceText(result) : focalFormat.format(result));
        byId('result-unit').textContent = result === null ? '' : (byLens ? state.unit : 'mm');
        byId('result-detail').textContent = result === null ? 'Enter three positive values.' : (byLens
            ? (state.unit === 'cm' ? distanceText(result, 'm') + ' m' : distanceText(result, 'cm') + ' cm') + ' · ' + feetInches(result)
            : 'at ' + distanceText(state.newDistanceM) + ' ' + state.unit + ' · theoretical focal length');
        for (const [name, field] of Object.entries(fields)) {
            field.setAttribute('aria-invalid', String(field.value.trim() !== '' && math.positiveNumber(field.value) === null));
        }
        const equivalents = math.equivalentDistances({ originalFocalMm, originalDistanceM, focals: state.focals });
        lensButtons.forEach(({ focal, button, distance }, index) => {
            const metres = equivalents[index].distanceM;
            const text = distanceText(metres) + (metres === null ? '' : ' ' + state.unit);
            distance.textContent = text;
            const selected = byLens && newFocalMm === focal;
            button.setAttribute('aria-pressed', String(selected));
            button.setAttribute('aria-label', focalFormat.format(focal) + ' mm, ' + text);
        });
    }

    function switchMode(mode) {
        if (mode === state.mode) return;
        const originalFocalMm = math.positiveNumber(state.originalFocal);
        if (mode === 'distance') {
            const distance = math.distanceForLens({ originalFocalMm, originalDistanceM: state.originalDistanceM, newFocalMm: state.newFocal });
            if (distance !== null) state.newDistanceM = distance;
            fields.newDistance.value = state.newDistanceM === null ? '' : distanceText(state.newDistanceM).replace(/,/g, '');
        } else {
            const focal = math.lensForDistance({ originalFocalMm, originalDistanceM: state.originalDistanceM, newDistanceM: state.newDistanceM });
            if (focal !== null) state.newFocal = focalFormat.format(focal).replace(/,/g, '');
            fields.newFocal.value = state.newFocal;
        }
        state.mode = mode;
        render(); save();
    }

    fields.originalFocal.addEventListener('input', () => { state.originalFocal = fields.originalFocal.value; render(); save(); });
    fields.newFocal.addEventListener('input', () => { state.newFocal = fields.newFocal.value; render(); save(); });
    fields.originalDistance.addEventListener('input', () => { state.originalDistanceM = math.toMetres(fields.originalDistance.value, state.unit); render(); save(); });
    fields.newDistance.addEventListener('input', () => { state.newDistanceM = math.toMetres(fields.newDistance.value, state.unit); render(); save(); });
    units.addEventListener('change', () => { state.unit = units.value; syncFields(); render(); save(); });
    lensMode.addEventListener('click', () => switchMode('lens'));
    distanceMode.addEventListener('click', () => switchMode('distance'));
    editor.addEventListener('toggle', () => {
        if (editor.open) { lensList.value = state.focals.join(' / '); byId('list-error').textContent = ''; }
    });
    byId('lens-form').addEventListener('submit', event => {
        event.preventDefault();
        const focals = math.focalList(lensList.value);
        if (!focals) { byId('list-error').textContent = 'Enter 1–64 positive focal lengths. Use a dot for decimals.'; return; }
        state.focals = focals;
        buildLensButtons(); render(); save();
        editor.open = false;
        byId('editor-summary').focus();
    });
    byId('reset-list').addEventListener('click', () => {
        state.focals = [...math.DEFAULT_FOCALS];
        lensList.value = state.focals.join(' / ');
        byId('list-error').textContent = '';
        buildLensButtons(); render(); save();
    });
    syncFields(); buildLensButtons(); render();
})();
