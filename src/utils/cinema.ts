const ATTR = 'cinematic_mode';
const STYLE_ID = 'optube-cinema-css';
let carouselContainer: HTMLElement | null = null;
let attached = false;
let loadDebounce: number | null = null;
let spotlightInterval: number | null = null;
let spotlightEl: HTMLElement | null = null;
let lastSpotlightIndex = -1;
let itemsObserver: MutationObserver | null = null;
let arrowLeft: HTMLButtonElement | null = null;
let arrowRight: HTMLButtonElement | null = null;
let arrowOverlay: HTMLDivElement | null = null;
let arrowCheckInterval: number | null = null;
let spotlightMuted = true;

let lastCinemaMode: boolean | null = null;
let cinemaHoverPreviewBlockerAttached = false;
const cinemaHoverPreviewHandlers: Array<{ evt: string; fn: (e: Event) => void }> = [];

const cinemaIntro = (() => {
    let shownThisActivation = false;
    function render() {
        if (!document.documentElement.hasAttribute(ATTR)) return;
        if (document.getElementById('optube-cinema-intro')) return;
        const wrap = document.createElement('div');
        wrap.id = 'optube-cinema-intro';
        wrap.innerHTML = `<div class="intro-stage"><span class="intro-bar"></span><span class="intro-text">YOUTUBE</span></div>`;
        document.body.appendChild(wrap);
        setTimeout(() => { wrap.classList.add('fade-out'); }, 2000);
        setTimeout(() => { wrap.remove(); }, 2600);
    }
    return {
        maybeShow(firstActivation: boolean) {
            if (!firstActivation) return;
            if (shownThisActivation) return;
            shownThisActivation = true;
            render();
        },
        reset() { shownThisActivation = false; }
    };
})();
declare global {
    interface Window { optubeForceSpotlight?: () => void; __optubeCinemaHoverMO?: MutationObserver }
}

function isHome(): boolean {
    return location.pathname === '/' || location.pathname === '/feed' || location.pathname === '/feed/';
}

function ensureCinemaHomeState() {
    if (!document.documentElement.hasAttribute(ATTR)) return;
    if (isHome()) {
        document.body.classList.add('cinematic-home');
        ensureEphemeralCinemaHides();
    } else {
        document.body.classList.remove('cinematic-home');
        teardownSpotlight();
    }
}

function ensureEphemeralCinemaHides() {
    if (!document.documentElement.hasAttribute(ATTR)) return;
    if (!isHome()) return;
    if (!document.body.classList.contains('cinematic-home')) return;
    if (!document.body.classList.contains('cinema-hide-sidebar')) {
        applyEphemeralAttrs();
    }
}

function applyEphemeralAttrs() {
    document.body.classList.add(
        'cinema-hide-sidebar',
        'cinema-hide-shorts',
        'cinema-hide-create-btn',
        'cinema-hide-notifications',
        'cinema-hide-searchbar',
        'cinema-hide-posts',
        'cinema-hide-badges-chips',
        'cinema-hide-hover-preview',
        'cinema-hide-masthead',
        'cinema-hide-spinners'
    );
    ensureCinemaHoverPreviewBlocker();
}

function removeEphemeralAttrs() {
    document.body.classList.remove(
        'cinema-hide-sidebar',
        'cinema-hide-shorts',
        'cinema-hide-create-btn',
        'cinema-hide-notifications',
        'cinema-hide-searchbar',
        'cinema-hide-posts',
        'cinema-hide-badges-chips',
        'cinema-hide-hover-preview',
        'cinema-hide-masthead',
        'cinema-hide-spinners'
    );
    teardownCinemaHoverPreviewBlocker();
}

