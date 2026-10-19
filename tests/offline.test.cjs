const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function worker() {
    const handlers = {}, entries = new Map(), removed = [];
    let skips = 0, claims = 0, requests = 0;
    const scope = 'https://camtools.github.io/AC-Scouter/';
    const cache = {
        async addAll(assets) {
            for (const asset of assets) {
                const file = asset === './' ? 'index.html' : asset;
                assert.ok(fs.existsSync(path.join(root, file)), `Missing offline asset: ${asset}`);
                entries.set(new URL(asset, scope).href, file);
            }
        },
        async match(request) { return entries.get(new URL(request.url || request, scope).href); }
    };
    const context = {
        self: {
            registration: { scope },
            addEventListener(name, callback) { handlers[name] = callback; },
            async skipWaiting() { skips++; },
            clients: { async claim() { claims++; } }
        },
        caches: {
            async open() { return cache; },
            async keys() { return ['ac-scouter-v4', 'ac-scouter-web-v12', 'other-app']; },
            async delete(name) { removed.push(name); }
        },
        async fetch() { requests++; throw Error('offline'); }
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), context);
    async function lifecycle(name) { let pending; handlers[name]({ waitUntil(p) { pending = p; } }); await pending; }
    function request(asset, mode = 'no-cors', method = 'GET') {
        let response;
        handlers.fetch({ request: { url: new URL(asset, scope).href, mode, method }, respondWith(p) { response = p; } });
        return response;
    }
    return { entries, removed, lifecycle, request, counts: () => ({ skips, claims, requests }) };
}

test('offline installation includes every local image, script, icon and real Ciak audio', async () => {
    const app = worker(); await app.lifecycle('install');
    for (const asset of ['index.html', 'style.css', 'script.js', 'toolbox-routing.js', 'Pixel.jpg', 'Ciak_Background.png', 'clap.wav', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']) {
        assert.ok(await app.request(asset), asset);
    }
    assert.equal(app.counts().requests, 0);
    assert.equal(app.counts().skips, 1);
});

test('offline navigations with a query still open the app; external APIs and writes pass through', async () => {
    const app = worker(); await app.lifecycle('install');
    assert.equal(await app.request('index.html?from=home', 'navigate'), './index.html');
    assert.equal(app.request('https://api.open-meteo.com/v1/forecast'), undefined);
    assert.equal(app.request('index.html', 'cors', 'POST'), undefined);
});

test('an update retires only old AC Scouter caches without touching stored Marks or other apps', async () => {
    const app = worker(); await app.lifecycle('activate');
    assert.deepEqual(app.removed, ['ac-scouter-v4']);
    assert.equal(app.counts().claims, 1);
});
