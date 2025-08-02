// Converted from content.js to TypeScript
const removedGridShelves: Array<{
    parent: Node & ParentNode & { isConnected: boolean };
    nextSibling: ChildNode | null;
    element: Element;
}> = [];

function injectStyles(hideShorts: boolean, hideHomeGrid: boolean): void {
    let styleElement = document.getElementById('optube-styles') as HTMLStyleElement | null;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'optube-styles';
        document.head.appendChild(styleElement);
    }

    let css = '';

    if (hideShorts) {
        css += `
            .ytGridShelfViewModelHost,
            [class*="shelf"][class*="shorts" i],
            ytm-shorts-lockup-view-model-v2,
            ytm-shorts-lockup-view-model,
            a[href^="/shorts/"] {
                display: none !important;
            }
        `;
    }

    if (hideHomeGrid && location.pathname === '/' && !location.search.includes('feed')) {
        css += `
            ytd-rich-grid-renderer {
                display: none !important;
            }
        `;
    }

    styleElement.textContent = css;
}
function detachElements(selector: string): void {
    const elements = document.querySelectorAll(selector);
    console.log(`Detaching ${elements.length} elements matching "${selector}"`);
    elements.forEach((el) => {
        const parent = el.parentNode as (Node & ParentNode & { isConnected: boolean }) | null;
        if (!parent) return;
        removedGridShelves.push({
            parent,
            nextSibling: el.nextSibling,
            element: el,
        });
        parent.removeChild(el);
    });
}

function reattachElements(): void {
    while (removedGridShelves.length) {
        const { parent, nextSibling, element } = removedGridShelves.shift()!;
        try {
            if (parent.isConnected) {
                if (nextSibling && parent.contains(nextSibling)) {
                    parent.insertBefore(element, nextSibling);
                } else {
                    parent.appendChild(element);
                }
            } else {
                const fallbackContainer = document.querySelector('ytd-item-section-renderer') || document.body;
                fallbackContainer.appendChild(element);
            }
        } catch (e) {
            console.warn('Failed to reattach element:', e);
        }
    }
}