function ensureCinemaHoverPreviewBlocker() {
    if (cinemaHoverPreviewBlockerAttached) return;
    const evts = ['mouseover', 'mouseenter', 'mousemove'];
    evts.forEach(evt => {
        const fn = (e: Event) => {
            if (!document.documentElement.hasAttribute(ATTR)) return;
            if (!document.body.classList.contains('cinematic-home')) return;
            if (!document.body.classList.contains('cinema-hide-hover-preview')) return;
            const t = (e.target as HTMLElement | null);
            if (!t) return;
            if (t.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model')) {
                e.stopImmediatePropagation();
            }
        };
        document.addEventListener(evt, fn, true);
        cinemaHoverPreviewHandlers.push({ evt, fn });
    });
    const mo = new MutationObserver(muts => {
        if (!document.documentElement.hasAttribute(ATTR) || !document.body.classList.contains('cinema-hide-hover-preview')) return;
        for (const m of muts) {
            m.addedNodes.forEach(n => {
                if (!(n instanceof HTMLElement)) return;
                if (n.tagName === 'VIDEO' && n.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model')) {
                    n.remove();
                } else {
                    n.querySelectorAll?.('video').forEach(v => {
                        if (v.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model')) v.remove();
                    });
                }
            });
        }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    window.__optubeCinemaHoverMO = mo;
    cinemaHoverPreviewBlockerAttached = true;
}

function teardownCinemaHoverPreviewBlocker() {
    if (!cinemaHoverPreviewBlockerAttached) return;
    cinemaHoverPreviewHandlers.forEach(h => document.removeEventListener(h.evt, h.fn, true));
    const mo: MutationObserver | undefined = window.__optubeCinemaHoverMO;
    if (mo) { try { mo.disconnect(); } catch { /* ignore */ } }
    delete window.__optubeCinemaHoverMO;
    cinemaHoverPreviewHandlers.splice(0, cinemaHoverPreviewHandlers.length);
    cinemaHoverPreviewBlockerAttached = false;
}

export function setCinemaMode(on: boolean) {
    const stateChanged = lastCinemaMode !== on;
    lastCinemaMode = on;

    if (on) {
        document.documentElement.setAttribute(ATTR, 'true');
        if (isHome()) document.body.classList.add('cinematic-home');
        if (stateChanged) {
            applyEphemeralAttrs();
            let firstActivation = false;
            try {
                const wasActive = localStorage.getItem('optube_cinema_active') === '1';
                if (!wasActive) firstActivation = true;
                localStorage.setItem('optube_cinema_active', '1');
            } catch { /* ignore */ }
            setTimeout(() => cinemaIntro.maybeShow(firstActivation), 80);
        }
    } else {
        document.documentElement.removeAttribute(ATTR);
        document.body.classList.remove('cinematic-home');
        document.body.classList.remove('cinema-spotlight-active');
        document.body.classList.remove('cinema-spotlight-half', 'cinema-spotlight-quarter');
        if (arrowCheckInterval) { clearInterval(arrowCheckInterval); arrowCheckInterval = null; }
        arrowOverlay?.remove(); arrowOverlay = null; arrowLeft = null; arrowRight = null;
        cinemaIntro.reset();
        if (stateChanged) {
            removeEphemeralAttrs();
            try { localStorage.removeItem('optube_cinema_active'); } catch { /* ignore */ }
        }
        if (spotlightInterval) window.clearInterval(spotlightInterval);
        spotlightInterval = null;
        spotlightEl?.remove();
        spotlightEl = null;
        itemsObserver?.disconnect(); itemsObserver = null;
        window.removeEventListener('wheel', globalWheelRedirect);
        attached = false;
    }
}

export function applyCinema(settings: { cinematicMode?: boolean; cinemaPreviewMuted?: boolean }) {

    setCinemaMode(!!settings.cinematicMode);

    if (settings.cinematicMode !== undefined) {
        if (typeof settings.cinemaPreviewMuted === 'boolean') {
            spotlightMuted = !!settings.cinemaPreviewMuted;

            applySpotlightMuteToFrames();
        }
    }
}

export function injectCinemaCSS() {
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
  /* Root variable definitions */
    /* Attach variables directly to the html element when cinematic attribute present */
    html[${ATTR}] { --netflix-red:#e50914; --netflix-black:#141414; --netflix-dark-gray:#181818; --netflix-light-gray:#e5e5e5; --cinema-spotlight-height: clamp(340px, 50vh, 780px); --cinema-carousel-height: 350px; }
        html[${ATTR}] body.cinematic-home.cinema-spotlight-quarter { --cinema-spotlight-height: clamp(220px, 25vh, 520px); }
        html[${ATTR}] body.cinematic-home.cinema-spotlight-half { --cinema-spotlight-height: clamp(340px, 50vh, 780px); }
  html[${ATTR}] body.cinematic-home { overflow:hidden !important; background:var(--netflix-black)!important; }

  
  
  html[${ATTR}] body.cinematic-home ytd-app { --ytd-mini-guide-width:0px !important; }
  html[${ATTR}] body.cinematic-home ytd-page-manager.ytd-app,
  html[${ATTR}] body.cinematic-home #page-manager.ytd-app,
  html[${ATTR}] body.cinematic-home #content.ytd-app,
  html[${ATTR}] body.cinematic-home ytd-browse[page-subtype="home"],
  html[${ATTR}] body.cinematic-home ytd-two-column-browse-results-renderer.ytd-browse,
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer {
    margin:0 !important;
    padding:0 !important;
    max-width:100vw !important;
    width:100vw !important;
    left:0 !important;
  }
  
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer[is-two-columns] { max-width:100vw !important; }
  html[${ATTR}] body.cinematic-home ytd-two-column-browse-results-renderer { padding:0 !important; }
  
    html[${ATTR}] body.cinematic-home #chips-wrapper.ytd-feed-filter-chip-bar-renderer { margin:0 !important; padding:12px 48px !important; width:100vw !important; box-sizing:border-box !important; position:relative; z-index:2100; }
  html[${ATTR}] body.cinematic-home ytd-masthead { background:transparent!important; border-bottom:none!important; }
  html[${ATTR}] body.cinematic-home #background.ytd-masthead { background:transparent!important; }
  html[${ATTR}] body.cinematic-home ytd-masthead #logo-icon { fill:var(--netflix-red)!important; }
  html[${ATTR}] body.cinematic-home html[dark] { background:var(--netflix-black)!important; }

    
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight {
    position:fixed; 
    top:0; left:0;
    width:100vw; height:var(--cinema-spotlight-height);
    padding:0; box-sizing:border-box;
    display:flex; align-items:flex-end; justify-content:flex-start;
    font-family: 'Roboto', Arial, sans-serif; gap:0;
    overflow:hidden; pointer-events:none; z-index:1200; /* lowered so carousel can overlap edge */
    background:#000; background-size:cover; background-position:center center; background-repeat:no-repeat;
    }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight::after { content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.3) 60%, rgba(0,0,0,0) 100%); pointer-events:none; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-video { position:absolute; inset:0; width:100%; height:100%; overflow:hidden; }
    
    
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-video iframe {
        position:absolute; left:0; top:50%;
        width:100vw; height:calc(100vw * 9 / 16);
        transform:translateY(-50%);
        border:0; object-fit:cover; pointer-events:none; opacity:0; transition:opacity .65s ease; background:#000;
    }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-video iframe.active { opacity:1; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-meta { position:relative; z-index:2; max-width:640px; pointer-events:auto; padding: calc(var(--ytd-masthead-height,56px) + 0px) 48px 24px 88px; box-sizing:border-box; display:flex; flex-direction:column; gap:18px; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-title { font-size:clamp(1.6rem, 3vw, 3rem); font-weight:700; line-height:1.1; margin:0; color:#fff; text-shadow:0 2px 14px rgba(0,0,0,.65); letter-spacing:.5px; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-title a { color:#fff; text-decoration:none; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-title a:hover { text-decoration:underline; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-actions { display:flex; gap:14px; align-items:center; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-watch { background:#e50914; background-color:var(--netflix-red,#e50914); color:#fff; font-weight:600; padding:12px 22px; border-radius:4px; font-size:1.2rem; letter-spacing:.5px; text-decoration:none; box-shadow:0 2px 10px rgba(0,0,0,.5); display:inline-flex; align-items:center; gap:8px; position:relative; overflow:hidden; transition:padding .18s ease, box-shadow .18s ease, transform .18s ease; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-watch:hover { padding:12px 24px; box-shadow:0 4px 18px rgba(0,0,0,.55); }

    
  
    /* Horizontal carousel of rich items (force flex row on grid container) */
        html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer {
    display:flex !important;
    flex-direction:row !important;
    flex-wrap:nowrap !important;
    gap:20px !important;
    overflow-x:auto !important;
    overflow-y:hidden !important;
    position:fixed !important;
    top: var(--cinema-spotlight-height) !important;
    left:0 !important;
    width:100vw !important; /* ensure full viewport width */
    height: var(--cinema-carousel-height) !important;
    max-width:100vw !important; /* override inline max-width from YT */
    margin:0 !important; /* remove auto-centering */
    padding: 12px 48px 12px 88px !important;
    box-sizing:border-box !important;
    overscroll-behavior-x: contain;
    backface-visibility:hidden; /* reduce paint artifacts */
    transform:translateZ(0); /* promote layer */
    z-index:1500 !important; /* above spotlight */
    contain:layout paint style; /* strict containment to prevent reflow */
  }
    /* Ensure carousel stays below spotlight without overlapping meta content */
            html[${ATTR}] body.cinematic-home.cinema-spotlight-active ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer {
                transform:none !important;
                margin-top: 0 !important; /* remove negative margin to prevent overlap */
                padding-top: 12px !important;
                top: calc(var(--cinema-spotlight-height) + 12px) !important; /* ensure clear separation */
                transition: none !important; /* prevent visual snapping */
            }
            /* Reserve space for spotlight meta to prevent occlusion */
            html[${ATTR}] body.cinematic-home.cinema-spotlight-active #optube-cinema-spotlight .optube-spotlight-meta { 
                padding-bottom: 48px !important; /* extra padding to keep Watch button clear */
                z-index: 1300 !important; /* ensure meta is above carousel */
            }
            html[${ATTR}] body.cinematic-home.cinema-spotlight-active #optube-cinema-spotlight { contain:layout paint style; }
            html[${ATTR}] body.cinematic-home.cinema-spotlight-active ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer::after { content:''; display:block; height:0; }
            /* Prevent continuation item temporary height collapse from shifting container */
            html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer ytd-continuation-item-renderer { min-height: var(--cinema-carousel-height) !important; }
        html[${ATTR}] body.cinematic-home.cinema-spotlight-active ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer::before { content:none !important; }
        html[${ATTR}] body.cinematic-home #contents.ytd-rich-grid-renderer::after { content:none !important; background:none !important; }
        /* Lift spotlight meta slightly to avoid clipping, but not overlap */
        html[${ATTR}] body.cinematic-home.cinema-spotlight-active #optube-cinema-spotlight .optube-spotlight-meta { transform:translateY(-8px); transition:transform .4s ease; }
        /* Ensure items render above gradient but still above spotlight */
        html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer > ytd-rich-item-renderer { position:relative !important; z-index:3 !important; }
  
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer[style] {
    width:100vw !important;
    max-width:100vw !important;
    margin-left:0 !important;
    margin-right:0 !important;
    top: calc(var(--cinema-spotlight-height) + 12px) !important;
  }
  
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer {
    --ytd-rich-grid-content-max-width: 100vw !important;
    justify-content:flex-start !important;
  }
  /* Ensure items don't shrink and have consistent width */
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer > ytd-rich-item-renderer {
    flex:0 0 340px !important;
    max-width:340px !important;
    scroll-snap-align:center;
    transition:opacity .32s ease, transform .32s ease; /* smooth entrance */
    contain:content; /* isolate layout/paint to reduce reflow */
  }
    html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer > ytd-rich-item-renderer.cinema-loading { opacity:0 !important; transform:translateY(28px); }
  
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer { --ytd-rich-grid-items-per-row: 1 !important; }
  html[${ATTR}] body.cinematic-home ytd-rich-item-renderer { height:var(--cinema-carousel-height)!important; aspect-ratio:1!important; margin:0!important; }
  html[${ATTR}] body.cinematic-home ytd-rich-item-renderer ytd-thumbnail { border:2px solid transparent; transition:top .2s, scale .2s, opacity .2s; scale:.95!important; position:relative!important; top:0!important; }
  html[${ATTR}] body.cinematic-home ytd-rich-item-renderer:hover ytd-thumbnail { scale:.85!important; top:-20px!important; opacity:.6!important; }
  html[${ATTR}] body.cinematic-home ytd-rich-grid-media #details { padding:1rem!important; background:var(--netflix-dark-gray)!important; border-radius:4px!important; margin-top:-4px!important; transition:all .2s!important; opacity:0!important; top:-50px!important; position:relative; }
  html[${ATTR}] body.cinematic-home ytd-rich-grid-media:hover #details { opacity:1!important; top:-80px!important; }

  
  html[${ATTR}] body.cinematic-home #video-preview-container.ytd-video-preview { pointer-events:none !important; }
  html[${ATTR}] body.cinematic-home ytd-video-preview { pointer-events:none !important; }

  
  html[${ATTR}] body.cinematic-home ytd-rich-shelf-renderer[is-shorts],
  html[${ATTR}] body.cinematic-home ytd-rich-shelf-renderer:has(ytd-statement-banner-renderer),
  html[${ATTR}] body.cinematic-home #rich-shelf-header { display:none!important; }
    html[${ATTR}] body.cinematic-home #frosted-glass { display:none !important; }

    /* Ephemeral cinema hides via body classes (do not reflect user setting state) */
    html[${ATTR}] body.cinematic-home.cinema-hide-sidebar ytd-mini-guide-renderer,
    html[${ATTR}] body.cinematic-home.cinema-hide-sidebar ytd-guide-renderer,
    html[${ATTR}] body.cinematic-home.cinema-hide-sidebar #guide-button,
        html[${ATTR}] body.cinematic-home.cinema-hide-sidebar ytd-app #guide { display:none !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-shorts ytd-rich-shelf-renderer[is-shorts],
    html[${ATTR}] body.cinematic-home.cinema-hide-shorts ytd-reel-shelf-renderer { display:none !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-create-btn ytd-topbar-menu-button-renderer:has(a[href*='studio.youtube.com']),
        html[${ATTR}] body.cinematic-home.cinema-hide-create-btn ytd-button-renderer:has(path[d*='M10 8v6l5-3-5-3z']) { display:none !important; }
        
        html[${ATTR}] body.cinematic-home.cinema-hide-notifications ytd-notification-topbar-button-renderer { display:none !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-searchbar ytd-masthead #center,
        html[${ATTR}] body.cinematic-home.cinema-hide-searchbar ytd-masthead #search-icon-legacy,
        html[${ATTR}] body.cinematic-home.cinema-hide-searchbar ytd-masthead #search-input,
        html[${ATTR}] body.cinematic-home.cinema-hide-searchbar ytd-masthead form { display:none !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-posts ytd-rich-shelf-renderer:has(ytd-post-renderer),
    html[${ATTR}] body.cinematic-home.cinema-hide-posts ytd-post-renderer,
    html[${ATTR}] body.cinematic-home.cinema-hide-posts ytd-rich-item-renderer:has(> #content > ytd-post-renderer) { display:none !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-badges-chips #chips-wrapper,
    html[${ATTR}] body.cinematic-home.cinema-hide-badges-chips ytd-feed-filter-chip-bar-renderer { display:none !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-hover-preview ytd-rich-item-renderer:hover video,
    html[${ATTR}] body.cinematic-home.cinema-hide-hover-preview ytd-rich-grid-media:hover video,
    html[${ATTR}] body.cinematic-home.cinema-hide-hover-preview yt-lockup-view-model:hover video { display:none !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-hover-preview ytd-rich-item-renderer [class*='inline-preview'],
    html[${ATTR}] body.cinematic-home.cinema-hide-hover-preview ytd-rich-item-renderer [class*='InlinePreview'] { display:none !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-masthead ytd-masthead { display:none !important; }
        
        html[${ATTR}] body.cinematic-home.cinema-hide-hover-preview #video-preview-container.ytd-video-preview { display:none !important; visibility:hidden !important; }
    
    html[${ATTR}] body.cinematic-home.cinema-hide-spinners ytd-continuation-item-renderer { display:block !important; opacity:1 !important; }
    html[${ATTR}] body.cinematic-home.cinema-hide-spinners ytd-continuation-item-renderer tp-yt-paper-spinner,
    html[${ATTR}] body.cinematic-home.cinema-hide-spinners ytd-continuation-item-renderer #spinner,
    html[${ATTR}] body.cinematic-home.cinema-hide-spinners yt-page-navigation-progress,
    html[${ATTR}] body.cinematic-home.cinema-hide-spinners .yt-core-spinner,
    html[${ATTR}] body.cinematic-home.cinema-hide-spinners .ytp-spinner { opacity:0 !important; visibility:hidden !important; pointer-events:none !important; animation:none !important; }
    
    html[${ATTR}] body.cinematic-home.cinema-hide-spinners .yt-core-skeleton-loader { opacity:.35 !important; filter:grayscale(1) brightness(.55); transition:opacity .3s ease; height: var(--cinema-carousel-height) !important; }
    
    html[${ATTR}] body.cinematic-home ytd-continuation-item-renderer { min-height: var(--cinema-carousel-height) !important; box-sizing:border-box; }

  
  html[${ATTR}] body.cinematic-home #contents::-webkit-scrollbar { height:8px; background:transparent; }
  html[${ATTR}] body.cinematic-home #contents::-webkit-scrollbar-thumb { background:rgba(122,122,122,.15); border-radius:4px; }
  html[${ATTR}] body.cinematic-home #contents::-webkit-scrollbar-thumb:hover { background:rgba(122,122,122,.3); }

  
  html[${ATTR}] body.cinematic-home #contents:has(ytd-rich-item-renderer)::before,
  html[${ATTR}] body.cinematic-home #contents:has(ytd-rich-item-renderer)::after { content:''; position:absolute; top:0; width:150px; height:100%; z-index:1; pointer-events:none; }
  html[${ATTR}] body.cinematic-home #contents:has(ytd-rich-item-renderer)::before { left:0; background:linear-gradient(to right,#0f0f0f,transparent); }
  html[${ATTR}] body.cinematic-home #contents:has(ytd-rich-item-renderer)::after { right:0; background:linear-gradient(to left,#0f0f0f,transparent); }

  
            html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay { position:absolute; inset:0; z-index:15; }
                html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow { position:absolute; top:42%; transform:translateY(-50%); width:54px; height:54px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(0,0,0,0.52); backdrop-filter:blur(10px) saturate(180%); -webkit-backdrop-filter:blur(10px) saturate(180%); border:1px solid rgba(255,255,255,.25); color:#fff; cursor:pointer; opacity:.92; transition:opacity .25s ease, background .25s ease, transform .25s ease; box-shadow:0 6px 24px -6px rgba(0,0,0,.7); }
    html[${ATTR}] body.cinematic-home .cinema-scroll-arrow { cursor:pointer !important; }
        html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow:hover { background:rgba(0,0,0,0.66); opacity:1; }
            html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow:active { transform:translateY(-50%) scale(.94); }
            html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow:hover { cursor:pointer; }
                
                html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow,
                html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow:hover,
                html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow:focus { cursor:pointer !important; }
        html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow svg { width:28px; height:28px; pointer-events:none; }
        html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow.left { left:18px; }
        html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow.right { right:18px; }
        html[${ATTR}] body.cinematic-home #contents .cinema-arrow-overlay .cinema-scroll-arrow[disabled] { opacity:.3 !important; cursor:default; }
    @media (pointer:coarse) { html[${ATTR}] body.cinematic-home #contents .cinema-scroll-arrow { opacity:.85; } }

  
  html[${ATTR}] body:not(.cinematic-home) { /* no-op placeholder */ }

    
    html[${ATTR}] #optube-cinema-intro { position:fixed; inset:0; background:#000; z-index:999999; display:flex; align-items:center; justify-content:center; font-family:'Inter', system-ui, sans-serif; overflow:hidden; pointer-events:none; }
    html[${ATTR}] #optube-cinema-intro .intro-stage { position:relative; width:640px; height:220px; display:flex; align-items:center; justify-content:center; }
    /* Slim horizontal bar behind text (less vertical weight) */
    html[${ATTR}] #optube-cinema-intro .intro-bar { position:absolute; left:50%; top:50%; width:520px; height:120px; background:linear-gradient(180deg,#e50914,#b00710); border-radius:6px; filter:drop-shadow(0 0 46px rgba(229,9,20,.55)); transform:translate(-50%, -50%) scaleX(.05); transform-origin:center; animation:optubeIntroBar 1450ms cubic-bezier(.4,0,.2,1) forwards; }
    html[${ATTR}] #optube-cinema-intro.done .intro-bar { animation-play-state:paused; }
    html[${ATTR}] #optube-cinema-intro .intro-text { position:relative; font-size:4rem; font-weight:800; letter-spacing:.75rem; color:#fff; text-shadow:0 0 24px rgba(229,9,20,.55), 0 0 6px rgba(255,255,255,.4); opacity:0; animation:optubeIntroText 1600ms 350ms ease forwards; }
    html[${ATTR}] #optube-cinema-intro .intro-rings { position:absolute; inset:0; pointer-events:none; }
    html[${ATTR}] #optube-cinema-intro::after { content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 50%, rgba(229,9,20,.15), transparent 60%); opacity:0; animation:optubeIntroGlow 1400ms 200ms ease forwards; }
    html[${ATTR}] #optube-cinema-intro.fade-out { animation:optubeIntroFade 620ms ease forwards; }
    @keyframes optubeIntroBar { 0%{transform:translate(-50%, -50%) scaleX(.05);} 30%{transform:translate(-50%, -50%) scaleX(.35);} 55%{transform:translate(-50%, -50%) scaleX(1.04);} 72%{transform:translate(-50%, -50%) scaleX(.97);} 100%{transform:translate(-50%, -50%) scaleX(1);} }
    @keyframes optubeIntroText { 0%{opacity:0; transform:translateY(22px) scale(1.08);} 45%{opacity:.25;} 70%{opacity:.75; letter-spacing:.35rem;} 100%{opacity:1; transform:translateY(0) scale(1); letter-spacing:.15rem;} }
    @keyframes optubeIntroGlow { 0%{opacity:0;} 50%{opacity:1;} 100%{opacity:.55;} }
    @keyframes optubeIntroFade { 0%{opacity:1;} 100%{opacity:0;} }
  `;
    document.head.appendChild(style);
}

export function observeCinema() {
    const observer = new MutationObserver(debounce(() => {
        if (document.documentElement.hasAttribute(ATTR)) {
            ensureCinemaHomeState();
            if (document.body.classList.contains('cinematic-home')) {
                attachCarouselEnhancements();
            } else {
                teardownSpotlight();
                removeEphemeralAttrs();
            }
        }
    }, 50));
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('yt-navigate-finish', debounce(() => {
        ensureCinemaHomeState();
        if (isHome() && document.body.classList.contains('cinematic-home')) {
            attachCarouselEnhancements();
            initSpotlight();
        } else {
            teardownSpotlight();
            removeEphemeralAttrs();
        }
    }, 50));
    document.addEventListener('yt-page-data-updated', debounce(() => {
        if (isHome()) initSpotlight();
    }, 50));
    if (isHome()) {
        attachCarouselEnhancements();
        initSpotlight();
    }
    return observer;
}

function attachCarouselEnhancements() {
    if (!document.documentElement.hasAttribute(ATTR) || !isHome()) return;
    let candidate = document.querySelector<HTMLElement>('ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer');
    if (!candidate) {
        candidate = document.querySelector<HTMLElement>('ytd-browse[page-subtype="home"] #contents:has(ytd-rich-item-renderer)');
    }
    if (!candidate) return;
    if (carouselContainer !== candidate) {
        carouselContainer = candidate;
        attached = false;
    }
    if (attached || !carouselContainer) return;

    flattenCarouselRows();

    carouselContainer.addEventListener('wheel', (e) => {
        if (!document.documentElement.hasAttribute(ATTR)) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            carouselContainer!.scrollLeft += e.deltaY;
            e.preventDefault();
            maybeLoadMore();
        } else if (e.deltaX !== 0) {
            maybeLoadMore();
        }
    }, { passive: false });
    carouselContainer.addEventListener('scroll', () => maybeLoadMore(), { passive: true });
    window.addEventListener('wheel', globalWheelRedirect, { passive: false });
    attached = true;
    initSpotlight();
    observeCarouselNewItems();
    addCarouselArrows();
}

function flattenCarouselRows() {
    if (!carouselContainer) return;
    const rows = carouselContainer.querySelectorAll('ytd-rich-grid-row');
    rows.forEach(row => {
        const items = row.querySelectorAll('ytd-rich-item-renderer');
        items.forEach(item => carouselContainer!.appendChild(item));
        row.remove();
    });
}

function initSpotlight() {
    if (!document.documentElement.hasAttribute(ATTR) || !isHome()) return;
    if (!spotlightEl) {
        spotlightEl = document.createElement('div');
        spotlightEl.id = 'optube-cinema-spotlight';
        const vidWrap = document.createElement('div');
        vidWrap.className = 'optube-spotlight-video';
        const iframe = document.createElement('iframe');
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        vidWrap.appendChild(iframe);
        const meta = document.createElement('div');
        meta.className = 'optube-spotlight-meta';
        meta.innerHTML = `
                <h2 class="optube-spotlight-title">Loading spotlight…</h2>
                <div class="optube-spotlight-actions">
                    <a class="optube-spotlight-watch" href="#" data-disabled="true">Watch</a>
                </div>`;
        spotlightEl.appendChild(vidWrap);
        spotlightEl.appendChild(meta);
        document.body.prepend(spotlightEl);
    }
    if (spotlightInterval) return;

    const hasItem = document.querySelector('ytd-rich-item-renderer');
    if (!hasItem) {
        setTimeout(initSpotlight, 600);
        return;
    }

    document.body.classList.add('cinema-spotlight-active');
    if (!document.body.classList.contains('cinema-spotlight-quarter') && !document.body.classList.contains('cinema-spotlight-half')) {
        document.body.classList.add('cinema-spotlight-half');
    }
    runSpotlightCycle();
    spotlightInterval = window.setInterval(runSpotlightCycle, 16000);
    observeItemsForSpotlight();
    window.optubeForceSpotlight = runSpotlightCycle;
}
function teardownSpotlight() {
    if (!spotlightEl) return;
    if (spotlightInterval) { window.clearInterval(spotlightInterval); spotlightInterval = null; }
    try {
        spotlightEl.querySelectorAll('iframe').forEach(f => { f.src = 'about:blank'; });
    } catch { /* ignore */ }
    spotlightEl.remove();
    spotlightEl = null;
    itemsObserver?.disconnect(); itemsObserver = null;
    document.body.classList.remove('cinema-spotlight-active', 'cinema-spotlight-half', 'cinema-spotlight-quarter');
}
function isAdOrPromoted(el: HTMLElement): boolean {
    const AD_SELECTORS = [
        'ytd-ad-slot-renderer',
        'ytd-display-ad-renderer',
        'ytd-promoted-sparkles-web-renderer',
        'ytd-in-feed-ad-layout-renderer',
        'ytd-in-feed-player-ad-renderer',
        'ytd-action-companion-ad-renderer',
        'ytd-statement-banner-renderer',
        'ytd-inline-survey-renderer'
    ].join(',');
    if (el.matches(AD_SELECTORS) || el.querySelector(AD_SELECTORS)) return true;

    if (el.querySelector('[id="ad-badge"], #ad-badge')) return true;

    const badgeText = Array.from(el.querySelectorAll('ytd-badge-supported-renderer, .badge-shape-wiz, .badge, .yt-badge'))
        .map(b => b.textContent?.trim().toLowerCase() || '')
        .join(' ');
    if (/(^|\s)(ad|sponsored|promoted)(\s|$)/.test(badgeText)) return true;

    const a = el.querySelector('a#thumbnail, a.yt-simple-endpoint');
    const aria = (a?.getAttribute('aria-label') || '').toLowerCase();
    if (/^ad[\s:.-]/.test(aria)) return true;

    const textSample = (el.textContent || '').slice(0, 160).toLowerCase();
    if (textSample.includes('ad •') || textSample.includes('ad ·')) return true;
    return false;
}

function pickRandomVideo(): HTMLElement | null {

    const scope: ParentNode = carouselContainer || document;
    const selector = [
        'ytd-rich-item-renderer',
        'ytd-rich-grid-row ytd-rich-item-renderer',
        'ytd-video-renderer',
        'ytd-compact-video-renderer'
    ].join(',');
    const raw = Array.from(scope.querySelectorAll<HTMLElement>(selector));

    const items = raw.filter(el =>
        !el.closest('ytd-rich-shelf-renderer') &&
        (el.querySelector('ytd-thumbnail,img,#video-title')) &&
        !isAdOrPromoted(el)
    );
    if (!items.length) return null;
    let idx = Math.floor(Math.random() * items.length);
    if (items.length > 1 && idx === lastSpotlightIndex) idx = (idx + 1) % items.length;
    lastSpotlightIndex = idx;
    return items[idx];
}

function runSpotlightCycle() {
    if (!document.documentElement.hasAttribute(ATTR) || !isHome()) return;
    const target = pickRandomVideo();
    if (!target || !spotlightEl) {

        setTimeout(runSpotlightCycle, 1000);
        return;
    }
    const titleEl = target.querySelector(
        'yt-formatted-string#video-title, #video-title, a#video-title, #video-title-link, h3 a[title], h3 a, h3 yt-formatted-string, a[href*="/watch"] yt-formatted-string'
    );
    const anchor = target.querySelector<HTMLAnchorElement>('a#thumbnail, a.yt-simple-endpoint[href*="watch"], a#video-title, h3 a[href*="watch"], a[href*="/watch"]');
    const thumbImg = target.querySelector<HTMLImageElement>('ytd-thumbnail img, img#img');

    const backdrop = thumbImg?.src || thumbImg?.getAttribute('data-thumb') || '';
    const titleText = extractText(titleEl, anchor);
    const titleDest = spotlightEl.querySelector<HTMLElement>('.optube-spotlight-title');
    const watchBtn = spotlightEl.querySelector<HTMLAnchorElement>('.optube-spotlight-watch');
    const cleanedTitle = titleText ? cleanTitle(titleText) : '';
    if (titleDest && cleanedTitle) {
        titleDest.textContent = cleanedTitle;
    }
    if (watchBtn && anchor && anchor.href) {
        watchBtn.href = anchor.href;
        watchBtn.removeAttribute('data-disabled');
    }
    if (backdrop) spotlightEl.style.backgroundImage = `url(${backdrop})`;
    if (anchor?.href) {
        const vid = extractVideoId(anchor.href);
        if (vid) switchSpotlightVideo(vid);
    }
}

function observeItemsForSpotlight() {
    if (itemsObserver) return;
    const grid = document.querySelector('ytd-rich-grid-renderer #contents, ytd-browse[page-subtype="home"] #contents');
    if (!grid) return;
    itemsObserver = new MutationObserver(debounce((mutsUnknown: unknown) => {
        const muts = mutsUnknown as MutationRecord[];
        if (!document.documentElement.hasAttribute(ATTR)) return;
        for (const m of muts) {
            if (m.addedNodes.length) {

                const titleEl = spotlightEl?.querySelector('.optube-spotlight-title');
                if (titleEl && /Loading…/.test(titleEl.textContent || '')) {
                    runSpotlightCycle();
                }
                break;
            }
        }
    }, 50));
    itemsObserver.observe(grid, { childList: true, subtree: true });
}


function observeCarouselNewItems() {
    const grid = carouselContainer;
    if (!grid) return;
    const FLAG = '__cinemaObserved';
    if ((grid as unknown as Record<string, unknown>)[FLAG]) return;
    const obs = new MutationObserver(debounce((mutsUnknown: unknown) => {
        const muts = mutsUnknown as MutationRecord[];
        if (!document.documentElement.hasAttribute(ATTR)) return;
        muts.forEach((m: MutationRecord) => {
            m.addedNodes.forEach((n: Node) => {
                if (!(n instanceof HTMLElement)) return;
                if (n.tagName.toLowerCase() === 'ytd-rich-grid-row') {

                    const items = n.querySelectorAll('ytd-rich-item-renderer');
                    items.forEach(item => carouselContainer!.appendChild(item));
                    n.remove();
                } else if (n.tagName.toLowerCase() === 'ytd-rich-item-renderer') {
                    n.classList.add('cinema-loading');

                    requestAnimationFrame(() => {
                        const img = n.querySelector('img');
                        if (img && !(img as HTMLImageElement).complete) {
                            img.addEventListener('load', () => n.classList.remove('cinema-loading'), { once: true });

                            setTimeout(() => n.classList.remove('cinema-loading'), 1200);
                        } else {
                            n.classList.remove('cinema-loading');
                        }

                        updateCarouselArrows();

                        if (!arrowOverlay || !carouselContainer?.contains(arrowOverlay) || !arrowLeft || !arrowRight) {
                            addCarouselArrows();
                        }
                    });
                }
            });
        });

        ensureCarouselArrows(true);
    }, 50));
    obs.observe(grid, { childList: true, subtree: true });
    (grid as unknown as Record<string, unknown>)[FLAG] = true;
}

function ensureCarouselArrows(forceUpdate = false) {
    if (!document.documentElement.hasAttribute(ATTR) || !isHome()) return;
    if (!carouselContainer) return;
    if (!arrowOverlay || !carouselContainer.contains(arrowOverlay) || !arrowLeft || !arrowRight) {
        addCarouselArrows();
    } else if (forceUpdate) {

        requestAnimationFrame(() => requestAnimationFrame(() => updateCarouselArrows()));
    }
}


function extractText(titleEl: Element | null, anchor: HTMLAnchorElement | null): string {
    if (!titleEl && anchor) return (anchor.getAttribute('title') || anchor.textContent || '').trim();
    if (!titleEl) return '';
    const attrs = ['title', 'aria-label', 'aria-describedby'];
    for (const a of attrs) {
        const v = titleEl.getAttribute(a);
        if (v) return v.trim();
    }
    const text = titleEl.textContent?.trim();
    if (text) return text;
    if (anchor) return (anchor.getAttribute('title') || anchor.textContent || '').trim();
    return '';
}

function extractVideoId(href: string): string | null {
    try {
        const url = new URL(href, location.origin);
        if (url.searchParams.get('v')) return url.searchParams.get('v');
        const m = href.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
        return m ? m[1] : null;
    } catch { return null; }
}


function cleanTitle(raw: string): string {

    let t = raw

        .replace(/\s*[[(](\d{1,2}:\d{2}(?::\d{2})?)[)]]\s*$/i, '')

        .replace(/(?:[-–•|]|\bat\b)?\s*\d{1,2}:\d{2}(?::\d{2})?\s*$/i, '')

        .replace(/\b\d+\s+hours?,\s*\d+\s+minutes?\b[,.:;-]*$/i, '')

        .replace(/\b\d+\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)(\s+ago)?[,.:;-]*$/i, '')

        .replace(/\b(streamed|premiered)\s+\d+\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\s+ago[,.:;-]*$/i, '')

        .replace(/([\s]*[-–•|:,])+\s*$/i, '')
        .trim();

    if (!t) t = raw.trim();
    return t;
}

function switchSpotlightVideo(videoId: string) {
    if (!spotlightEl) return;
    const frames = spotlightEl.querySelectorAll<HTMLIFrameElement>('.optube-spotlight-video iframe');
    if (!frames.length) return;
    const active = Array.from(frames).find(f => f.classList.contains('active')) || frames[0];
    const next = frames.length > 1 ? (frames[0] === active ? frames[1] : frames[0]) : active;
    const muteParam = spotlightMuted ? 1 : 0;
    const autoplaySrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&controls=0&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}&enablejsapi=1`;
    if (next === active) {

        active.classList.remove('active');
        setTimeout(() => { active.src = autoplaySrc; }, 200);
        active.onload = () => { active.classList.add('active'); };
        return;
    }

    next.classList.remove('active');
    next.style.opacity = '0';
    next.onload = () => {

        next.classList.add('active');

        setTimeout(() => { if (active !== next) { active.classList.remove('active'); active.src = 'about:blank'; } }, 700);
    };
    if (next.src !== autoplaySrc) next.src = autoplaySrc; else next.onload?.(new Event('load'));
}

function applySpotlightMuteToFrames() {
    if (!spotlightEl) return;
    const frames = spotlightEl.querySelectorAll<HTMLIFrameElement>('.optube-spotlight-video iframe');
    frames.forEach(f => {
        try {
            f.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: spotlightMuted ? 'mute' : 'unMute', args: [] }), '*');
        } catch { /* ignore */ }
    });
}

function globalWheelRedirect(e: WheelEvent) {
    if (!document.documentElement.hasAttribute(ATTR)) return;
    if (!carouselContainer) return;

    const grid = carouselContainer.closest('ytd-rich-grid-renderer');
    if (grid && (e.target instanceof HTMLElement) && grid.contains(e.target)) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            carouselContainer.scrollLeft += e.deltaY;
            e.preventDefault();
            maybeLoadMore();
        }
    }
}

function maybeLoadMore() {
    if (!carouselContainer) return;
    const nearEnd = (carouselContainer.scrollLeft + carouselContainer.clientWidth) > (carouselContainer.scrollWidth - 800);
    if (!nearEnd) return;
    if (loadDebounce) window.clearTimeout(loadDebounce);
    loadDebounce = window.setTimeout(() => triggerContinuationLoad(), 50);
}

function triggerContinuationLoad() {
    const cont = document.querySelector('ytd-continuation-item-renderer, yt-next-continuation, ytd-continuation-renderer');
    if (cont) {
        const prevOverflow = document.body.style.overflow;
        if (prevOverflow === 'hidden') document.body.style.overflow = 'auto';
        try {
            (cont as HTMLElement).scrollIntoView({ block: 'end' });
        } catch { /* ignore */ }

        if (prevOverflow === 'hidden') document.body.style.overflow = 'hidden';
    } else {
        const prevY = window.scrollY;
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' as ScrollBehavior });
        window.scrollTo({ top: prevY });
    }

    ensureCarouselArrows(true);
}


function addCarouselArrows() {
    if (!carouselContainer) return;

    if (!arrowOverlay || !carouselContainer.contains(arrowOverlay)) {
        arrowOverlay?.remove();
        arrowOverlay = document.createElement('div');
        arrowOverlay.className = 'cinema-arrow-overlay';
        carouselContainer.appendChild(arrowOverlay);
        arrowOverlay.style.display = 'contents';
        arrowLeft = null; arrowRight = null;
    }
    if (!arrowLeft || !arrowRight) {
        const mkBtn = (dir: 'left' | 'right') => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `cinema-scroll-arrow ${dir}`;
            btn.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
            btn.innerHTML = dir === 'left'
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
            btn.style.cursor = 'pointer';

            btn.style.zIndex = '15';
            btn.addEventListener('click', () => {
                const delta = Math.round(carouselContainer!.clientWidth * 0.8) * (dir === 'left' ? -1 : 1);
                carouselContainer!.scrollBy({ left: delta, behavior: 'smooth' });
                maybeLoadMore();
                setTimeout(updateCarouselArrows, 420);
            });

            let holdTimer: number | null = null;
            let repeater: number | null = null;
            btn.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                holdTimer = window.setTimeout(() => {
                    repeater = window.setInterval(() => {
                        const step = 32 * (dir === 'left' ? -1 : 1);
                        carouselContainer!.scrollLeft += step;
                        maybeLoadMore();
                        updateCarouselArrows();
                    }, 16);
                }, 300);
            });
            const clearTimers = () => {
                if (holdTimer) { window.clearTimeout(holdTimer); holdTimer = null; }
                if (repeater) { window.clearInterval(repeater); repeater = null; }
            };
            ['mouseup', 'mouseleave', 'blur'].forEach(ev => btn.addEventListener(ev, clearTimers));
            return btn;
        };
        arrowLeft = mkBtn('left');
        arrowRight = mkBtn('right');

        if (arrowLeft) arrowOverlay!.appendChild(arrowLeft);
        if (arrowRight) arrowOverlay!.appendChild(arrowRight);
        carouselContainer.addEventListener('scroll', updateCarouselArrows, { passive: true });
        window.addEventListener('resize', updateCarouselArrows);
    }

    if (!arrowCheckInterval) {
        arrowCheckInterval = window.setInterval(() => {
            ensureCarouselArrows(true);
        }, 600);
    }
    setTimeout(updateCarouselArrows, 120);
}

function updateCarouselArrows() {
    if (!carouselContainer || !arrowLeft || !arrowRight) return;
    const scrollable = (carouselContainer.scrollWidth - carouselContainer.clientWidth) > 40;
    if (!scrollable) {
        arrowLeft.setAttribute('disabled', 'true');
        arrowRight.setAttribute('disabled', 'true');
    } else {
        const sl = carouselContainer.scrollLeft;
        const max = carouselContainer.scrollWidth - carouselContainer.clientWidth - 4;
        if (sl <= 4) arrowLeft.setAttribute('disabled', 'true'); else arrowLeft.removeAttribute('disabled');
        if (sl >= max) arrowRight.setAttribute('disabled', 'true'); else arrowRight.removeAttribute('disabled');
    }
    try {
        const pad = 18;
        const w = arrowLeft.offsetWidth || 54;
        const sl = carouselContainer.scrollLeft;
        arrowLeft.style.left = (sl + pad) + 'px';
        arrowRight.style.left = (sl + carouselContainer.clientWidth - pad - w) + 'px';
        arrowLeft.style.top = '25%';
        arrowRight.style.top = '25%';
    } catch { /* ignore */ }
}

function debounce<T extends (...p: unknown[]) => void>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}