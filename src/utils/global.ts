


/**
 * Sets up global navigation event listeners and calls the provided callbacks on navigation events.
 * Triggers on navigation, popstate, and load events.
 * @param saveLastNonHomeUrl - Callback to save the last non-home YouTube URL.
 * @param maybeRedirectFromHome - Callback to handle redirecting from the home page if needed.
 */
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

/**
 * Removes all elements matching a selector whose text content matches the given text (case-insensitive).
 * @param selector - CSS selector for elements to remove.
 * @param text - Text content to match (case-insensitive, trimmed).
 */
export function removeElementsByText(selector: string, text: string) {
    document.querySelectorAll(selector).forEach((el) => {
        if (el.textContent?.trim().toLowerCase() === text.toLowerCase()) {
            el.remove();
        }
    });
}

/**
 * Shows or hides elements matching a selector, optionally filtered and/or targeting a parent.
 * Also handles hiding elements inside shadow roots.
 * @param selector - CSS selector for elements to show/hide.
 * @param hide - Whether to hide (true) or show (false) the elements.
 * @param filterFn - Optional filter function to further filter elements.
 * @param parentSelector - Optional parent selector to target a parent element instead.
 */
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
