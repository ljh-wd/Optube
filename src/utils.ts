/**
 * Remove elements matching a selector, optionally filtered and/or removing a parent.
 * @param {string} selector - CSS selector for elements to remove.
 * @param {function} [filterFn] - Optional filter function, receives element.
 * @param {string} [parentSelector] - Optional parent selector to remove instead.
 */
export function removeElements(
    selector: string,
    filterFn?: (el: Element) => boolean,
    parentSelector?: string
) {
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