// Cinematic (Netflix-like) UI mode for YouTube Home
// Pure CSS injection + attribute on <html>. We avoid heavy DOM rewriting here.

const ATTR = 'cinematic_mode';
const STYLE_ID = 'optube-cinema-css';
let carouselContainer: HTMLElement | null = null;
let attached = false;
let loadDebounce: number | null = null;
let spotlightInterval: number | null = null;
let spotlightEl: HTMLElement | null = null;
let lastSpotlightIndex = -1; // track last used index to avoid immediate repeats
let itemsObserver: MutationObserver | null = null;

declare global {
    interface Window { optubeForceSpotlight?: () => void }
}

export function setCinemaMode(on: boolean) {
    if (on) {
        document.documentElement.setAttribute(ATTR, 'true');
        document.body.classList.add('cinematic-home');
        // Remove #frosted-glass if present
        document.getElementById('frosted-glass')?.remove();
        // Ensure fresh layout (only once per enable session)
        try {
            if (!sessionStorage.getItem('optubeCinemaReloaded')) {
                sessionStorage.setItem('optubeCinemaReloaded', '1');
                setTimeout(() => location.reload(), 60);
            }
        } catch { /* ignore */ }
    } else {
        document.documentElement.removeAttribute(ATTR);
        document.body.classList.remove('cinematic-home');
        document.body.classList.remove('cinema-spotlight-active');
        document.body.classList.remove('cinema-spotlight-half', 'cinema-spotlight-quarter');
        try { sessionStorage.removeItem('optubeCinemaReloaded'); } catch { /* ignore */ }
        if (spotlightInterval) window.clearInterval(spotlightInterval);
        spotlightInterval = null;
        spotlightEl?.remove();
        spotlightEl = null;
    }
}

export function applyCinema(settings: { cinematicMode?: boolean }) {
    setCinemaMode(!!settings.cinematicMode);
}

