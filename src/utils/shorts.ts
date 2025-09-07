/**
 * Toggle Shorts visibility (attribute + conservative cleanup).
 * We avoid hiding core feed containers (ytd-rich-grid-renderer / section root)
 * to prevent breaking lazy loading.
 */
export function setShortsVisibility(hide: boolean) {
    if (hide) {
        document.documentElement.setAttribute('hide_shorts', 'true');
        cleanupShortsShelves();
    } else {
        document.documentElement.removeAttribute('hide_shorts');
        // Restore mini guide Shorts entry
        document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
            const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
            if (label === 'Shorts') {
                (entry as HTMLElement).style.display = '';
            }
        });
    }
}

export function cleanupShortsShelves() {
    // Dedicated shelf components – safe to hide directly
    document.querySelectorAll('ytd-reel-shelf-renderer, ytd-shorts-shelf-renderer').forEach(el => (el as HTMLElement).style.display = 'none');

    // Grid shelf view model (experimental / new layout)
    document.querySelectorAll('grid-shelf-view-model').forEach(el => {
        if (el.querySelector('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2')) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    // Rich shelf renderer (subscriptions/home variant) containing shorts lockups or links
    document.querySelectorAll('ytd-rich-shelf-renderer').forEach(el => {
        const hasShorts = el.querySelector('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2, a[href*="/shorts/"]');
        const headerText = (el.querySelector('#title')?.textContent || '').trim().toLowerCase();
        if (hasShorts && (headerText === 'shorts' || el.querySelector('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2'))) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    // Rich item wrappers containing a shorts shelf inside the main grid
    document.querySelectorAll('ytd-rich-item-renderer').forEach(item => {
        if (item.querySelector('ytd-reel-shelf-renderer, ytd-shorts-shelf-renderer')) {
            (item as HTMLElement).style.display = 'none';
        }
    });

    // Individual lockups (mobile / experimental) not already hidden
    document.querySelectorAll('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2').forEach(el => (el as HTMLElement).style.display = 'none');

    hideShortsFilterChip();

    // Hide mini guide Shorts entry
    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Shorts') {
            (entry as HTMLElement).style.display = 'none';
        }
    });
}

// Hide the "Shorts" filter chip in search (and any chip cloud areas)
function hideShortsFilterChip() {
    const chips = document.querySelectorAll('yt-chip-cloud-chip-renderer');
    chips.forEach(chip => {
        const text = chip.textContent?.trim().toLowerCase();
        if (text === 'shorts') {
            (chip as HTMLElement).style.display = 'none';
        }
    });
}

export function observeShorts() {
    // Guard for non-extension / test environments
    if (typeof chrome === 'undefined' || !chrome?.storage?.sync) return undefined;

    chrome.storage.sync.get(['hideShorts'], (settings) => {
        setShortsVisibility(!!settings.hideShorts);
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.hideShorts) {
            setShortsVisibility(!!changes.hideShorts.newValue);
        }
    });

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            chrome.storage.sync.get(['hideShorts'], (settings) => {
                if (settings.hideShorts) cleanupShortsShelves();
            });
        }, 500);
    });

    chrome.storage.sync.get(['hideShorts'], (settings) => {
        if (settings.hideShorts) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

    return observer;
}

export function injectShortsCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Shorts hiding applies either when the persistent attribute is set or cinema mode body class is present */
        /* Using :is() keeps selectors concise */

        /* Hide Shorts in sidebar navigation */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-guide-entry-renderer:has([title="Shorts"]) {
            display: none !important;
        }

        /* Dedicated shorts shelf components */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-reel-shelf-renderer,
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-shorts-shelf-renderer,
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-rich-item-renderer:has(> ytd-reel-shelf-renderer),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-rich-item-renderer:has(> ytd-shorts-shelf-renderer),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) grid-shelf-view-model:has(ytm-shorts-lockup-view-model),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) grid-shelf-view-model:has(ytm-shorts-lockup-view-model-v2),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model-v2),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-rich-shelf-renderer:has(a[href*="/shorts/"]),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytm-shorts-lockup-view-model,
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytm-shorts-lockup-view-model-v2 {
            display: none !important;
        }

        /* Hide "Shorts" filter chips in search chip clouds (JS also does cleanup) */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) yt-chip-cloud-chip-renderer:has(#chip-shape-container button div:only-child),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) yt-chip-cloud-chip-renderer:has(button .ytChipShapeChip):has(:scope span),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) yt-chip-cloud-chip-renderer:has(button):has(> *:not(:has(*))){
            /* fallback generic hide when text evaluated by JS */
        }

        /* Remove individual shorts tiles (search / mixed lists) */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-video-renderer:has(a[href*="/shorts/"]),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-grid-video-renderer:has(a[href*="/shorts/"]),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-compact-video-renderer:has(a[href*="/shorts/"]) {
            display: none !important;
        }

        /* Hide Shorts in home feed */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-rich-section-renderer:has([aria-label*="Short" i]),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-rich-section-renderer:has([title*="Short" i]) {
            display: none !important;
        }

        /* Hide Shorts in search results */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-video-renderer:has(.badge-shape-wiz[aria-label*="Short" i]),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-search-refinement-card-renderer:has([aria-label*="Short" i]) {
            display: none !important;
        }

        /* Hide Shorts tab in channel pages */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) tp-yt-paper-tab:has([tab-title="Shorts"]),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) yt-tab-shape:has([tab-title="Shorts"]) {
            display: none !important;
        }

        /* Hide any element with shorts in the URL */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) [href*="/shorts/"] {
            display: none !important;
        }

        /* Hide Shorts with specific badges */
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-rich-item-renderer:has(.badge-shape-wiz[aria-label*="Short" i]),
        :is(html[hide_shorts="true"], body.cinema-hide-shorts) ytd-video-renderer:has(.badge-shape-wiz[aria-label*="Short" i]) {
            display: none !important;
        }

        /* Intentionally NOT hiding: ytd-rich-grid-renderer, ytd-item-section-renderer */
    `;
    document.head.appendChild(style);
}