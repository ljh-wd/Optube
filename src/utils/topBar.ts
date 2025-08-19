/**
 * Shows or hides the YouTube masthead (header bar) by toggling display on 'ytd-masthead' elements.
 * @param hide - Whether to hide (true) or show (false) the masthead.
*/
export function setMastheadVisibility(hide: boolean) {
    const masthead = document.getElementById('container');
    if (!masthead) return;

    masthead.style.display = hide ? 'none' : '';
}

/**
 * Shows or hides the YouTube searchbar by directly targeting the #center element.
 * @param hide - Whether to hide (true) or show (false) the searchbar.
*/
export function setSearchbarVisibility(hide: boolean) {
    // Target the #center element which contains the entire search area
    const centerElements = document.querySelectorAll('#center');
    centerElements.forEach(el => {
        (el as HTMLElement).style.display = hide ? 'none' : '';
    });
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

export function observeSearchbar() {
    chrome.storage.sync.get(['hideSearchbar'], (settings) => {
        const hide = !!settings.hideSearchbar;
        setSearchbarVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideSearchbar'], (settings) => {
            const hide = !!settings.hideSearchbar;
            setSearchbarVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}