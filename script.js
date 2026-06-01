/* ==========================================
   1. INIZIALIZZAZIONE UNIFICATA
   ========================================== */
window.onload = function() {
    // Inizializza i menu a tendina
    handleFormatChange();   
    updateBrandOptions();   
    
    // Inizializza il sistema Long Press universale (Chroma e Focus)
    initLongPressEvents(); 

    // Imposta data odierna nel Sun Tracker
    const dateInput = document.getElementById('sun-date');
    if(dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
};

/* ==========================================
   2. NAVIGAZIONE & UI
   ========================================== */
function toggleMenu() {
    const menu = document.getElementById('menu-overlay');
    const isVisible = menu.style.display === 'flex';
    menu.style.display = isVisible ? 'none' : 'flex';
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'flex';
    }
    document.getElementById('menu-overlay').style.display = 'none';
    window.scrollTo(0, 0);
}

function goHome() {
    // Rimuove la classe active da tutte le pagine per mostrare la Hero (Splash Screen)
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    window.scrollTo(0, 0);
}

/* ==========================================
   3. LOGICA CALCOLO PELLICOLA
   ========================================== */
function handleFormatChange() {
    const format = document.getElementById('format').value;
    const perfSelect = document.getElementById('perf');
    if(!perfSelect) return;
    perfSelect.innerHTML = ''; 
    if (format === '35mm') {
        perfSelect.innerHTML = `<option value="4">4 Perforations</option><option value="3">3 Perforations</option><option value="2">2 Perforations</option>`;
    } else if (format === '16mm' || format === '8mm') {
        perfSelect.innerHTML = `<option value="std">Standard</option>`;
    } else if (format === '65mm') {
        perfSelect.innerHTML = `<option value="5">5 Perforations</option><option value="15">15 Perforations (IMAX)</option>`;
    }
    calculate(); 
}

