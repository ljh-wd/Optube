// Converted from content.js to TypeScript
const removedGridShelves: Array<{
    parent: Node & ParentNode & { isConnected: boolean };
    nextSibling: ChildNode | null;
    element: Element;
}> = [];

function injectStyles(hide: boolean): void {
    let styleElement = document.getElementById('optube-styles') as HTMLStyleElement | null;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'optube-styles';
        document.head.appendChild(styleElement);
    }

    if (hide) {
        styleElement.textContent = `
      .ytGridShelfViewModelHost,
      [class*="shelf"][class*="shorts" i],
      ytm-shorts-lockup-view-model-v2,
      ytm-shorts-lockup-view-model,
      a[href^="/shorts/"] {
        display: none !important;
      }
    `;
    } else {
        styleElement.textContent = '';
    }
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
    injectStyles(hide);

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
}

function hideHomeGridIfNeeded(hide: boolean) {
    const isHome = location.pathname === '/' && !location.search.includes('feed');
    const grid = document.querySelector('ytd-rich-grid-renderer') as HTMLElement | null;
    if (grid && isHome) {
        if (hide) {
            grid.style.display = 'none';
        } else {
            grid.style.display = '';
        }
    }
}

function cleanYouTube(settings: { hideShorts?: boolean; hideHomeGrid?: boolean }) {
    hideHomeGridIfNeeded(!!settings.hideHomeGrid);
    setShortsVisibility(!!settings.hideShorts);
}

function run(): void {
    chrome.storage.sync.get(['hideShorts', 'hideHomeGrid'], cleanYouTube);
}

let debounceId: number | null = null;
const observer = new MutationObserver((mutations) => {
    const hasShortsRelatedMutation = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
            (node) =>
                node.nodeType === Node.ELEMENT_NODE &&
                ((node as Element).matches?.('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i]') ||
                    (node as Element).querySelector?.('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i]'))
        )
    );

    if (hasShortsRelatedMutation) {
        chrome.storage.sync.get(['hideShorts'], cleanYouTube);
    } else if (debounceId) {
        clearTimeout(debounceId);
        debounceId = window.setTimeout(run, 50);
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
    if (area === 'sync' && (changes.hideShorts || changes.hideHomeGrid)) {
        setTimeout(run, 100);
    }
});

console.log('Optube content script loaded.');