export function injectCinemaCSS() {
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
  /* Root variable definitions */
    /* Attach variables directly to the html element when cinematic attribute present */
    html[${ATTR}] { --netflix-red:#e50914; --netflix-black:#141414; --netflix-dark-gray:#181818; --netflix-light-gray:#e5e5e5; --cinema-spotlight-height: clamp(340px, 50vh, 780px); }
        html[${ATTR}] body.cinematic-home.cinema-spotlight-quarter { --cinema-spotlight-height: clamp(220px, 25vh, 520px); }
        html[${ATTR}] body.cinematic-home.cinema-spotlight-half { --cinema-spotlight-height: clamp(340px, 50vh, 780px); }
  html[${ATTR}] body.cinematic-home { overflow:hidden !important; background:var(--netflix-black)!important; }

  /* Simplified subset of provided CSS focused on safe transformations */
  /* Expand content to full viewport width for immersive feel */
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
  /* Remove potential internal max-width constraints */
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer[is-two-columns] { max-width:100vw !important; }
  html[${ATTR}] body.cinematic-home ytd-two-column-browse-results-renderer { padding:0 !important; }
  /* Ensure the top filter chips bar spans full width */
    html[${ATTR}] body.cinematic-home #chips-wrapper.ytd-feed-filter-chip-bar-renderer { margin:0 !important; padding:12px 48px !important; width:100vw !important; box-sizing:border-box !important; position:relative; z-index:2100; }
  html[${ATTR}] body.cinematic-home ytd-masthead { background:transparent!important; border-bottom:none!important; }
  html[${ATTR}] body.cinematic-home #background.ytd-masthead { background:transparent!important; }
  html[${ATTR}] body.cinematic-home ytd-masthead #logo-icon { fill:var(--netflix-red)!important; }
  html[${ATTR}] body.cinematic-home html[dark] { background:var(--netflix-black)!important; }

    /* Spotlight container now in normal flow (not fixed) */
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight {
        position:relative; 
        width:100vw; height:var(--cinema-spotlight-height);
        padding:0; box-sizing:border-box;
        display:flex; align-items:flex-end; justify-content:flex-start;
        font-family: 'Roboto', Arial, sans-serif; gap:0;
        overflow:hidden; pointer-events:none; z-index:1500;
        background:#000; background-size:cover; background-position:center center; background-repeat:no-repeat;
    }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight::after { content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.3) 60%, rgba(0,0,0,0) 100%); pointer-events:none; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-video { position:absolute; inset:0; width:100%; height:100%; overflow:hidden; }
    /* Spotlight iframe: cover full container (cropped if necessary) */
    /* Full-width 16:9 player cropped vertically to remove side pillar bars */
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-video iframe {
        position:absolute; left:0; top:50%;
        /* Force intrinsic 16:9 based on viewport width so width always fills container */
        width:100vw; height:calc(100vw * 9 / 16);
        /* Center vertically and crop overflow (container has smaller fixed height) */
        transform:translateY(-50%);
        border:0; object-fit:cover; pointer-events:none; opacity:0; transition:opacity .6s ease; background:#000;
    }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-video iframe.optube-loaded { opacity:1; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-meta { position:relative; z-index:2; max-width:640px; pointer-events:auto; padding: calc(var(--ytd-masthead-height,56px) + 0px) 48px 24px 88px; box-sizing:border-box; display:flex; flex-direction:column; gap:18px; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-title { font-size:clamp(1.6rem, 3vw, 3rem); font-weight:700; line-height:1.1; margin:0; color:#fff; text-shadow:0 2px 14px rgba(0,0,0,.65); letter-spacing:.5px; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-title a { color:#fff; text-decoration:none; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-title a:hover { text-decoration:underline; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-actions { display:flex; gap:14px; align-items:center; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-watch { background:#e50914; background-color:var(--netflix-red,#e50914); color:#fff; font-weight:600; padding:12px 22px; border-radius:4px; font-size:1.2rem; letter-spacing:.5px; text-decoration:none; box-shadow:0 2px 10px rgba(0,0,0,.5); display:inline-flex; align-items:center; gap:8px; position:relative; overflow:hidden; transition:padding .18s ease, box-shadow .18s ease, transform .18s ease; }
    html[${ATTR}] body.cinematic-home #optube-cinema-spotlight .optube-spotlight-watch:hover { padding:12px 24px; box-shadow:0 4px 18px rgba(0,0,0,.55); }

    /* (Removed reliance on YouTube hover preview; using embedded iframe instead) */
  
    /* Horizontal carousel of rich items (force flex row on grid container) */
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer {
    display:flex !important;
    flex-direction:row !important;
    flex-wrap:nowrap !important;
    gap:20px !important;
    overflow-x:auto !important;
    overflow-y:hidden !important;
    position:relative !important;
    /* Top padding now only accounts for masthead (spotlight is in-flow above) */
    padding: calc(var(--ytd-masthead-height, 56px) + 32px) 48px 48px 88px !important;
    scroll-snap-type:x proximity;
    width:100vw !important; /* ensure full viewport width */
    max-width:100vw !important; /* override inline max-width from YT */
    margin:0 !important; /* remove auto-centering */
    box-sizing:border-box !important;
    overscroll-behavior-x: contain;
    flex: 1 0 auto !important; /* avoid shrinking */
  }
  /* Defensive override in case inline style attribute persists after SPA nav */
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer[style] {
    width:100vw !important;
    max-width:100vw !important;
    margin-left:0 !important;
    margin-right:0 !important;
  }
  /* Ensure rich grid itself doesn't constrain internal content */
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer {
    --ytd-rich-grid-content-max-width: 100vw !important;
    justify-content:flex-start !important;
  }
  /* Ensure items don't shrink and have consistent width */
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer > ytd-rich-item-renderer {
    flex:0 0 340px !important;
    max-width:340px !important;
    scroll-snap-align:center;
  }
  /* Hide default grid sizing variables influence */
  html[${ATTR}] body.cinematic-home ytd-rich-grid-renderer { --ytd-rich-grid-items-per-row: 1 !important; }
  html[${ATTR}] body.cinematic-home ytd-rich-item-renderer { height:350px!important; aspect-ratio:1!important; margin:0!important; }
  html[${ATTR}] body.cinematic-home ytd-rich-item-renderer ytd-thumbnail { border:2px solid transparent; transition:top .2s, scale .2s, opacity .2s; scale:.95!important; position:relative!important; top:0!important; }
  html[${ATTR}] body.cinematic-home ytd-rich-item-renderer:hover ytd-thumbnail { scale:.85!important; top:-20px!important; opacity:.6!important; }
  html[${ATTR}] body.cinematic-home ytd-rich-grid-media #details { padding:1rem!important; background:var(--netflix-dark-gray)!important; border-radius:4px!important; margin-top:-4px!important; transition:all .2s!important; opacity:0!important; top:-50px!important; position:relative; }
  html[${ATTR}] body.cinematic-home ytd-rich-grid-media:hover #details { opacity:1!important; top:-80px!important; }

  /* Prevent inline hover preview overlay from blocking horizontal wheel events */
  html[${ATTR}] body.cinematic-home #video-preview-container.ytd-video-preview { pointer-events:none !important; }
  html[${ATTR}] body.cinematic-home ytd-video-preview { pointer-events:none !important; }

  /* Hide intrusive / non-essential elements for focus mode */
  html[${ATTR}] body.cinematic-home ytd-rich-shelf-renderer[is-shorts],
  html[${ATTR}] body.cinematic-home ytd-rich-shelf-renderer:has(ytd-statement-banner-renderer),
  html[${ATTR}] body.cinematic-home #rich-shelf-header { display:none!important; }
    html[${ATTR}] body.cinematic-home #frosted-glass { display:none !important; }

  /* Scrollbar minimal styling */
  html[${ATTR}] body.cinematic-home #contents::-webkit-scrollbar { height:8px; background:transparent; }
  html[${ATTR}] body.cinematic-home #contents::-webkit-scrollbar-thumb { background:rgba(122,122,122,.15); border-radius:4px; }
  html[${ATTR}] body.cinematic-home #contents::-webkit-scrollbar-thumb:hover { background:rgba(122,122,122,.3); }

  /* Fade gradient edges */
  html[${ATTR}] body.cinematic-home #contents:has(ytd-rich-item-renderer)::before,
  html[${ATTR}] body.cinematic-home #contents:has(ytd-rich-item-renderer)::after { content:''; position:absolute; top:0; width:150px; height:100%; z-index:1; pointer-events:none; }
  html[${ATTR}] body.cinematic-home #contents:has(ytd-rich-item-renderer)::before { left:0; background:linear-gradient(to right,#0f0f0f,transparent); }
  html[${ATTR}] body.cinematic-home #contents:has(ytd-rich-item-renderer)::after { right:0; background:linear-gradient(to left,#0f0f0f,transparent); }

  /* Reduce potential layout conflicts: ensure watch page unaffected */
  html[${ATTR}] body:not(.cinematic-home) { /* no-op placeholder */ }
  `;
    document.head.appendChild(style);
}

export function observeCinema() {
    // Re-apply body class on navigation mutations (SPA transitions)
    const observer = new MutationObserver(() => {
        if (document.documentElement.hasAttribute(ATTR)) {
            if (location.pathname === '/' || location.pathname === '/feed/subscriptions' || location.pathname.startsWith('/feed')) {
                document.body.classList.add('cinematic-home');
            }
            attachCarouselEnhancements();
        }
    });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    // Initial attempt
    attachCarouselEnhancements();
    initSpotlight();
    return observer;
}

function attachCarouselEnhancements() {
    if (!document.documentElement.hasAttribute(ATTR)) return;
    let candidate = document.querySelector<HTMLElement>('ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer');
    if (!candidate) {
        // Fallback older structure
        candidate = document.querySelector<HTMLElement>('ytd-browse[page-subtype="home"] #contents:has(ytd-rich-item-renderer)');
    }
    if (!candidate) return;
    if (carouselContainer !== candidate) {
        carouselContainer = candidate;
        attached = false; // reattach listeners if container changed
    }
    if (attached || !carouselContainer) return;
    // Wheel -> horizontal translate
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
    // Scroll listener for load triggers (for manual horizontal scroll, trackpad drag, keyboard etc.)
    carouselContainer.addEventListener('scroll', () => maybeLoadMore(), { passive: true });
    // Global wheel fallback if overlay intercepts (defensive)
    window.addEventListener('wheel', globalWheelRedirect, { passive: false });
    attached = true;
    // Ensure spotlight starts once we have items
    initSpotlight();
}

function initSpotlight() {
    if (!document.documentElement.hasAttribute(ATTR)) return;
    // Always ensure container exists even if carousel not yet resolved
    if (!spotlightEl) {
        spotlightEl = document.createElement('div');
        spotlightEl.id = 'optube-cinema-spotlight';
        // Video wrapper + iframe
        const vidWrap = document.createElement('div');
        vidWrap.className = 'optube-spotlight-video';
        const iframe = document.createElement('iframe');
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        vidWrap.appendChild(iframe);
        const meta = document.createElement('div');
        meta.className = 'optube-spotlight-meta';
        meta.innerHTML = `
                <h2 class="optube-spotlight-title">Loading feed…</h2>
                <div class="optube-spotlight-actions">
                    <a class="optube-spotlight-watch" href="#" data-disabled="true">Watch</a>
                </div>`;
        spotlightEl.appendChild(vidWrap);
        spotlightEl.appendChild(meta);
        // Prefer inserting before the entire rich grid renderer to avoid internal layout conflicts
        const richGrid = document.querySelector('ytd-rich-grid-renderer');
        if (richGrid && richGrid.parentElement) {
            richGrid.parentElement.insertBefore(spotlightEl, richGrid);
        } else {
            // Fallback: previous strategy inside browse container
            const browse = document.querySelector('ytd-browse[page-subtype="home"]');
            const chips = browse?.querySelector('#chips-wrapper.ytd-feed-filter-chip-bar-renderer');
            if (browse) {
                if (chips) browse.insertBefore(spotlightEl, chips);
                else browse.prepend(spotlightEl);
            } else {
                document.body.prepend(spotlightEl);
            }
        }
    }
    if (spotlightInterval) return; // already running

    // Wait until at least one rich item exists before starting cycle
    const hasItem = document.querySelector('ytd-rich-item-renderer');
    if (!hasItem) {
        setTimeout(initSpotlight, 600); // retry shortly
        return;
    }

    document.body.classList.add('cinema-spotlight-active');
    // Default to half height if no size class already
    if (!document.body.classList.contains('cinema-spotlight-quarter') && !document.body.classList.contains('cinema-spotlight-half')) {
        document.body.classList.add('cinema-spotlight-half');
    }
    runSpotlightCycle();
    spotlightInterval = window.setInterval(runSpotlightCycle, 11000); // 10s preview + 1s buffer
    observeItemsForSpotlight();
    // Expose manual debug trigger
    window.optubeForceSpotlight = runSpotlightCycle;
}

function pickRandomVideo(): HTMLElement | null {
    // Prefer the carousel container if available; otherwise query document-wide
    const scope: ParentNode = carouselContainer || document;
    const selector = [
        'ytd-rich-item-renderer',
        'ytd-rich-grid-row ytd-rich-item-renderer',
        'ytd-video-renderer',
        'ytd-compact-video-renderer'
    ].join(',');
    const raw = Array.from(scope.querySelectorAll<HTMLElement>(selector));
    // Filter out shelves / ads / statements and ensure at least a thumbnail or title exists
    const items = raw.filter(el => !el.closest('ytd-rich-shelf-renderer') && (el.querySelector('ytd-thumbnail,img,#video-title')));
    if (!items.length) return null;
    let idx = Math.floor(Math.random() * items.length);
    if (items.length > 1 && idx === lastSpotlightIndex) idx = (idx + 1) % items.length;
    lastSpotlightIndex = idx;
    return items[idx];
}

function runSpotlightCycle() {
    if (!document.documentElement.hasAttribute(ATTR)) return;
    const target = pickRandomVideo();
    if (!target || !spotlightEl) {
        // Retry soon if nothing yet (feed still populating)
        setTimeout(runSpotlightCycle, 1000);
        return;
    }
    const titleEl = target.querySelector(
        'yt-formatted-string#video-title, #video-title, a#video-title, #video-title-link, h3 a[title], h3 a, h3 yt-formatted-string, a[href*="/watch"] yt-formatted-string'
    );
    const anchor = target.querySelector<HTMLAnchorElement>('a#thumbnail, a.yt-simple-endpoint[href*="watch"], a#video-title, h3 a[href*="watch"], a[href*="/watch"]');
    const thumbImg = target.querySelector<HTMLImageElement>('ytd-thumbnail img, img#img');
    // Some thumbnails lazy-load; if src not present, try data-thumb / srcset fallback
    const backdrop = thumbImg?.src || thumbImg?.getAttribute('data-thumb') || '';
    const titleText = extractText(titleEl, anchor);
    const titleDest = spotlightEl.querySelector<HTMLElement>('.optube-spotlight-title');
    const watchBtn = spotlightEl.querySelector<HTMLAnchorElement>('.optube-spotlight-watch');
    const cleanedTitle = titleText ? cleanTitle(titleText) : '';
    if (titleDest && cleanedTitle) {
        if (anchor && anchor.href) {
            titleDest.innerHTML = `<a href="${anchor.href}">${escapeHtml(cleanedTitle)}</a>`;
        } else {
            titleDest.textContent = cleanedTitle;
        }
    }
    if (watchBtn && anchor && anchor.href) {
        watchBtn.href = anchor.href;
        watchBtn.removeAttribute('data-disabled');
    }
    if (backdrop) spotlightEl.style.backgroundImage = `url(${backdrop})`;
    const iframe = spotlightEl.querySelector<HTMLIFrameElement>('.optube-spotlight-video iframe');
    if (iframe && anchor?.href) {
        const vid = extractVideoId(anchor.href);
        if (vid) {
            // Fade transition: remove loaded class, then set src
            iframe.classList.remove('optube-loaded');
            const autoplaySrc = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${vid}`;
            if (iframe.src !== autoplaySrc) iframe.src = autoplaySrc;
            iframe.onload = () => { iframe.classList.add('optube-loaded'); };
        }
    }
}

function observeItemsForSpotlight() {
    if (itemsObserver) return;
    const grid = document.querySelector('ytd-rich-grid-renderer #contents, ytd-browse[page-subtype="home"] #contents');
    if (!grid) return; // will be retried on next init
    itemsObserver = new MutationObserver((muts) => {
        if (!document.documentElement.hasAttribute(ATTR)) return;
        for (const m of muts) {
            if (m.addedNodes.length) {
                // If we were stuck on Loading and now items appear, force immediate cycle
                const titleEl = spotlightEl?.querySelector('.optube-spotlight-title');
                if (titleEl && /Loading…/.test(titleEl.textContent || '')) {
                    runSpotlightCycle();
                }
                break;
            }
        }
    });
    itemsObserver.observe(grid, { childList: true, subtree: true });
}

// Helpers
function escapeHtml(str: string) {
    return str.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
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

// (simulateHover removed – no longer needed with iframe embed)

function extractVideoId(href: string): string | null {
    try {
        const url = new URL(href, location.origin);
        if (url.searchParams.get('v')) return url.searchParams.get('v');
        const m = href.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
        return m ? m[1] : null;
    } catch { return null; }
}

// Remove typical trailing duration patterns (e.g., " - 12:34", " | 8:07", or appended timestamps)
function cleanTitle(raw: string): string {
    return raw.replace(/([-|–|•]|\|)?\s*(\d{1,2}:\d{2})(:?\d{2})?$/, '').trim();
}

function globalWheelRedirect(e: WheelEvent) {
    if (!document.documentElement.hasAttribute(ATTR)) return;
    if (!carouselContainer) return;
    // Only intervene if event target is within the rich grid region
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
    loadDebounce = window.setTimeout(() => triggerContinuationLoad(), 120);
}

function triggerContinuationLoad() {
    // Strategy: find continuation spinner or renderer and scroll it into view vertically to trigger network fetch.
    const cont = document.querySelector('ytd-continuation-item-renderer, yt-next-continuation, ytd-continuation-renderer');
    if (cont) {
        // Temporarily allow vertical scrolling if disabled
        const prevOverflow = document.body.style.overflow;
        if (prevOverflow === 'hidden') document.body.style.overflow = 'auto';
        try {
            (cont as HTMLElement).scrollIntoView({ block: 'end' });
        } catch { /* ignore */ }
        // Restore overflow for cinematic experience
        if (prevOverflow === 'hidden') document.body.style.overflow = 'hidden';
    } else {
        // Fallback: simulate bottom scroll to invoke internal lazy loader
        const prevY = window.scrollY;
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' as ScrollBehavior });
        window.scrollTo({ top: prevY });
    }
}
