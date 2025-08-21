let injected = false;
const FEED_LEFT_PADDING = '16px'; // gutter to apply to rich grid when sidebar hidden

function ensureSidebarCSS() {
    if (injected) return;
    const styleId = 'optube-sidebar-style';
    if (document.getElementById(styleId)) {
        injected = true;
        return;
    }
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `html[optube_hide_sidebar] tp-yt-app-drawer#guide,\nhtml[optube_hide_sidebar] ytd-mini-guide-renderer,\nhtml[optube_hide_sidebar] ytd-guide-renderer,\nhtml[optube_hide_sidebar] #guide-content,\nhtml[optube_hide_sidebar] #guide-wrapper {\n  display: none !important;\n  visibility: hidden !important;\n}\nhtml[optube_hide_sidebar] #content,\nhtml[optube_hide_sidebar] ytd-app #content,\nhtml[optube_hide_sidebar] ytd-app #page-manager {\n  margin-left: 0 !important;\n  padding-left: 0 !important;\n  --ytd-guide-width: 0px !important;\n  --ytd-mini-guide-width: 0px !important;\n}\nhtml[optube_hide_sidebar] ytd-app {\n  --ytd-guide-width: 0px !important;\n  --ytd-mini-guide-width: 0px !important;\n}\n/* Feed grid left gutter when sidebar removed */\nhtml[optube_hide_sidebar] ytd-rich-grid-renderer #contents {\n  padding-left: ${FEED_LEFT_PADDING} !important;\n  box-sizing: border-box !important;\n}\n/* Also adjust shelf renderers container */\nhtml[optube_hide_sidebar] ytd-rich-shelf-renderer #contents {\n  padding-left: ${FEED_LEFT_PADDING} !important;\n  box-sizing: border-box !important;\n}\n/* Hide the hamburger / guide toggle button when sidebar is hidden */\nhtml[optube_hide_sidebar] #guide-button,\nhtml[optube_hide_sidebar] ytd-masthead #guide-button,\nhtml[optube_hide_sidebar] yt-icon-button#guide-button {\n  display: none !important;\n  visibility: hidden !important;\n}`;
    document.documentElement.appendChild(style);
    injected = true;
}

function hideFullSidebar() {
    ensureSidebarCSS();
    // IMPORTANT: Do NOT remove YouTube's guide persistence attributes; doing so can
    // trigger internal re-initialisation that spawns a duplicate drawer/miniguide
    // when the user re-enables the sidebar. We'll rely purely on CSS + inline
    // overrides so that restoring simply unhides existing nodes.

    const app = document.querySelector<HTMLElement>('ytd-app');

    // Fallback inline styles (in case CSS injection races)
    const guideDrawer = document.querySelector<HTMLElement>('tp-yt-app-drawer#guide');
    if (guideDrawer) {
        guideDrawer.style.display = 'none';
        guideDrawer.style.visibility = 'hidden';
        guideDrawer.style.width = '0px';
        guideDrawer.style.minWidth = '0';
    }
    document.querySelectorAll<HTMLElement>('ytd-guide-renderer, #guide-content, #guide-wrapper, ytd-mini-guide-renderer').forEach(el => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
    });
    // Hide guide button inline (fallback)
    const guideButton = document.querySelector<HTMLElement>('#guide-button');
    if (guideButton) {
        guideButton.style.display = 'none';
        guideButton.style.visibility = 'hidden';
    }
    const content = document.querySelector<HTMLElement>('#content');
    if (content) {
        content.style.marginLeft = '0';
        content.style.paddingLeft = '0';
    }
    // Add left padding to feed grids (home, subscriptions, library, explore etc.)
    document.querySelectorAll<HTMLElement>('ytd-rich-grid-renderer #contents, ytd-rich-shelf-renderer #contents').forEach(el => {
        el.style.paddingLeft = FEED_LEFT_PADDING;
        el.style.boxSizing = 'border-box';
    });
    if (app) {
        app.style.setProperty('--ytd-guide-width', '0px');
        app.style.setProperty('--ytd-mini-guide-width', '0px');
    }
}

function restoreFullSidebar() {
    const app = document.querySelector<HTMLElement>('ytd-app');
    // We do NOT re-add removed attributes; YouTube will reapply them if needed on next navigation.
    const guideDrawer = document.querySelector<HTMLElement>('tp-yt-app-drawer#guide');
    if (guideDrawer) {
        guideDrawer.style.display = '';
        guideDrawer.style.visibility = '';
        guideDrawer.style.width = '';
        guideDrawer.style.minWidth = '';
    }
    document.querySelectorAll<HTMLElement>('ytd-guide-renderer, #guide-content, #guide-wrapper, ytd-mini-guide-renderer').forEach(el => {
        el.style.display = '';
        el.style.visibility = '';
    });
    const guideButton = document.querySelector<HTMLElement>('#guide-button');
    if (guideButton) {
        guideButton.style.display = '';
        guideButton.style.visibility = '';
    }
    const content = document.querySelector<HTMLElement>('#content');
    if (content) {
        content.style.marginLeft = '';
        content.style.paddingLeft = '';
    }
    document.querySelectorAll<HTMLElement>('ytd-rich-grid-renderer #contents, ytd-rich-shelf-renderer #contents').forEach(el => {
        // Only clear if we set it (best effort)
        if (el.style.paddingLeft === FEED_LEFT_PADDING) el.style.paddingLeft = '';
        if (el.style.boxSizing === 'border-box') el.style.boxSizing = '';
    });
    if (app) {
        app.style.removeProperty('--ytd-guide-width');
        app.style.removeProperty('--ytd-mini-guide-width');
    }
}

export function setSidebarVisibility(hide: boolean) {
    if (hide) {
        document.documentElement.setAttribute('optube_hide_sidebar', 'true');
        hideFullSidebar();
    } else {
        document.documentElement.removeAttribute('optube_hide_sidebar');
        restoreFullSidebar();
    }
}

export function observeSidebar() {
    chrome.storage.sync.get(['hideSidebar'], (settings) => {
        const hide = !!settings.hideSidebar;
        setSidebarVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideSidebar'], (settings) => {
            const hide = !!settings.hideSidebar;
            setSidebarVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}