function setElementsVisibility(
    selector: string,
    hide: boolean,
    filterFn?: (el: Element) => boolean,
    parentSelector?: string
): void {
    document.querySelectorAll(selector).forEach((el) => {
        if (!filterFn || filterFn(el)) {
            const target = parentSelector
                ? (el.closest(parentSelector) as HTMLElement | null) || (el as HTMLElement)
                : (el as HTMLElement);
            const shadowRoot = (target as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
            if (shadowRoot) {
                const shadowElements = shadowRoot.querySelectorAll(selector);
                shadowElements.forEach((shadowEl) => {
                    if (hide) {
                        (shadowEl as HTMLElement).setAttribute('data-optube-hidden', 'true');
                        (shadowEl as HTMLElement).style.display = 'none';
                    } else if ((shadowEl as HTMLElement).getAttribute('data-optube-hidden') === 'true') {
                        (shadowEl as HTMLElement).style.display = '';
                        (shadowEl as HTMLElement).removeAttribute('data-optube-hidden');
                    }
                });
            }
            if (hide) {
                target.setAttribute('data-optube-hidden', 'true');
                target.style.display = 'none';
            } else if (target.getAttribute('data-optube-hidden') === 'true') {
                target.style.display = '';
                target.removeAttribute('data-optube-hidden');
            }
        }
    });
}

function setShortsVisibility(hide: boolean): void {
    console.log(`Setting Shorts visibility: ${hide ? 'hide' : 'show'} `);
    injectStyles(hide, false);

    if (hide) {
        detachElements('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i]');
    } else {
        reattachElements();
    }

    setElementsVisibility(
        'ytd-rich-section-renderer',
        hide,
        (sec) => {
            const h2 = sec.querySelector('h2');
            const hasShorts = !!h2 && h2.innerText.toLowerCase().includes('shorts');
            if (hasShorts) console.log('Hiding ytd-rich-section-renderer with Shorts');
            return hasShorts;
        }
    );
    setElementsVisibility(
        'ytd-guide-entry-renderer',
        hide,
        (en) => (en.textContent || '').toLowerCase().includes('shorts')
    );
    setElementsVisibility(
        'a',
        hide,
        (a) => a.textContent?.toLowerCase().trim() === 'shorts'
    );
    setElementsVisibility(
        '*',
        hide,
        (el) => el.textContent?.toLowerCase().trim() === 'shorts',
        'ytd-mini-guide-entry-renderer, ytd-guide-entry-renderer, tp-yt-paper-item, a'
    );
    setElementsVisibility(
        'yt-section-header-view-model, yt-shelf-header-layout',
        hide,
        undefined,
        'ytd-item-section-renderer, ytd-shelf-renderer, .ytSectionHeaderViewModelHost, .shelf-header-layout-wiz'
    );
    setElementsVisibility('.ytGridShelfViewModelGridShelfRow', hide);
    setElementsVisibility(
        'ytm-shorts-lockup-view-model-v2, ytm-shorts-lockup-view-model',
        hide
    );
    setElementsVisibility(
        'a[href^="/shorts/"]',
        hide,
        undefined,
        'ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, .ytGridShelfViewModelGridShelfItem, .shortsLockupViewModelHost'
    );
    setElementsVisibility(
        'h2, h3, span',
        hide,
        (el) => el.textContent?.toLowerCase().trim() === 'shorts',
        'ytd-item-section-renderer, ytd-shelf-renderer, .ytGridShelfViewModelGridShelfRow, .ytSectionHeaderViewModelHost'
    );
    setElementsVisibility(
        'ytd-reel-shelf-renderer, ytd-reel-item-renderer',
        hide
    );
    setElementsVisibility(
        '.ytGridShelfViewModelGridShelfBottomButtonContainer button',
        hide
    );

    // Hide empty ytd-rich-shelf-renderer containers if hiding Shorts
    if (hide) {
        document.querySelectorAll('ytd-rich-shelf-renderer').forEach((shelf) => {
            // If shelf contains no visible Shorts (or is now empty), hide it
            const hasShorts = shelf.textContent?.toLowerCase().includes('shorts');
            if (!hasShorts || shelf.querySelectorAll('ytd-reel-shelf-renderer, ytd-reel-item-renderer, [class*="shorts" i]').length === 0) {
                (shelf as HTMLElement).style.display = 'none';
            }
        });
    } else {
        // Restore all shelves
        document.querySelectorAll('ytd-rich-shelf-renderer').forEach((shelf) => {
            (shelf as HTMLElement).style.display = '';
        });
    }
}

function hideHomeGridIfNeeded(hide: boolean) {
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

// --- Home grid observer ---
function observeHomeGrid() {
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

observeHomeGrid();

function cleanYouTube(settings: { hideShorts?: boolean; hideHomeGrid?: boolean; hideHomeNav?: boolean }) {
    injectStyles(!!settings.hideShorts, !!settings.hideHomeGrid);
    setShortsVisibility(!!settings.hideShorts);
    injectHomeNavHideStyles(!!settings.hideHomeGrid || !!settings.hideHomeNav);
    injectShortsNavHideStyles(!!settings.hideShorts);
    if (settings.hideShorts) hideEmptyShortsShelves();

    // Always apply grid hiding logic on settings load
    hideHomeGridIfNeeded(!!settings.hideHomeGrid);
}

function run(): void {
    chrome.storage.sync.get(['hideShorts', 'hideHomeGrid', 'hideHomeNav'], cleanYouTube);
}

let debounceId: number | null = null;
const observer = new MutationObserver((mutations) => {
    const hasShortsRelatedMutation = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
            (node) =>
                node.nodeType === Node.ELEMENT_NODE &&
                ((node as Element).matches?.('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i],ytd-rich-shelf-renderer') ||
                    (node as Element).querySelector?.('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i],ytd-rich-shelf-renderer'))
        )
    );

    if (hasShortsRelatedMutation) {
        chrome.storage.sync.get(['hideShorts', 'hideHomeGrid', 'hideHomeNav'], (settings) => {
            cleanYouTube(settings);
            if (settings.hideShorts) hideEmptyShortsShelves();
        });
    } else if (debounceId) {
        clearTimeout(debounceId);
        debounceId = window.setTimeout(() => {
            run();
            // Also ensure empty shelves are hidden after debounce
            chrome.storage.sync.get(['hideShorts', 'hideHomeGrid', 'hideHomeNav'], (settings) => {
                if (settings.hideShorts) hideEmptyShortsShelves();
            });
        }, 50);
    }
});

function startObserver(): void {
    if (!document.body) {
        setTimeout(() => startObserver(), 10);
        return;
    }
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

window.addEventListener('load', run);
run();
startObserver();

chrome.storage.onChanged.addListener((changes, area) => {
    if (
        area === 'sync' &&
        (changes.hideShorts || changes.hideHomeGrid || changes.hideHomeNav)
    ) {
        setTimeout(() => {
            run();
            // Immediately apply grid hiding if on home and hideHomeGrid changed
            if (changes.hideHomeGrid && location.pathname === '/' && !location.search.includes('feed')) {
                hideHomeGridIfNeeded(changes.hideHomeGrid.newValue);
            }
        }, 100);
    }
});

// Remove from any anchor links with text "Home"
document.querySelectorAll('a').forEach((a) => {
    if (a.textContent?.trim().toLowerCase() === 'home') {
        a.remove();
    }
});

// Remove from mini guide and sidebar
document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').forEach((el) => {
    if (el.textContent?.trim().toLowerCase() === 'home') {
        el.remove();
    }
});

