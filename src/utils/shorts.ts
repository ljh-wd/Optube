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

function cleanupShortsShelves() {
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
    // Initial setup
    chrome.storage.sync.get(['hideShorts'], (settings) => {
        setShortsVisibility(!!settings.hideShorts);
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.hideShorts) {
            setShortsVisibility(!!changes.hideShorts.newValue);
        }
    });

    // Add a lightweight observer for dynamically loaded content
    let timeoutId: number | null = null;
    const observer = new MutationObserver(() => {
        // Debounce the cleanup to avoid excessive calls
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            chrome.storage.sync.get(['hideShorts'], (settings) => {
                if (settings.hideShorts) {
                    cleanupShortsShelves();
                }
            });
        }, 500);
    });

    // Only observe if shorts hiding is enabled
    chrome.storage.sync.get(['hideShorts'], (settings) => {
        if (settings.hideShorts) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });
}

// Add this CSS to your content stylesheet or inject it
export function injectShortsCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Hide Shorts in sidebar navigation */
        html[hide_shorts="true"] ytd-guide-entry-renderer:has([title="Shorts"]) {
            display: none !important;
        }
        
        /* Dedicated shorts shelf components */
        html[hide_shorts="true"] ytd-reel-shelf-renderer,
        html[hide_shorts="true"] ytd-shorts-shelf-renderer,
        html[hide_shorts="true"] ytd-rich-item-renderer:has(> ytd-reel-shelf-renderer),
        html[hide_shorts="true"] ytd-rich-item-renderer:has(> ytd-shorts-shelf-renderer),
        html[hide_shorts="true"] grid-shelf-view-model:has(ytm-shorts-lockup-view-model),
        html[hide_shorts="true"] grid-shelf-view-model:has(ytm-shorts-lockup-view-model-v2),
    html[hide_shorts="true"] ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model),
    html[hide_shorts="true"] ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model-v2),
    html[hide_shorts="true"] ytd-rich-shelf-renderer:has(a[href*="/shorts/"]),
        html[hide_shorts="true"] ytm-shorts-lockup-view-model,
        html[hide_shorts="true"] ytm-shorts-lockup-view-model-v2 {
            display: none !important;
        }

        /* Hide "Shorts" filter chips in search chip clouds */
        html[hide_shorts="true"] yt-chip-cloud-chip-renderer:has(#chip-shape-container button div:only-child),
        html[hide_shorts="true"] yt-chip-cloud-chip-renderer:has(button .ytChipShapeChip):has(:scope span),
        html[hide_shorts="true"] yt-chip-cloud-chip-renderer:has(button):has(> *:not(:has(*))){
            /* fallback generic hide when text evaluated by JS */
        }
        
        /* Remove individual shorts tiles (search / mixed lists) */
        html[hide_shorts="true"] ytd-video-renderer:has(a[href*="/shorts/"]),
        html[hide_shorts="true"] ytd-grid-video-renderer:has(a[href*="/shorts/"]),
        html[hide_shorts="true"] ytd-compact-video-renderer:has(a[href*="/shorts/"]) {
            display: none !important;
        }
        
        /* Hide Shorts in home feed */
        html[hide_shorts="true"] ytd-rich-section-renderer:has([aria-label*="Short" i]),
        html[hide_shorts="true"] ytd-rich-section-renderer:has([title*="Short" i]) {
            display: none !important;
        }
        
        /* Hide Shorts in search results */
        html[hide_shorts="true"] ytd-video-renderer:has(.badge-shape-wiz[aria-label*="Short" i]),
        html[hide_shorts="true"] ytd-search-refinement-card-renderer:has([aria-label*="Short" i]) {
            display: none !important;
        }
        
        /* Hide Shorts tab in channel pages */
        html[hide_shorts="true"] tp-yt-paper-tab:has([tab-title="Shorts"]),
        html[hide_shorts="true"] yt-tab-shape:has([tab-title="Shorts"]) {
            display: none !important;
        }
        
        /* Hide any element with shorts in the URL */
        html[hide_shorts="true"] [href*="/shorts/"] {
            display: none !important;
        }
        
        /* Hide Shorts with specific badges */
        html[hide_shorts="true"] ytd-rich-item-renderer:has(.badge-shape-wiz[aria-label*="Short" i]),
        html[hide_shorts="true"] ytd-video-renderer:has(.badge-shape-wiz[aria-label*="Short" i]) {
            display: none !important;
        }
        
    /* Intentionally NOT hiding: ytd-rich-grid-renderer, ytd-item-section-renderer */
    `;
    document.head.appendChild(style);
}