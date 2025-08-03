/**
 * Shows or hides the YouTube masthead (header bar) by toggling display on 'ytd-masthead' elements.
 * @param hide - Whether to hide (true) or show (false) the masthead.
*/
export function setMastheadVisibility(hide: boolean) {
    const masthead = document.getElementById('container');
    if (!masthead) return;

    masthead.style.display = hide ? 'none' : '';
}

export function observeMasthead() {
    chrome.storage.sync.get(['hideMasthead'], (settings) => {
        const hide = !!settings.hideMasthead;
        setMastheadVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideMasthead'], (settings) => {
            const hide = !!settings.hideMasthead;
            setMastheadVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}