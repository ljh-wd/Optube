

// Setup global window event listeners for navigation
export function setupGlobalListeners(saveLastNonHomeUrl: () => void, maybeRedirectFromHome: () => void) {
    window.addEventListener('yt-navigate-finish', () => {
        saveLastNonHomeUrl();
        maybeRedirectFromHome();
    });
    window.addEventListener('popstate', () => {
        saveLastNonHomeUrl();
        maybeRedirectFromHome();
    });
    window.addEventListener('load', () => {
        saveLastNonHomeUrl();
        maybeRedirectFromHome();
    });
}
// Remove elements matching a selector and text content
export function removeElementsByText(selector: string, text: string) {
    document.querySelectorAll(selector).forEach((el) => {
        if (el.textContent?.trim().toLowerCase() === text.toLowerCase()) {
            el.remove();
        }
    });
}
// Global utility functions for Optube
export function setElementsVisibility(
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
