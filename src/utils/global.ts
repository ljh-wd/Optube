
import type { ConfigKey } from "../types/config";

export const config: ConfigKey[] = ['hideShorts'];

/**
 * Remove elements matching a selector, optionally filtered and/or removing a parent.
 * @param {string} selector - CSS selector for elements to remove.
 * @param {function} [filterFn] - Optional filter function, receives element.
 * @param {string} [parentSelector] - Optional parent selector to remove instead.
 */

/**
 * Remove elements matching a selector, optionally filtered and/or removing a parent.
 * @param selector - CSS selector for elements to remove.
 * @param filterFn - Optional filter function, receives element.
 * @param parentSelector - Optional parent selector to remove instead.
 */
export function removeElements(
    selector: string,
    filterFn?: (el: Element) => boolean,
    parentSelector?: string
): void {
    document.querySelectorAll(selector).forEach(el => {
        if (!filterFn || filterFn(el)) {
            if (parentSelector) {
                const parent = el.closest(parentSelector);
                if (parent) {
                    parent.remove();
                    return;
                }
            }
            el.remove();
        }
    });
}


/**
 * Show or hide elements matching a selector, optionally filtered and/or removing a parent.
 * Adds a data attribute to track hidden state. Handles shadow DOM if present.
 * @param selector - CSS selector for elements to show/hide.
 * @param hide - Whether to hide (true) or show (false) the elements.
 * @param filterFn - Optional filter function, receives element.
 * @param parentSelector - Optional parent selector to apply visibility instead.
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