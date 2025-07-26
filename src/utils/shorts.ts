import { setElementsVisibility } from "./global";

export function injectStyles(hide: boolean): void {
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


export function detachElements(selector: string, shelves: Array<{
    parent: Node & ParentNode & { isConnected: boolean };
    nextSibling: ChildNode | null;
    element: Element;
}>): void {
    const elements = document.querySelectorAll(selector);
    console.log(`Detaching ${elements.length} elements matching "${selector}"`);
    elements.forEach((el) => {
        const parent = el.parentNode as (Node & ParentNode & { isConnected: boolean }) | null;
        if (!parent) return;
        shelves.push({
            parent,
            nextSibling: el.nextSibling,
            element: el,
        });
        parent.removeChild(el);
    });
}


export function reattachElements(shelves: Array<{
    parent: Node & ParentNode & { isConnected: boolean };
    nextSibling: ChildNode | null;
    element: Element;
}>): void {
    while (shelves.length) {
        const { parent, nextSibling, element } = shelves.shift()!;
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


export function setShortsVisibility(hide: boolean, shelves: Array<{
    parent: Node & ParentNode & { isConnected: boolean };
    nextSibling: ChildNode | null;
    element: Element;
}>): void {
    console.log(`Setting Shorts visibility: ${hide ? 'hide' : 'show'} `);
    injectStyles(hide);


    if (hide) {
        detachElements('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i]', shelves);
    } else {
        reattachElements(shelves);
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