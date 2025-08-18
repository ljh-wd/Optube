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