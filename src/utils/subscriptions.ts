/**
 * Toggle Subscriptions feed visibility using CSS injection.
 * This hides the subscription feed content and navigation.
 */
export function setSubscriptionsVisibility(hide: boolean) {
    if (hide) {
        document.documentElement.setAttribute('hide_subscriptions', 'true');
        cleanupSubscriptionsFeed();
    } else {
        document.documentElement.removeAttribute('hide_subscriptions');
        restoreSubscriptionsFeed();
    }
}

export function setChannelSubscriberCount(hide: boolean) {
    if (hide) {
        document.documentElement.setAttribute('hide_subscriber_count', 'true');
    } else {
        document.documentElement.removeAttribute('hide_subscriber_count');
    }
    injectSubscriptionsCSS();
}

/**
 * Toggle Subscriptions sidebar visibility using CSS injection.
 * This hides the subscription section in the sidebar.
 */
export function setSubscriptionsSidebarVisibility(hide: boolean) {
    if (hide) {
        document.documentElement.setAttribute('hide_subscriptions_sidebar', 'true');
        cleanupSubscriptionsSidebar();
    } else {
        document.documentElement.removeAttribute('hide_subscriptions_sidebar');
        restoreSubscriptionsSidebar();
    }
}

function cleanupSubscriptionsFeed() {
    document.querySelectorAll('ytd-browse[page-subtype="subscriptions"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });

    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Subscriptions') {
            (entry as HTMLElement).style.display = 'none';
        }
    });
}

function restoreSubscriptionsFeed() {
    document.querySelectorAll('ytd-browse[page-subtype="subscriptions"]').forEach(el => {
        (el as HTMLElement).style.display = '';
    });

    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = '';
        }
    });

    document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = '';
        }
    });

    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = '';
        }
    });

    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Subscriptions') {
            (entry as HTMLElement).style.display = '';
        }
    });
}

function cleanupSubscriptionsSidebar() {
    document.querySelectorAll('ytd-guide-section-renderer').forEach(sec => {
        const collapsible = sec.querySelector('ytd-guide-collapsible-section-entry-renderer');
        if (collapsible) {
            const titleElement = collapsible.querySelector('#header-entry .title');
            if (titleElement && titleElement.textContent?.trim() === 'Subscriptions') {
                (sec as HTMLElement).style.display = 'none';
            }
        }
    });

    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Subscriptions') {
            (entry as HTMLElement).style.display = 'none';
        }
    });
}

function restoreSubscriptionsSidebar() {
    document.querySelectorAll('ytd-guide-section-renderer').forEach(sec => {
        const collapsible = sec.querySelector('ytd-guide-collapsible-section-entry-renderer');
        if (collapsible) {
            const titleElement = collapsible.querySelector('#header-entry .title');
            if (titleElement && titleElement.textContent?.trim() === 'Subscriptions') {
                (sec as HTMLElement).style.display = '';
            }
        }
    });

    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Subscriptions') {
            (entry as HTMLElement).style.display = '';
        }
    });
}

