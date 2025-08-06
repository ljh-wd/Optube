export function setSidebarVisibility(hide: boolean) {
    const sidebar = document.querySelector('ytd-guide-renderer');
    if (!sidebar) return;

    (sidebar as HTMLElement).style.display = hide ? 'none' : '';
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