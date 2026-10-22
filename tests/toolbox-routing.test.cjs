const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function application(hash = '', fakeTimers = false) {
    const elements = new Map();
    const timers = new Map();
    const timerDelays = new Map();
    const audioEvents = {};
    let nextTimer = 0;
    function element(id = '') {
        const classes = new Set();
        return {
            id, style: {}, dataset: {}, value: '', textContent: '', innerHTML: '', tagName: 'DIV', events: {},
            classList: {
                add: value => classes.add(value),
                remove: value => classes.delete(value),
                contains: value => classes.has(value),
                toggle: (value, force) => (force ?? !classes.has(value)) ? classes.add(value) : classes.delete(value)
            },
            closest() { return this.tagName === 'BUTTON' ? this : null; },
            appendChild() {}, addEventListener(name, callback) { (this.events[name] ??= []).push(callback); }
        };
    }
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    for (const match of html.matchAll(/id="([^"]+)"/g)) elements.set(match[1], element(match[1]));
    const pages = [...elements.values()].filter(e => e.id.endsWith('-page'));
    const listeners = {};
    const storage = new Map();
    const inputs = [];
    const context = {
        URLSearchParams, console, screen: {}, navigator: {},
        setTimeout: fakeTimers ? (callback, delay) => { const id = ++nextTimer; timers.set(id, callback); timerDelays.set(id, delay); return id; } : setTimeout,
        clearTimeout: fakeTimers ? id => timers.delete(id) : clearTimeout,
        location: { protocol: 'file:', hash },
        Audio: class {
            load() {} pause() {}
            addEventListener(name, callback) { audioEvents[name] = callback; }
            play() { audioEvents.playing(); return Promise.resolve(); }
        },
        localStorage: {
            getItem: key => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, value)
        },
        document: {
            getElementById: id => elements.get(id) ?? null,
            createElement: () => element(),
            querySelectorAll: selector => selector === '.page' ? pages :
                selector === '#wmm-card-content [data-wmm]' ? inputs : []
        },
        scrollTo() {},
        addEventListener(name, callback) { (listeners[name] ??= []).push(callback); }
    };
    context.window = context;
    vm.createContext(context);
    const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
    // Execute the actual application logic, excluding only the bundled PDF library.
    const start = source.indexOf('window.onload = function()');
    assert.ok(start > 0);
    vm.runInContext(source.slice(start), context);
    vm.runInContext(fs.readFileSync(path.join(root, 'toolbox-routing.js'), 'utf8'), context);
    return { context, elements, pages, listeners, storage, inputs, timers, timerDelays, audioEvents,
        fireTimers() { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); }
    };
}

test('each tool destination opens its actual app page', () => {
    const app = application();
    const expected = {
        film: 'calc-page', dof: 'dop-page', lens: 'lens-match-page', sun: 'sun-page', marks: 'wmm-list-page',
        focus: 'focus-page', ciak: 'ciak-page', chroma: 'chroma-page', home: 'home-page'
    };
    for (const [tool, id] of Object.entries(expected)) {
        assert.equal(app.context.ACScouter.openTool(tool), true);
        assert.equal(app.elements.get(id).style.display, 'flex');
        assert.equal(app.pages.filter(p => p.style.display === 'flex').length, 1);
        assert.equal(app.elements.get('menu-overlay').style.display, 'none');
    }
});

test('an invalid tool cannot navigate or invoke inherited properties', () => {
    const app = application();
    app.context.ACScouter.openTool('film');
    for (const invalid of ['unknown', '__proto__', 'constructor', "film');alert(1)//", null]) {
        assert.equal(app.context.ACScouter.openTool(invalid), false);
        assert.equal(app.elements.get('calc-page').style.display, 'flex');
    }
});

test('browser links work on initial load and on a later hash change', () => {
    const app = application('#tool=marks');
    app.listeners.DOMContentLoaded.forEach(callback => callback());
    app.listeners.load.forEach(callback => callback());
    assert.equal(app.elements.get('wmm-list-page').style.display, 'flex');
    app.context.location.hash = '#tool=chroma';
    app.listeners.hashchange.forEach(callback => callback());
    assert.equal(app.elements.get('chroma-page').style.display, 'flex');
});

test('a widget navigation flushes the current Marks edits before changing pages', () => {
    const app = application();
    vm.runInContext("wmm_cards = [{id: 'card', scene: '45A'}]; wmm_currentId = 'card';", app.context);
    app.inputs.push({ dataset: { wmm: 'optics.focal' }, value: '85' });
    app.context.ACScouter.openTool('dof');
    const cards = JSON.parse(app.storage.get('wmm_cards_v1'));
    assert.equal(cards[0].optics.focal, '85');
    assert.equal(cards[0].scene, '45A');
    assert.equal(app.elements.get('dop-page').style.display, 'flex');
});