function injectHomeNavHideStyles(hide: boolean) {
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

function injectShortsNavHideStyles(hide: boolean) {
    let styleElement = document.getElementById('optube-shorts-nav-hide') as HTMLStyleElement | null;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'optube-shorts-nav-hide';
        document.head.appendChild(styleElement);
    }
    if (hide) {
        styleElement.textContent = `
            ytd-guide-entry-renderer:has(a[title="Shorts"]),
            ytd-mini-guide-entry-renderer:has(a[title="Shorts"]),
            a[title="Shorts"],
            ytd-guide-entry-renderer:has([aria-label="Shorts"]),
            ytd-mini-guide-entry-renderer:has([aria-label="Shorts"]),
            a[aria-label="Shorts"] {
                display: none !important;
            }
        `;
    } else {
        styleElement.textContent = '';
    }
}

// Track previous YouTube URL (per tab, not persistent)
let lastNonHomeYouTubeUrl: string | null = null;

// Helper: is this a YouTube page (not home)?
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

// Save the last non-home YouTube URL before navigation
function saveLastNonHomeUrl() {
    if (isNonHomeYouTubeUrl(location.href)) {
        lastNonHomeYouTubeUrl = location.href;
        chrome.storage.local.set({ optubeLastNonHomeUrl: lastNonHomeYouTubeUrl });
    }
}

// On navigation, check if we should redirect from home
function maybeRedirectFromHome() {
    if (
        location.hostname.endsWith('youtube.com') &&
        location.pathname === '/' &&
        !location.search.includes('feed')
    ) {
        chrome.storage.sync.get(['hideHomeGrid'], (settings) => {
            if (!settings.hideHomeGrid) return;
            chrome.storage.local.get(['optubeLastNonHomeUrl'], (result) => {
                console.log("Maybe redirecting from home, last non-home URL:", result.optubeLastNonHomeUrl);
                const prevUrl = result.optubeLastNonHomeUrl;
                if (prevUrl && prevUrl !== location.href) {
                    window.location.replace(prevUrl);
                }
            });
        });
    }
}

// Listen for YouTube navigation events
window.addEventListener('yt-navigate-finish', () => {
    saveLastNonHomeUrl();
    maybeRedirectFromHome();
});

// Keep your other listeners for fallback...
window.addEventListener('popstate', () => {
    saveLastNonHomeUrl();
    maybeRedirectFromHome();
});
window.addEventListener('load', () => {
    saveLastNonHomeUrl();
    maybeRedirectFromHome();
});

// Hide empty Shorts shelves
function hideEmptyShortsShelves() {
    document.querySelectorAll('ytd-rich-shelf-renderer').forEach((shelf) => {
        const hasShorts = shelf.textContent?.toLowerCase().includes('shorts');
        if (!hasShorts || shelf.querySelectorAll('ytd-reel-shelf-renderer, ytd-reel-item-renderer, [class*="shorts" i]').length === 0) {
            (shelf as HTMLElement).style.display = 'none';
        }
    });
}

// Initial call to hide empty Shorts shelves
hideEmptyShortsShelves();
