/**
 * Shows or hides the YouTube masthead (header bar) by toggling display on 'ytd-masthead' elements.
 * @param hide - Whether to hide (true) or show (false) the masthead.
*/
export function setMastheadVisibility(hide: boolean) {
    const masthead = document.getElementById('container');
    if (!masthead) return;

    masthead.style.display = hide ? 'none' : '';
}

export function setMastheadAvatarVisibility(hide: boolean) {
    const root = document.documentElement;
    if (hide) root.setAttribute('hide_avatar', 'true'); else root.removeAttribute('hide_avatar');
    // Conservative selectors for the avatar button
    document.querySelectorAll<HTMLElement>('#avatar-btn, ytd-topbar-menu-button-renderer #avatar-btn')
        .forEach(n => { n.style.display = hide ? 'none' : ''; });
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

/**
 * Shows or hides the YouTube notifications icon by targeting ytd-notification-topbar-button-renderer.
 * @param hide - Whether to hide (true) or show (false) the notifications icon.
*/
export function setNotificationsVisibility(hide: boolean) {
    // Target the notifications button element
    const notificationElements = document.querySelectorAll('ytd-notification-topbar-button-renderer');
    notificationElements.forEach(el => {
        (el as HTMLElement).style.display = hide ? 'none' : '';
    });
}

/** Hide/show the create (upload) button */
export function setCreateButtonVisibility(hide: boolean) {
    if (hide) {
        document.documentElement.setAttribute('hide_create_button', 'true');
    } else {
        document.documentElement.removeAttribute('hide_create_button');
    }
    // Fallback immediate hide for already present nodes until CSS applies
    const selectors = [
        'ytd-topbar-menu-button-renderer:has([aria-label="Create" i])',
        'ytd-button-renderer:has([aria-label="Create" i])',
        'button[aria-label="Create" i]'
    ];
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            (el as HTMLElement).style.display = hide ? 'none' : '';
        });
    });
}

export function observeCreateButton() {
    chrome.storage.sync.get(['hideCreateButton'], (settings) => {
        setCreateButtonVisibility(!!settings.hideCreateButton);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideCreateButton'], (settings) => setCreateButtonVisibility(!!settings.hideCreateButton));
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

let createButtonCSSInjected = false;
export function injectCreateButtonCSS() {
    if (createButtonCSSInjected) return;
    const id = 'optube-create-button-css';
    if (document.getElementById(id)) { createButtonCSSInjected = true; return; }
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `html[hide_create_button] ytd-topbar-menu-button-renderer:has([aria-label="Create" i]),\nhtml[hide_create_button] ytd-button-renderer:has([aria-label="Create" i]),\nhtml[hide_create_button] button[aria-label="Create" i] {\n  display: none !important;\n}`;
    document.head.appendChild(style);
    createButtonCSSInjected = true;
}

export function observeMasthead() {
    chrome.storage.sync.get(['hideMasthead', 'hideSearchbar', 'hideNotifications', 'hideCreateButton', 'hideAvatar'], s => {
        const hide = !!s.hideMasthead;
        setMastheadVisibility(hide);
        setMastheadAvatarVisibility(!!s.hideAvatar);
    });

    chrome.storage.onChanged.addListener(ch => {
        if (ch.hideAvatar) setMastheadAvatarVisibility(!!ch.hideAvatar.newValue);
    });

    const mo = new MutationObserver(() => {
        if (document.documentElement.hasAttribute('hide_avatar')) {
            setMastheadAvatarVisibility(true);
        }
    });
    if (document.body) mo.observe(document.body, { childList: true, subtree: true });
    return mo;
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

export function observeNotifications() {
    chrome.storage.sync.get(['hideNotifications'], (settings) => {
        const hide = !!settings.hideNotifications;
        setNotificationsVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideNotifications'], (settings) => {
            const hide = !!settings.hideNotifications;
            setNotificationsVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}