test('native backdrop follows clean Focus, every Chroma color, Ciak, and return home', () => {
    const app = application();
    const states = [];
    app.context.ACScouterNative = { setPresentation: state => states.push(JSON.parse(JSON.stringify(state))) };
    app.context.ACScouter.openTool('focus');
    assert.deepEqual(states.at(-1), { backdrop: 'artwork', immersive: false });
    app.elements.get('focus-page').classList.add('clean-mode');
    app.context.ACScouter.syncPresentation();
    assert.deepEqual(states.at(-1), { backdrop: 'black', immersive: true });
    const screen = app.elements.get('chroma-screen');
    for (const color of ['green', 'blue', 'grey', 'white', 'black']) {
        for (const name of ['green', 'blue', 'grey', 'white', 'black']) screen.classList.remove('chroma-' + name);
        screen.classList.add('chroma-' + color);
        app.context.ACScouter.openTool('chroma');
        assert.deepEqual(states.at(-1), { backdrop: color, immersive: false });
    }
    app.elements.get('chroma-page').classList.add('clean-mode');
    app.context.ACScouter.syncPresentation();
    assert.deepEqual(states.at(-1), { backdrop: 'black', immersive: true });
    app.context.ACScouter.openTool('ciak');
    assert.deepEqual(states.at(-1), { backdrop: 'black', immersive: false });
    app.context.ACScouter.openTool('home');
    assert.deepEqual(states.at(-1), { backdrop: 'artwork', immersive: false });
});

test('long press toggles clean mode once; moving, cancelling, controls and navigation cancel it', () => {
    const app = application('', true);
    app.context.initLongPressEvents();
    app.context.ACScouter.openTool('focus');
    const target = app.elements.get('focus-page');
    const pointer = { target, pointerType: 'touch', clientX: 30, clientY: 30 };
    const send = (name, event = pointer) => target.events[name].forEach(callback => callback(event));
    send('pointerdown'); app.fireTimers();
    assert.equal(target.classList.contains('clean-mode'), true);
    send('pointerup'); send('pointerdown'); app.fireTimers();
    assert.equal(target.classList.contains('clean-mode'), false);
    send('pointerdown'); send('pointermove', { clientX: 70, clientY: 30 }); app.fireTimers();
    assert.equal(target.classList.contains('clean-mode'), false);
    send('pointerdown'); send('pointercancel'); app.fireTimers();
    assert.equal(target.classList.contains('clean-mode'), false);
    send('pointerdown', { ...pointer, target: { closest: () => ({ tagName: 'BUTTON' }) } }); app.fireTimers();
    assert.equal(target.classList.contains('clean-mode'), false);
    send('pointerdown'); app.context.ACScouter.openTool('film'); app.fireTimers();
    assert.equal(target.classList.contains('clean-mode'), false);
    let prevented = false;
    send('contextmenu', { preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
});

test('Ciak flashes on the native audio start for only the brief impact', async () => {
    const app = application('', true);
    let now = 1000, claps = 0;
    app.context.Date = class extends Date { static now() { return now; } };
    app.context.ACScouterNative = { playClap() {
        claps++;
        return Promise.resolve({ startTimeMs: 1080, durationMs: 654 });
    } };
    const trigger = app.elements.get('full-screen-trigger');
    const isWhite = () => app.elements.get('ciak-background').classList.contains('flash-white');
    assert.equal(trigger.events.touchstart, undefined);
    assert.equal(trigger.events.mousedown, undefined);
    await trigger.events.pointerdown[0]({ cancelable: true, preventDefault() {} });
    assert.equal(claps, 1);
    assert.equal(isWhite(), false);
    assert.equal(app.timerDelays.get([...app.timers.keys()][0]), 80);
    now = 1080; app.fireTimers();
    assert.equal(isWhite(), true);
    assert.equal(app.timerDelays.get([...app.timers.keys()][0]), 100);
    now = 1180; app.fireTimers();
    assert.equal(isWhite(), false);
});

test('rapid Ciak taps discard stale replies and replace the previous flash timers', async () => {
    const app = application('', true);
    app.context.Date = class extends Date { static now() { return 1000; } };
    const replies = [];
    app.context.ACScouterNative = { playClap() { return new Promise(resolve => replies.push(resolve)); } };
    const press = () => app.elements.get('full-screen-trigger').events.pointerdown[0]({});
    const first = press(), second = press();
    replies[1]({ startTimeMs: 1080, durationMs: 654 }); await second;
    const currentTimer = [...app.timers.keys()][0];
    replies[0]({ startTimeMs: 1020, durationMs: 999 }); await first;
    assert.deepEqual([...app.timers.keys()], [currentTimer]);
    app.fireTimers();
    assert.equal(app.elements.get('ciak-background').classList.contains('flash-white'), true);
    const third = press();
    assert.equal(app.elements.get('ciak-background').classList.contains('flash-white'), false);
    assert.equal(app.timers.size, 0);
    replies[2]({ startTimeMs: 1080, durationMs: 654 }); await third;
    assert.equal(app.timers.size, 1);
});

test('browser Ciak flash is brief even while the audio tail continues', async () => {
    const app = application('', true);
    await app.elements.get('full-screen-trigger').events.pointerdown[0]({});
    assert.equal(app.elements.get('ciak-background').classList.contains('flash-white'), true);
    assert.equal(app.timerDelays.get([...app.timers.keys()][0]), 100);
    app.fireTimers();
    assert.equal(app.elements.get('ciak-background').classList.contains('flash-white'), false);
});
