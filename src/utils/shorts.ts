/**
 * Injects or removes styles to hide Shorts navigation elements in the YouTube sidebar and guide.
 * @param hide - Whether to hide (true) or show (false) Shorts navigation.
 */
export function injectShortsNavHideStyles(hide: boolean) {
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
import { setElementsVisibility } from './global';
/**
 * Stores removed grid shelf elements for Shorts so they can be reattached later.
 * Used by detachElements/reattachElements.
 */
const removedGridShelves: Array<{
    parent: Node & ParentNode & { isConnected: boolean };
    nextSibling: ChildNode | null;
    element: Element;
}> = [];

/**
 * Detaches elements matching the selector and stores them for later reattachment.
 * Used for hiding Shorts grid shelves.
 * @param selector - CSS selector for elements to detach.
 */
export function detachElements(selector: string): void {
    const elements = document.querySelectorAll(selector);
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

/**
 * Reattaches previously detached grid shelf elements for Shorts.
 */
export function reattachElements(): void {
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

/**
 * Shows or hides all Shorts-related UI elements on the page.
 * @param hide - Whether to hide (true) or show (false) Shorts UI.
 */
export function setShortsVisibility(hide: boolean): void {
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
            const hasShorts = shelf.textContent?.toLowerCase().includes('shorts');
            if (!hasShorts || shelf.querySelectorAll('ytd-reel-shelf-renderer, ytd-reel-item-renderer, [class*="shorts" i]').length === 0) {
                (shelf as HTMLElement).style.display = 'none';
            }
        });
    } else {
        document.querySelectorAll('ytd-rich-shelf-renderer').forEach((shelf) => {
            (shelf as HTMLElement).style.display = '';
        });
    }
}

/**
 * Hides all empty Shorts shelves on the page.
 */
export function hideEmptyShortsShelves() {
    document.querySelectorAll('ytd-rich-shelf-renderer').forEach((shelf) => {
        const hasShorts = shelf.textContent?.toLowerCase().includes('shorts');
        if (!hasShorts || shelf.querySelectorAll('ytd-reel-shelf-renderer, ytd-reel-item-renderer, [class*="shorts" i]').length === 0) {
            (shelf as HTMLElement).style.display = 'none';
        }
    });
}
