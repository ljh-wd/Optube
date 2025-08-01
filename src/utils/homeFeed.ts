/**
 * Injects or removes styles to hide Home navigation elements in the YouTube sidebar and guide.
 * @param hide - Whether to hide (true) or show (false) Home navigation.
 */
export function injectHomeNavHideStyles(hide: boolean) {
    let styleElement = document.getElementById('optube-home-nav-hide') as HTMLStyleElement | null;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'optube-home-nav-hide';
        document.head.appendChild(styleElement);
    }
    if (hide) {
        styleElement.textContent = `
            ytd-guide-entry-renderer:has(a[title="Home"]),
            ytd-mini-guide-entry-renderer:has(a[title="Home"]),
            a[title="Home"],
            ytd-guide-entry-renderer:has([aria-label="Home"]),
            ytd-mini-guide-entry-renderer:has([aria-label="Home"]),
            a[aria-label="Home"] {
                display: none !important;
            }
            /* Fallback for text-based matching */
            ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, a {
                /* Hide if text is exactly "Home" */
                /* This is less efficient, but covers more cases */
            }
        `;
    } else {
        styleElement.textContent = '';
    }
}

let lastNonHomeYouTubeUrl: string | null = null;


/**
 * Determines if a URL is a non-home YouTube page.
 * @param url - The URL to check.
 * @returns True if the URL is a non-home YouTube page, false otherwise.
 */
function isNonHomeYouTubeUrl(url: string): boolean {
    try {
        const u = new URL(url, location.origin);
        return (
            u.hostname.endsWith('youtube.com') &&
            (u.pathname !== '/' || u.search.includes('feed'))
        );
    } catch {
        return false;
    }
}

/**
 * Saves the last non-home YouTube URL to local storage for redirect purposes.
 */
export function saveLastNonHomeUrl() {
    if (isNonHomeYouTubeUrl(location.href)) {
        lastNonHomeYouTubeUrl = location.href;
        chrome.storage.local.set({ optubeLastNonHomeUrl: lastNonHomeYouTubeUrl });
    }
}

/**
 * Redirects the user from the YouTube home page to the last non-home page if the home grid is hidden.
 */
export function maybeRedirectFromHome() {
    if (
        location.hostname.endsWith('youtube.com') &&
        location.pathname === '/' &&
        !location.search.includes('feed')
    ) {
        chrome.storage.sync.get(['hideHomeGrid'], (settings) => {
            if (!settings.hideHomeGrid) return;
            chrome.storage.local.get(['optubeLastNonHomeUrl'], (result) => {
                const prevUrl = result.optubeLastNonHomeUrl;
                if (prevUrl && prevUrl !== location.href) {
                    window.location.replace(prevUrl);
                }
            });
        });
    }
}
/**
 * Shows or hides the YouTube home grid based on the current page and hide flag.
 * @param hide - Whether to hide (true) or show (false) the home grid.
 */
export function hideHomeGridIfNeeded(hide: boolean) {
    const isHome = location.pathname === '/' && !location.search.includes('feed');
    const grid = document.querySelector('ytd-rich-grid-renderer') as HTMLElement | null;
    if (grid) {
        if (isHome && hide) {
            grid.style.display = 'none';
        } else {
            grid.style.display = '';
        }
    }
}

/**
 * Observes the YouTube home grid and applies hiding logic on navigation and DOM changes.
 * Automatically restores the grid when navigating away from home.
 */
export function observeHomeGrid() {
    function applyHideIfNeeded() {
        chrome.storage.sync.get(['hideHomeGrid'], (settings) => {
            const hide = !!settings.hideHomeGrid;
            hideHomeGridIfNeeded(hide);
        });
    }

    function setupGridObserver() {
        const container = document.querySelector('ytd-browse');
        if (!container) return;
        const grid = container.querySelector('ytd-rich-grid-renderer');
        if (grid) {
            applyHideIfNeeded();
        }
        // Always observe for grid being added
        const gridObserver = new MutationObserver(() => {
            const gridNow = container.querySelector('ytd-rich-grid-renderer');
            if (gridNow) {
                applyHideIfNeeded();
            }
        });
        gridObserver.observe(container, { childList: true, subtree: true });
    }

    function onRouteChange() {
        const isHome = location.pathname === '/' && !location.search.includes('feed');
        if (isHome) {
            setupGridObserver();
        } else {
            // Always restore grid if present
            const grid = document.querySelector('ytd-rich-grid-renderer') as HTMLElement | null;
            if (grid) grid.style.display = '';
        }
    }

    window.addEventListener('optube:navigation', onRouteChange);
    window.addEventListener('popstate', onRouteChange);
    window.addEventListener('load', onRouteChange);
    onRouteChange();
}
