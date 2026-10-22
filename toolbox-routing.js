/* Shared entry points for browser links and the iPhone widget. */
(function () {
    'use strict';

    const pages = Object.freeze({
        film: 'calc-page',
        dof: 'dop-page',
        lens: 'lens-match-page',
        sun: 'sun-page',
        marks: 'wmm-list-page',
        focus: 'focus-page',
        ciak: 'ciak-page',
        chroma: 'chroma-page',
        home: 'home-page'
    });

    const colors = Object.freeze({
        black: '#000000', green: '#00B140', blue: '#0047BB', grey: '#787878', white: '#FFFFFF'
    });

    function syncPresentation() {
        const page = Object.values(pages).map(id => document.getElementById(id))
            .find(element => element && element.classList.contains('active'));
        const clean = !!page && page.classList.contains('clean-mode');
        const menu = document.getElementById('menu-overlay');
        const menuVisible = !!menu && menu.style.display === 'flex';
        let backdrop = 'artwork';
        if (!menuVisible && page && (page.id === 'ciak-page' || (page.id === 'focus-page' && clean))) {
            backdrop = 'black';
        } else if (!menuVisible && page && page.id === 'chroma-page') {
            const screen = document.getElementById('chroma-screen');
            backdrop = Object.keys(colors).find(color => screen.classList.contains('chroma-' + color)) || 'green';
        }
        const immersive = !menuVisible && clean && !!page && ['focus-page', 'chroma-page', 'ciak-page'].includes(page.id);
        if (document.documentElement) {
            document.documentElement.classList.toggle('toolbox-menu-open', menuVisible);
            document.documentElement.style.setProperty('--toolbox-backdrop', colors[backdrop] || 'transparent');
            document.documentElement.classList.toggle('toolbox-solid-background', backdrop !== 'artwork');
            const theme = document.querySelector('meta[name="theme-color"]');
            if (theme) theme.setAttribute('content', colors[backdrop] || '#000000');
        }
        if (window.ACScouterNative && window.ACScouterNative.setPresentation) {
            window.ACScouterNative.setPresentation({ backdrop: backdrop, immersive: immersive, menuVisible: menuVisible });
        }
    }

    function openTool(tool) {
        if (!Object.prototype.hasOwnProperty.call(pages, tool)) return false;
        // A widget can reopen the running app while a Marks card is being edited.
        if (typeof wmm_flushSave === 'function') wmm_flushSave();
        if (tool === 'marks') {
            openWmmList();
        } else {
            showPage(pages[tool]);
        }
        syncPresentation();
        return true;
    }

    function openHash() {
        const tool = new URLSearchParams(window.location.hash.slice(1)).get('tool');
        if (tool) openTool(tool);
    }

    window.ACScouter = Object.freeze({ openTool: openTool, syncPresentation: syncPresentation });
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(syncPresentation);
        [...new Set(Object.values(pages)), 'chroma-screen'].forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element, { attributes: true, attributeFilter: ['class'] });
        });
        const menu = document.getElementById('menu-overlay');
        if (menu) observer.observe(menu, { attributes: true, attributeFilter: ['style'] });
    }
    window.addEventListener('load', syncPresentation);
    window.addEventListener('load', openHash);
    window.addEventListener('hashchange', openHash);
})();