export function observeSubscriptions() {
    const observer = new MutationObserver(() => {
        const hideSubscriptions = document.documentElement.hasAttribute('hide_subscriptions');
        const isSubscriptionsPage = window.location.pathname.includes('/feed/subscriptions');

        if (isSubscriptionsPage) {
            if (hideSubscriptions) {
                cleanupSubscriptionsFeed();
            } else {
                restoreSubscriptionsFeed();
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    return observer;
}

export function observeSubscriptionsSidebar() {
    chrome.storage.sync.get(['hideSubscriptionsSidebar'], (settings) => {
        setSubscriptionsSidebarVisibility(!!settings.hideSubscriptionsSidebar);
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.hideSubscriptionsSidebar) {
            setSubscriptionsSidebarVisibility(!!changes.hideSubscriptionsSidebar.newValue);
        }
    });

    const observer = new MutationObserver(() => {
        const hideSubscriptionsSidebar = document.documentElement.hasAttribute('hide_subscriptions_sidebar');

        if (hideSubscriptionsSidebar) {
            cleanupSubscriptionsSidebar();
        } else {
            restoreSubscriptionsSidebar();
        }
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    return observer;
}


export function injectSubscriptionsCSS() {
    const cssId = 'optube-subscriptions-css';

    const existingStyle = document.getElementById(cssId);
    if (existingStyle) {
        existingStyle.remove();
    }

    const css = `
        /* Hide Subscriptions navigation in sidebar (for feed hide) */
        html[hide_subscriptions] ytd-guide-entry-renderer:has([title="Subscriptions"]) {
            display: none ;
        }
        
        /* Hide subscriptions feed when hide_subscriptions attribute is present - ONLY on subscriptions page */
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] {
            display: none ;
        }
        
        /* Only hide these elements when specifically on the subscriptions page */
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer {
            display: none ;
        }
        
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] ytd-rich-item-renderer {
            display: none ;
        }
        
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] ytd-rich-section-renderer {
            display: none ;
        }
        
        /* Hide subscriptions feed containers more specifically */
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] #contents {
            display: none ;
        }
        
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] #primary {
            display: none ;
        }
        
        /* Hide subscriptions content container */
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] ytd-two-column-browse-results-renderer {
            display: none ;
        }

        /* Hide the subscriptions sidebar section, targeting the collapsible structure */
        html[hide_subscriptions_sidebar] ytd-guide-section-renderer:has(ytd-guide-collapsible-section-entry-renderer:has(#header-entry .title.yt-formatted-string)) {
            display: none ;
        }
        
        /* Also hide mini-guide entry for consistency with sidebar hide */
        html[hide_subscriptions_sidebar] ytd-mini-guide-entry-renderer[aria-label="Subscriptions"] {
            display: none ;
        }

        /* Hide channel subscriber counts across surfaces when toggle is on */
        /* Watch page under channel name */
        html[hide_subscriber_count] #owner-sub-count,
        html[hide_subscriber_count] ytd-video-owner-renderer #owner-sub-count,
        /* Channel header (classic) */
        html[hide_subscriber_count] #subscriber-count,
        html[hide_subscriber_count] ytd-c4-tabbed-header-renderer #subscriber-count,
        /* Channel tiles in search/sidebars/etc. */
        html[hide_subscriber_count] ytd-channel-renderer #subscribers,
        html[hide_subscriber_count] ytd-mini-channel-renderer #subscribers,
        html[hide_subscriber_count] ytd-compact-channel-renderer #subscribers,
        html[hide_subscriber_count] ytd-grid-channel-renderer #subscribers,
        html[hide_subscriber_count] ytd-rich-grid-channel-renderer #subscribers {
            display: none ;
        }

        /* New channel header view-model: hide only the subscriber count piece */
        /* Pattern: first row is handle, then a standalone delimiter, then a row with: [subscribers] [delimiter] [videos] */
        /* Hide the subscriber text (first metadata text span) in the second row */
        html[hide_subscriber_count] yt-content-metadata-view-model > .yt-content-metadata-view-model__metadata-row + .yt-content-metadata-view-model__delimiter + .yt-content-metadata-view-model__metadata-row > .yt-content-metadata-view-model__metadata-text:first-of-type {
            display: none ;
        }
        /* Hide the first intra-row delimiter that would otherwise precede the videos count */
        html[hide_subscriber_count] yt-content-metadata-view-model > .yt-content-metadata-view-model__metadata-row + .yt-content-metadata-view-model__delimiter + .yt-content-metadata-view-model__metadata-row > .yt-content-metadata-view-model__delimiter:first-of-type {
            display: none ;
        }
        /* Hide the standalone delimiter between the handle row and the subscribers/videos row */
        html[hide_subscriber_count] yt-content-metadata-view-model > .yt-content-metadata-view-model__delimiter--standalone {
            display: none ;
        }
    `;

    const style = document.createElement('style');
    style.id = cssId;
    style.textContent = css;
    document.head.appendChild(style);
}