function calculate() {
    const amount = parseFloat(document.getElementById('footage').value);
    const format = document.getElementById('format').value;
    const perf = document.getElementById('perf').value;
    const unit = document.getElementById('unit').value;
    const fps = parseInt(document.getElementById('fps').value);
    const resultDisplay = document.getElementById('time-result');
    if (!amount || amount <= 0) { resultDisplay.innerText = "00:00"; return; }
    let fpf; 
    switch(format) {
        case '35mm': fpf = (perf==='4') ? 16 : (perf==='3') ? 21.3333 : 32; break;
        case '16mm': fpf = 40; break;
        case '8mm': fpf = 72; break;
        case '65mm': fpf = (perf==='15') ? 3.125 : 12.8; break;
        default: fpf = 16;
    }
    let feet = (unit === 'meters') ? amount * 3.28084 : amount;
    let totalSeconds = (feet * fpf) / fps;
    let mins = Math.floor(totalSeconds / 60);
    let secs = Math.floor(totalSeconds % 60);
    resultDisplay.innerText = `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

/* ==========================================
   4. LOGICA D.O.P. (Profondità di Campo)
   ========================================== */
function updateBrandOptions() {
    const type = document.getElementById('sensor-type').value;
    const brandSelect = document.getElementById('camera-brand');
    if (type === 'film') {
        document.getElementById('label-brand').innerText = "FORMAT";
        document.getElementById('label-model').innerText = "PERFORATION";
        brandSelect.innerHTML = `
            <option value="8mm">Super 8</option>
            <option value="16mm">16mm / Super 16</option>
            <option value="35mm" selected>35mm</option>
            <option value="65mm">65mm</option>`;
    } else {
        document.getElementById('label-brand').innerText = "CAMERA BRAND";
        document.getElementById('label-model').innerText = "RESOLUTION";
        brandSelect.innerHTML = `
            <option value="arri" selected>ARRI</option>
            <option value="red">RED</option>
            <option value="sony">SONY</option>`;
    }
    updateModelOptions();
}

function updateModelOptions() {
    const type = document.getElementById('sensor-type').value;
    const brand = document.getElementById('camera-brand').value;
    const cameraSelect = document.getElementById('camera-format');
    cameraSelect.innerHTML = '';

    if (type === 'digital') {
    // --- SEZIONE DIGITALE (IL TUO CODICE ARRI/SONY/RED) ---
    if (brand === 'arri') {
        cameraSelect.innerHTML = `
            <optgroup label="ALEXA 35">
            <option value="0.020">4.6K 3:2 OG</option>
            <option value="0.020">4K 16:9 (UHD)</option>
            <option value="0.020">3.3K 6:5 (Ana 2x)</option>
            <option value="0.015">2K 16:9 (S16)</option>
            </optgroup>
            <optgroup label="ALEXA LF / MINI LF">
            <option value="0.030">4.5K 3:2 OG</option>
            <option value="0.030">LF UHD 16:9</option>
            <option value="0.020">3.2K 16:9 (S35)</option>
            </optgroup>
            <optgroup label="MINI / SXT / XT">
            <option value="0.020">3.4K 3:2 OG</option>
            <option value="0.020">2.8K 4:3 (Ana 2x)</option>
            <option value="0.020">2.8K 16:9</option>
            <option value="0.015">HD Ana (S16)</option>
            </optgroup>
            <optgroup label="AMIRA">
            <option value="0.020">S35 16:9 (UHD/HD)</option>
            <option value="0.015">S16 (HD)</option>
            </optgroup>
            <optgroup label="ALEXA 65">
            <option value="0.050">6.5K OG</option>
            <option value="0.050">5K 16:9</option>
            </optgroup>`;
    } else if (brand === 'sony') {
        cameraSelect.innerHTML = `
            <optgroup label="SONY VENICE 2 (8.6K)">
            <option value="0.030">8.6K 3:2 (FF)</option>
            <option value="0.020">5.8K 17:9 (S35)</option>
            </optgroup>
            <optgroup label="SONY VENICE 2 (6K)">
            <option value="0.030">6K 3:2 (FF)</option>
            <option value="0.020">4K 17:9 (S35)</option>
            </optgroup>
            <optgroup label="SONY VENICE 1 (6K)">
            <option value="0.030">6K 3:2 (FF)</option>
            <option value="0.015">3.8K 16:9</option>
            </optgroup>
            <optgroup label="LINEA FX">
            <option value="0.030">FX9/FX6/FX3 (FF)</option>
            <option value="0.020">FX9/FX6 (S35)</option>
            </optgroup>`;
    } else if (brand === 'red') {
        cameraSelect.innerHTML = `
            <optgroup label="GEMINI 5K (S35)">
            <option value="0.022">5K Full</option><option value="0.018">4K</option>
            </optgroup>
            <optgroup label="V-RAPTOR 8K VV">
            <option value="0.030">8K Full</option><option value="0.026">7K</option>
            <option value="0.022">6K</option><option value="0.015">4K</option>
            </optgroup>
            <optgroup label="KOMODO 6K">
            <option value="0.019">6K Full</option><option value="0.013">4K </option>
            </optgroup>
            <optgroup label="SCARLET-W / DRAGON">
            <option value="0.020">5K Full</option><option value="0.016">4K</option>
            </optgroup>
            <optgroup label="MONSTRO 8K VV">
            <option value="0.030">8K Full</option><option value="0.022">6K S35</option>
            </optgroup>`;
            }
    } else {
    // --- SEZIONE PELLICOLA (REVISIONATA) ---
    if (brand === '8mm') {
        cameraSelect.innerHTML = `<option value="0.011">Standard</option>`; 
    } else if (brand === '16mm') {
        cameraSelect.innerHTML = `<option value="0.015">Standard</option>`;
    } else if (brand === '35mm') {
        cameraSelect.innerHTML = `
        <option value="0.029">4 Perforation</option>
        <option value="0.025">3 Perforation</option>
        <option value="0.020">2 Perforation (Techniscope)</option>`;
    } else if (brand === '65mm') {
        cameraSelect.innerHTML = `
        <option value="0.050">5 Perforation</option>
        <option value="0.060">15 Perforation (IMAX)</option>`;
    }
}
calculateDop();
}

const cineFocals = [16, 18, 20, 24, 28, 32, 40, 50, 65, 85, 100, 120, 135, 150, 180, 200, 300];

function updateFromRange() {
    let range = document.getElementById('focal-range');
    let val = parseInt(range.value);
    for (let f of cineFocals) { if (Math.abs(val - f) < 5) { val = f; range.value = f; break; } }
    document.getElementById('focal-num').value = val;
    calculateDop();
}

function updateFromNumber() {
    document.getElementById('focal-range').value = document.getElementById('focal-num').value;
    calculateDop();
}

function calculateDop() {
    const f = parseFloat(document.getElementById('focal-num').value); 
    const N = parseFloat(document.getElementById('aperture').value);  
    const coc = parseFloat(document.getElementById('camera-format').value);
    const unit = document.getElementById('dop-unit').value;
    let sInput = parseFloat(document.getElementById('distance').value);
    if (!f || !N || !sInput || sInput <= 0) return;
    let s = (unit === 'feet') ? sInput * 304.8 : sInput * 1000;
    const H = ((f * f) / (N * coc)) + f;
    const Dn = (s * (H - f)) / (H + s - (2 * f));
    let Df = (s >= (H - f)) ? Infinity : (s * (H - f)) / (H - s);
    const formatVal = (mm) => {
        if (mm === Infinity || mm > 1000000) return "∞";
        let v = (unit === 'feet') ? mm / 304.8 : mm / 1000;
        return v.toFixed(2) + (unit === 'feet' ? " ft" : " m");
    };
    document.getElementById('near-limit').innerText = formatVal(Dn);
    document.getElementById('far-limit').innerText = formatVal(Df);
    document.getElementById('hyperfocal-val').innerText = formatVal(H);
    document.getElementById('total-dop-val').innerText = (Df === Infinity) ? "∞" : formatVal(Df - Dn);
}


/* ==========================================
   5. LOGICA SUN TRACKER (REAL DATA)
   ========================================== */
function setLocMode(mode) {
    document.getElementById('btn-gps').classList.toggle('active', mode === 'gps');
    document.getElementById('btn-manual').classList.toggle('active', mode === 'manual');
    document.getElementById('city-input-wrap').classList.toggle('hidden', mode === 'gps');
}

async function calculateSun() {
    const sunriseEl = document.getElementById('sunrise-val');
    const sunsetEl = document.getElementById('sunset-val');
    const goldenEl = document.getElementById('golden-range');
    const blueEl = document.getElementById('blue-range');
    const date = document.getElementById('sun-date').value;
    const isManual = document.getElementById('btn-manual').classList.contains('active');
    
    sunriseEl.innerText = "SCAN...";
    sunsetEl.innerText = "SCAN...";

    try {
        let lat, lon;
        if (isManual) {
            const city = document.getElementById('manual-city').value;
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=it&format=json`);
            const geoData = await geoRes.json();
            if (!geoData.results) throw new Error("Città non trovata");
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
        } else {
            const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
        }

        const sunRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&start_date=${date}&end_date=${date}`);
        const sunData = await sunRes.json();

        const sunriseDate = new Date(sunData.daily.sunrise[0]);
        const sunsetDate = new Date(sunData.daily.sunset[0]);

        const formatT = (d) => d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        setTimeout(() => {
            sunriseEl.innerText = formatT(sunriseDate);
            sunsetEl.innerText = formatT(sunsetDate);
            if(goldenEl) goldenEl.innerText = `${formatT(new Date(sunsetDate.getTime() - 3600000))} - ${formatT(sunsetDate)}`;
            if(blueEl) blueEl.innerText = `${formatT(new Date(sunsetDate.getTime() + 600000))} - ${formatT(new Date(sunsetDate.getTime() + 1800000))}`;
        }, 800);

    } catch (e) {
        sunriseEl.innerText = "--:--";
        alert("Errore Scouter: " + e.message);
    }
}

/* ==========================================
   6. FOCUS CHART
   ========================================== */
function toggleFullScreen() {
    const chart = document.querySelector('.chart-wrapper');
    if (!document.fullscreenElement) {
        chart.requestFullscreen().catch(err => alert(err.message));
    } else {
        document.exitFullscreen();
    }
}

/* ==========================================
   7. CHROMA SECTION
   ========================================== */
function setChroma(color) {
    const screen = document.getElementById('chroma-screen');
    const buttons = document.querySelectorAll('.c-btn');
    screen.className = 'chroma-screen chroma-' + color;
    buttons.forEach(btn => btn.classList.toggle('active', btn.classList.contains('btn-' + color)));
    if (navigator.vibrate) navigator.vibrate(20);
}

/* ==========================================
   8. LOGICA CIAK (TRIGGER, FLASH & SOUND) E CLEAN MODE
   ========================================== */
const ciakTrigger = document.getElementById('full-screen-trigger');
const cleanTrigger = document.getElementById('clean-mode-trigger');
const ciakBg = document.getElementById('ciak-background');
const ciakPage = document.getElementById('ciak-page');

// Inizializzazione Audio
const clapSound = new Audio('clap.wav');
clapSound.load(); 

// --- AZIONE 1: BATTITO DEL CIAK (Sulle stecche) ---
if(ciakTrigger) {
    const executeCiak = (e) => {
        if (e.cancelable) e.preventDefault(); 
        
        // Riproduzione istantanea (tolto il ritardo)
        clapSound.currentTime = 0;
        clapSound.play().catch(err => console.log("Errore audio:", err));
        
        ciakBg.classList.add('flash-white');
        if (navigator.vibrate) navigator.vibrate(50);

        setTimeout(() => {
            ciakBg.classList.remove('flash-white');
        }, 1000);
    };

    // Ora parte appena TOCCHI (touchstart), non quando rilasci. Molto più realistico!
    ciakTrigger.addEventListener('touchstart', executeCiak, { passive: false });
    ciakTrigger.addEventListener('mousedown', executeCiak);
}

// --- AZIONE 2: CLEAN MODE (Quadrato in basso a sinistra) ---
if(cleanTrigger) {
    let cleanTimer;
    
    const startClean = (e) => {
        if (e.cancelable) e.preventDefault();
        
        // Timer di 800ms
        cleanTimer = setTimeout(() => {
            ciakPage.classList.toggle('clean-mode');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }, 800);
    };
    
    const stopClean = () => {
        clearTimeout(cleanTimer);
    };

    cleanTrigger.addEventListener('touchstart', startClean, { passive: false });
    cleanTrigger.addEventListener('touchend', stopClean);
    cleanTrigger.addEventListener('mousedown', startClean);
    cleanTrigger.addEventListener('mouseup', stopClean);
    cleanTrigger.addEventListener('mouseleave', stopClean);
}


/* ==========================================
   9. UNIVERSAL LONG PRESS (Clean Mode)
   ========================================== */
let globalLongPressTimer;

function initLongPressEvents() {
    const targets = [
        document.getElementById('chroma-screen'),
        document.getElementById('focus-page') // Corretto il riferimento
    ];

    targets.forEach(target => {
        if (!target) return;
        const startPress = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('c-btn')) return;
            globalLongPressTimer = setTimeout(() => {
                target.closest('.page').classList.toggle('clean-mode');
                if (navigator.vibrate) navigator.vibrate(60);
            }, 1000);
        };
        const stopPress = () => clearTimeout(globalLongPressTimer);

        target.addEventListener('touchstart', startPress, { passive: true });
        target.addEventListener('touchend', stopPress);
        target.addEventListener('mousedown', startPress);
        target.addEventListener('mouseup', stopPress);
    });
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('AC Scouter: Pronto per l\'uso offline!'))
      .catch(err => console.log('Errore PWA:', err));
  });
}
/* ==========================================
   WITNESS MARKS — Logica (aggiunta a AC Scouter)
   Tutte le funzioni e variabili hanno prefisso wmm_
   per non interferire con il codice esistente.
   ========================================== */

const WMM_KEY = 'wmm_cards_v1';
const WMM_SECTIONS = ['camera', 'settings', 'optics', 'gps', 'notes', 'image'];
const WMM_REQUIRED = {
    camera:   ['camera.model','camera.height','camera.distance','camera.angle'],
    settings: ['settings.fps','settings.shutter','settings.iso','settings.kelvin','settings.codec'],
    optics:   ['optics.focal','optics.tstop','optics.series','optics.focusDistance'],
    gps:      ['gps.lat'],
    notes:    ['notes'],
    image:    ['image']
};

let wmm_cards = [];
let wmm_currentId = null;
let wmm_saveTimer = null;

/* ---- Utility ---- */
function wmm_uid() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function wmm_getField(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function wmm_setField(obj, path, val) {
    const keys = path.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (o[keys[i]] == null || typeof o[keys[i]] !== 'object') o[keys[i]] = {};
        o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = val;
}
function wmm_filled(v) {
    return v !== undefined && v !== null && String(v).trim() !== '';
}
function wmm_fmtDate(ts) {
    return new Date(ts).toLocaleString('it-IT', {
        day:'2-digit', month:'2-digit', year:'numeric',
        hour:'2-digit', minute:'2-digit'
    });
}
function wmm_esc(s) {
    return String(s).replace(/[&<>"']/g, c =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
    );
}

/* ---- Storage ---- */
function wmmLoadCards() {
    try {
        const raw = localStorage.getItem(WMM_KEY);
        wmm_cards = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(wmm_cards)) wmm_cards = [];
    } catch(e) { wmm_cards = []; }
}
function wmmPersist() {
    try {
        localStorage.setItem(WMM_KEY, JSON.stringify(wmm_cards));
        return true;
    } catch(e) {
        alert('Memoria piena: impossibile salvare. Esporta o elimina schede con foto.');
        return false;
    }
}
function wmm_getCurrent() {
    return wmm_cards.find(c => c.id === wmm_currentId) || null;
}

/* ---- Completamento ---- */
function wmm_isSectionComplete(card, sec) {
    if (!card) return false;
    return WMM_REQUIRED[sec].every(path => wmm_filled(wmm_getField(card, path)));
}
function wmm_countComplete(card) {
    return WMM_SECTIONS.filter(s => wmm_isSectionComplete(card, s)).length;
}
function wmm_refreshCompleteness() {
    const card = wmm_getCurrent();
    document.querySelectorAll('#wmm-card-content .wmm-section').forEach(sec => {
        const name = sec.dataset.wmmSection;
        sec.classList.toggle('complete', wmm_isSectionComplete(card, name));
    });
    const n = wmm_countComplete(card);
    const el = document.getElementById('wmm-progress-count');
    if (el) el.textContent = n + ' / 6';
}

/* ==========================================
   NAVIGAZIONE
   ========================================== */
function openWmmList() {
    renderWmmList();
    showPage('wmm-list-page');
}

/* ==========================================
   LISTA SCHEDE
   ========================================== */
function renderWmmList() {
    const listEl  = document.getElementById('wmm-cards-list');
    const emptyEl = document.getElementById('wmm-empty-state');
    if (!listEl) return;
    listEl.innerHTML = '';

    const sorted = [...wmm_cards].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    emptyEl.style.display = sorted.length ? 'none' : 'block';

    sorted.forEach(card => {
        const n     = wmm_countComplete(card);
        const scene = wmm_filled(card.scene) ? card.scene : 'Senza scena';
        const take  = wmm_filled(card.take)  ? card.take  : '—';

        const item  = document.createElement('div');
        item.className = 'card-item';
        item.onclick = () => wmmOpenCard(card.id);

        const main  = document.createElement('div');
        main.className = 'ci-main';
        main.innerHTML =
            '<div class="ci-title">' + wmm_esc(scene) +
            ' <span class="ci-take">· T' + wmm_esc(take) + '</span></div>' +
            '<div class="ci-meta">' + (card.updatedAt ? wmm_fmtDate(card.updatedAt) : '') + '</div>';

        const badge = document.createElement('div');
        badge.className = 'ci-badge' + (n === 6 ? ' done' : '');
        badge.textContent = n + '/6';

        const del = document.createElement('button');
        del.className = 'ci-del';
        del.textContent = '🗑';
        del.onclick = (e) => { e.stopPropagation(); wmmDeleteCard(card.id); };

        item.appendChild(main);
        item.appendChild(badge);
        item.appendChild(del);
        listEl.appendChild(item);
    });
}

/* ==========================================
   EDITOR SCHEDA
   ========================================== */
function wmmNewCard() {
    const card = { id: wmm_uid(), scene:'', take:'', updatedAt: Date.now() };
    wmm_cards.push(card);
    wmm_currentId = card.id;
    wmmPersist();
    wmm_populateFields(card);
    showPage('wmm-card-page');
}
function wmmOpenCard(id) {
    wmm_currentId = id;
    const card = wmm_getCurrent();
    if (!card) { openWmmList(); return; }
    wmm_populateFields(card);
    showPage('wmm-card-page');
}
function wmmCloseCard() {
    wmm_flushSave();
    wmm_currentId = null;
    openWmmList();
}

function wmm_populateFields(card) {
    document.querySelectorAll('#wmm-card-content [data-wmm]').forEach(el => {
        const val = wmm_getField(card, el.dataset.wmm);
        el.value = wmm_filled(val) ? val : '';
    });
    document.querySelectorAll('#wmm-card-content .wmm-section').forEach(s => s.classList.remove('open'));
    wmm_renderGPS();
    wmm_renderImage();
    wmm_refreshCompleteness();
    wmm_updateTitle();
}
function wmm_updateTitle() {
    const card = wmm_getCurrent();
    const el   = document.getElementById('wmm-card-title');
    if (!card || !el) return;
    const s = wmm_filled(card.scene) ? 'SC ' + card.scene : 'SCHEDA';
    const t = wmm_filled(card.take)  ? ' · T' + card.take  : '';
    el.textContent = s + t;
}
function wmmToggleSection(headEl) {
    headEl.parentElement.classList.toggle('open');
}

function wmmOnChange() {
    const card = wmm_getCurrent();
    if (!card) return;
    document.querySelectorAll('#wmm-card-content [data-wmm]').forEach(el => {
        wmm_setField(card, el.dataset.wmm, el.value);
    });
    card.updatedAt = Date.now();
    wmm_refreshCompleteness();
    wmm_updateTitle();
    clearTimeout(wmm_saveTimer);
    wmm_saveTimer = setTimeout(wmmPersist, 400);
}
function wmm_flushSave() {
    clearTimeout(wmm_saveTimer);
    const card = wmm_getCurrent();
    if (card) {
        document.querySelectorAll('#wmm-card-content [data-wmm]').forEach(el => {
            wmm_setField(card, el.dataset.wmm, el.value);
        });
        card.updatedAt = Date.now();
    }
    wmmPersist();
}

function wmmDeleteCard(id) {
    const card = wmm_cards.find(c => c.id === id);
    const name = card && wmm_filled(card.scene) ? 'Scena ' + card.scene : 'questa scheda';
    if (!confirm('Eliminare ' + name + '? L\'azione non è reversibile.')) return;
    wmm_cards = wmm_cards.filter(c => c.id !== id);
    wmmPersist();
    renderWmmList();
}
function wmmDeleteCurrent() {
    const id   = wmm_currentId;
    const card = wmm_getCurrent();
    const name = card && wmm_filled(card.scene) ? 'Scena ' + card.scene : 'questa scheda';
    if (!confirm('Eliminare ' + name + '? L\'azione non è reversibile.')) return;
    wmm_cards = wmm_cards.filter(c => c.id !== id);
    wmm_currentId = null;
    wmmPersist();
    openWmmList();
}

/* ==========================================
   GPS
   ========================================== */
function wmmCaptureGPS() {
    const btn = document.getElementById('wmm-gps-btn');
    if (!('geolocation' in navigator)) {
        alert('Geolocalizzazione non disponibile su questo dispositivo.');
        return;
    }
    if (btn) btn.textContent = 'RILEVAMENTO…';
    navigator.geolocation.getCurrentPosition(
        pos => {
            const card = wmm_getCurrent();
            if (!card) return;
            card.gps = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                acc: pos.coords.accuracy,
                at:  Date.now()
            };
            card.updatedAt = Date.now();
            wmmPersist();
            wmm_renderGPS();
            wmm_refreshCompleteness();
            if (navigator.vibrate) navigator.vibrate(40);
        },
        err => {
            if (btn) btn.textContent = 'CATTURA POSIZIONE';
            alert('Impossibile ottenere la posizione: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
}
function wmmClearGPS() {
    const card = wmm_getCurrent();
    if (!card) return;
    delete card.gps;
    card.updatedAt = Date.now();
    wmmPersist();
    wmm_renderGPS();
    wmm_refreshCompleteness();
}
function wmm_renderGPS() {
    const card    = wmm_getCurrent();
    const readout = document.getElementById('wmm-gps-readout');
    const btn     = document.getElementById('wmm-gps-btn');
    const g       = card && card.gps;
    if (g && wmm_filled(g.lat)) {
        if (readout) readout.classList.remove('hidden');
        const latEl  = document.getElementById('wmm-gps-lat');
        const lngEl  = document.getElementById('wmm-gps-lng');
        const timeEl = document.getElementById('wmm-gps-time');
        if (latEl)  latEl.textContent  = Number(g.lat).toFixed(6) + '°';
        if (lngEl)  lngEl.textContent  = Number(g.lng).toFixed(6) + '°';
        if (timeEl) timeEl.textContent = g.at ? wmm_fmtDate(g.at) : '—';
        if (btn)    btn.textContent    = '↻ AGGIORNA POSIZIONE';
    } else {
        if (readout) readout.classList.add('hidden');
        if (btn)     btn.textContent = 'CATTURA POSIZIONE';
    }
}

/* ==========================================
   IMMAGINE
   ========================================== */
function wmmOnImageSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    wmm_resizeImage(file, 1400, 0.75).then(dataUrl => {
        const card = wmm_getCurrent();
        if (!card) return;
        card.image = dataUrl;
        card.updatedAt = Date.now();
        if (wmmPersist()) {
            wmm_renderImage();
            wmm_refreshCompleteness();
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            delete card.image;
        }
        event.target.value = '';
    }).catch(() => alert('Impossibile caricare l\'immagine.'));
}
function wmm_resizeImage(file, maxEdge, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                const scale = Math.min(1, maxEdge / Math.max(width, height));
                width  = Math.round(width  * scale);
                height = Math.round(height * scale);
                const canvas = document.createElement('canvas');
                canvas.width  = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
function wmm_renderImage() {
    const card = wmm_getCurrent();
    const wrap = document.getElementById('wmm-img-preview-wrap');
    const img  = document.getElementById('wmm-img-preview');
    if (card && card.image) {
        if (wrap) wrap.classList.remove('hidden');
        if (img)  img.src = card.image;
    } else {
        if (wrap) wrap.classList.add('hidden');
        if (img)  img.removeAttribute('src');
    }
}
function wmmClearImage() {
    const card = wmm_getCurrent();
    if (!card) return;
    delete card.image;
    card.updatedAt = Date.now();
    wmmPersist();
    wmm_renderImage();
    wmm_refreshCompleteness();
}

/* ==========================================
   EXPORT PDF
   ========================================== */
function wmmExportPDF() {
    wmm_flushSave();
    const card = wmm_getCurrent();
    if (!card) return;
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('Modulo PDF non caricato. Riprova aprendo l\'app con connessione internet almeno una volta.');
        return;
    }

    const ORANGE = [255, 149, 0];
    const BLACK  = [17, 17, 17];
    const DIM    = [120, 120, 125];
    const LINE   = [214, 214, 218];

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4' });
    const PW = 210, PH = 297, MX = 14, CW = 182, BOTTOM = 16, TOP_BR = 18;
    let y = 0;

    const gf = (path) => wmm_getField(card, path);
    const vf = (path, unit) => {
        const raw = gf(path);
        if (!wmm_filled(raw)) return '—';
        return unit ? (String(raw) + ' ' + unit) : String(raw);
    };

    function ensureSpace(h) {
        if (y + h > PH - BOTTOM) { doc.addPage(); y = TOP_BR; }
    }

    /* Header band arancione */
    doc.setFillColor.apply(doc, ORANGE);
    doc.rect(0, 0, PW, 30, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('WITNESS MARK MANAGER  ·  AC SCOUTER', MX, 11);
    doc.setFontSize(19);
    const scene = wmm_filled(card.scene) ? card.scene : '—';
    const take  = wmm_filled(card.take)  ? card.take  : '—';
    doc.text('SCENA ' + scene + '    ·    TAKE ' + take, MX, 23);

    y = 38;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor.apply(doc, DIM);
    doc.text('Generato il ' + wmm_fmtDate(Date.now()) + '   •   ' + wmm_countComplete(card) + ' / 6 sezioni complete', MX, y);
    y += 8;

    function drawSectionTitle(txt) {
        ensureSpace(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor.apply(doc, ORANGE);
        doc.text(txt, MX, y);
        y += 1.5;
        doc.setDrawColor.apply(doc, ORANGE);
        doc.setLineWidth(0.4);
        doc.line(MX, y, MX + CW, y);
        y += 5;
    }
    function cellH(value, w) {
        doc.setFont('courier','normal'); doc.setFontSize(10.5);
        return 3.8 + doc.splitTextToSize(value, w).length * 4.6;
    }
    function drawCell(label, value, x, w) {
        doc.setFont('helvetica','bold'); doc.setFontSize(7.2);
        doc.setTextColor.apply(doc, DIM);
        doc.text(String(label).toUpperCase(), x, y);
        doc.setFont('courier','normal'); doc.setFontSize(10.5);
        doc.setTextColor.apply(doc, BLACK);
        const lines = doc.splitTextToSize(value, w);
        doc.text(lines, x, y + 4.4);
        return 3.8 + lines.length * 4.6;
    }
    function rowCells(cells) {
        const gap = 6, half = (CW - gap) / 2;
        if (cells.length === 1 && cells[0].full) {
            const h = cellH(cells[0].value, CW);
            ensureSpace(h + 4);
            drawCell(cells[0].label, cells[0].value, MX, CW);
            y += h + 4;
        } else {
            const h = Math.max(cellH(cells[0].value, half), cells[1] ? cellH(cells[1].value, half) : 0);
            ensureSpace(h + 4);
            drawCell(cells[0].label, cells[0].value, MX, half);
            if (cells[1]) drawCell(cells[1].label, cells[1].value, MX + half + gap, half);
            y += h + 4;
        }
    }

    /* --- Sezioni --- */
    drawSectionTitle('DATI CAMERA');
    rowCells([{label:'Modello',         value: vf('camera.model'),    full:true}]);
    rowCells([{label:'Altezza obiettivo', value: vf('camera.height','m')},
              {label:'Distanza soggetto', value: vf('camera.distance','m')}]);
    rowCells([{label:'Angolazione / Tilt', value: vf('camera.angle','°'), full:true}]);

    drawSectionTitle('SETTAGGI CAMERA');
    rowCells([{label:'FPS',    value: vf('settings.fps')},
              {label:'Shutter', value: vf('settings.shutter')}]);
    rowCells([{label:'ISO / EI', value: vf('settings.iso')},
              {label:'Kelvin',   value: vf('settings.kelvin','K')}]);
    rowCells([{label:'Codec / Risoluzione', value: vf('settings.codec'), full:true}]);
    if (wmm_filled(gf('settings.nd')))
        rowCells([{label:'ND', value: vf('settings.nd'), full:true}]);

    drawSectionTitle('OTTICA');
    rowCells([{label:'Focale',  value: vf('optics.focal','mm')},
              {label:'T-stop',  value: vf('optics.tstop')}]);
    rowCells([{label:'Serie ottiche', value: vf('optics.series'), full:true}]);
    rowCells([{label:'Distanza fuoco', value: vf('optics.focusDistance','m')},
              {label:'Filtri / Diottrie', value: wmm_filled(gf('optics.filters')) ? vf('optics.filters') : '—'}]);

    drawSectionTitle('POSIZIONE GPS');
    const g = card.gps;
    if (g && wmm_filled(g.lat)) {
        rowCells([{label:'Latitudine',  value: Number(g.lat).toFixed(6)+'°'},
                  {label:'Longitudine', value: Number(g.lng).toFixed(6)+'°'}]);
        rowCells([{label:'Ora rilevamento', value: g.at ? wmm_fmtDate(g.at) : '—', full:true}]);
    } else {
        rowCells([{label:'Posizione', value:'Non acquisita', full:true}]);
    }

    if (wmm_filled(card.notes)) {
        drawSectionTitle('NOTE');
        rowCells([{label:'Annotazioni', value: card.notes, full:true}]);
    }

    if (card.image) {
        drawSectionTitle('IMMAGINE');
        try {
            const props = doc.getImageProperties(card.image);
            let dW = CW, dH = dW * props.height / props.width;
            const avail = PH - BOTTOM - y;
            const full  = PH - BOTTOM - TOP_BR;
            if (dH > avail) {
                doc.addPage(); y = TOP_BR;
                if (dH > full) { dH = full; dW = dH * props.width / props.height; }
            }
            doc.addImage(card.image, 'JPEG', MX + (CW - dW) / 2, y, dW, dH);
            y += dH + 4;
        } catch(e) {
            rowCells([{label:'Immagine', value:'(errore nel rendering)', full:true}]);
        }
    }

    /* Footer */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setDrawColor.apply(doc, LINE);
        doc.setLineWidth(0.2);
        doc.line(MX, PH - 10, MX + CW, PH - 10);
        doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
        doc.setTextColor.apply(doc, DIM);
        doc.text('AC Scouter · Witness Mark Manager', MX, PH - 6);
        doc.text(i + ' / ' + pages, MX + CW, PH - 6, {align:'right'});
    }

    const fname = 'WMM_Scena' + scene.replace(/[^a-zA-Z0-9._-]+/g,'_') +
                  '_Take'  + take.replace(/[^a-zA-Z0-9._-]+/g,'_') + '.pdf';
    doc.save(fname);
}

/* ==========================================
   INIT
   ========================================== */
window.addEventListener('DOMContentLoaded', () => {
    wmmLoadCards();
    renderWmmList();
});
