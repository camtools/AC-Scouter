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
   8. LOGICA CIAK (TRIGGER & FULLSCREEN) - FIX
   ========================================== */
const trigger = document.getElementById('full-screen-trigger');
const ciakPage = document.getElementById('ciak-page');
const inputTitolo = document.getElementById('input-titolo'); 
let fullScreenTimer;

if(trigger) {
    // Usiamo sia touchstart che mousedown per coprire ogni dispositivo
    const startAction = (e) => {
        // Impedisce al browser di gestire il tocco come scroll o click destro
        if (e.cancelable) e.preventDefault(); 
        
        console.log("Pressione rilevata..."); // Controlla l'ispeziona elemento!

        fullScreenTimer = setTimeout(() => {
            console.log("2 Secondi passati! Attivo Fullscreen");
            
            // Toggle Clean Mode
            ciakPage.classList.toggle('clean-mode');
            
            // Toggle Titolo
            if (inputTitolo) {
                const isCurrentlyHidden = inputTitolo.style.opacity === '0';
                inputTitolo.style.opacity = isCurrentlyHidden ? '1' : '0';
                inputTitolo.style.pointerEvents = isCurrentlyHidden ? 'auto' : 'none';
            }
            
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            fullScreenTimer = null;
        }, 800); 
    };

    const stopAction = () => {
        if (fullScreenTimer) {
            clearTimeout(fullScreenTimer);
            console.log("Pressione rilasciata troppo presto");
            // Se vuoi comunque il flash al tocco breve:
            // executeCiakFlash(); 
        }
    };

    trigger.addEventListener('touchstart', startAction, { passive: false });
    trigger.addEventListener('touchend', stopAction);
    
    // Supporto anche per mouse se testi da Mac
    trigger.addEventListener('mousedown', startAction);
    trigger.addEventListener('mouseup', stopAction);
    trigger.addEventListener('mouseleave', stopAction);
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