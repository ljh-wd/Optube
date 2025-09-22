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
    const parent = document.querySelector('yt-content-metadata-view-model');
    if (parent) {
        const spans = parent.querySelectorAll('span.yt-core-attributed-string.yt-content-metadata-view-model__metadata-text');
        const subscriberSpan = Array.from(spans).find(span => (span.textContent?.trim().toLowerCase() ?? '').includes('subscribers'));
        if (subscriberSpan) {
            (subscriberSpan as HTMLElement).style.display = hide ? 'none' : '';
        }
        const delimiter = subscriberSpan?.nextElementSibling?.classList.contains('yt-content-metadata-view-model__delimiter')
            ? subscriberSpan.nextElementSibling
            : null;
        if (delimiter) {
            (delimiter as HTMLElement).style.display = hide ? 'none' : '';
        }

        const ownerSubCount = document.getElementById('owner-sub-count');
        if (ownerSubCount) {
            ownerSubCount.style.display = hide ? 'none' : '';
        }
    }
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

// Conservative inline hides within the Subscriptions surface only
function cleanupSubscriptionsFeed() {
    // Hide the main subscription feed content
    document.querySelectorAll('ytd-browse[page-subtype="subscriptions"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });

    // Hide rich grid renderer on subscription page
    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        // Only hide if we're on the subscription page
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    // Hide individual rich items on the subscription page
    document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    // Hide rich section renderer (subscriptions page sections)
    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    // Hide mini guide Subscriptions entry
    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Subscriptions') {
            (entry as HTMLElement).style.display = 'none';
        }
    });
}

// Reverse inline hides applied during cleanup
function restoreSubscriptionsFeed() {
    // Restore the main subscriptions feed content
    document.querySelectorAll('ytd-browse[page-subtype="subscriptions"]').forEach(el => {
        (el as HTMLElement).style.display = '';
    });

    // Restore rich grid renderer on subscription page
    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        // Only restore if we're on the subscription page
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = '';
        }
    });

    // Restore individual rich items on the subscription page
    document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = '';
        }
    });

    // Restore rich section renderer (subscriptions page sections)
    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = '';
        }
    });

    // Restore mini guide Subscriptions entry
    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Subscriptions') {
            (entry as HTMLElement).style.display = '';
        }
    });
}

// Hide the Subscriptions section in the sidebar only when we match its header text
function cleanupSubscriptionsSidebar() {
    // Hide the subscription section in the sidebar, accounting for collapsible structure
    document.querySelectorAll('ytd-guide-section-renderer').forEach(sec => {
        const collapsible = sec.querySelector('ytd-guide-collapsible-section-entry-renderer');
        if (collapsible) {
            const titleElement = collapsible.querySelector('#header-entry .title');
            if (titleElement && titleElement.textContent?.trim() === 'Subscriptions') {
                (sec as HTMLElement).style.display = 'none';
            }
        }
    });

    // Hide mini guide Subscriptions entry for consistency
    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Subscriptions') {
            (entry as HTMLElement).style.display = 'none';
        }
    });
}

// Reverse inline hides for the Subscriptions sidebar
function restoreSubscriptionsSidebar() {
    // Restore the subscription section in the sidebar, accounting for collapsible structure
    document.querySelectorAll('ytd-guide-section-renderer').forEach(sec => {
        const collapsible = sec.querySelector('ytd-guide-collapsible-section-entry-renderer');
        if (collapsible) {
            const titleElement = collapsible.querySelector('#header-entry .title');
            if (titleElement && titleElement.textContent?.trim() === 'Subscriptions') {
                (sec as HTMLElement).style.display = '';
            }
        }
    });

    // Restore mini guide Subscriptions entry for consistency
    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Subscriptions') {
            (entry as HTMLElement).style.display = '';
        }
    });
}

export function observeSubscriptions() {
    // Observer specifically for subscriptions page changes
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
    // Initial fetch from storage and apply
    chrome.storage.sync.get(['hideSubscriptionsSidebar'], (settings) => {
        setSubscriptionsSidebarVisibility(!!settings.hideSubscriptionsSidebar);
    });

    // Listen for storage changes and re-apply
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.hideSubscriptionsSidebar) {
            setSubscriptionsSidebarVisibility(!!changes.hideSubscriptionsSidebar.newValue);
        }
    });

    // Observer specifically for subscriptions sidebar changes (reapplies on DOM mutations)
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

/**
 * Inject CSS to hide subscriptions feed elements and navigation.
 * This provides a more reliable way to hide content that gets dynamically loaded.
 */
export function injectSubscriptionsCSS() {
    const cssId = 'optube-subscriptions-css';

    // Remove the existing CSS if it exists
    const existingStyle = document.getElementById(cssId);
    if (existingStyle) {
        existingStyle.remove();
    }

    const css = `
        /* Hide Subscriptions navigation in sidebar (for feed hide) */
        html[hide_subscriptions] ytd-guide-entry-renderer:has([title="Subscriptions"]) {
            display: none !important;
        }
        
        /* Hide subscriptions feed when hide_subscriptions attribute is present - ONLY on subscriptions page */
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] {
            display: none !important;
        }
        
        /* Only hide these elements when specifically on the subscriptions page */
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer {
            display: none !important;
        }
        
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] ytd-rich-item-renderer {
            display: none !important;
        }
        
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] ytd-rich-section-renderer {
            display: none !important;
        }
        
        /* Hide subscriptions feed containers more specifically */
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] #contents {
            display: none !important;
        }
        
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] #primary {
            display: none !important;
        }
        
        /* Hide subscriptions content container */
        html[hide_subscriptions] ytd-browse[page-subtype="subscriptions"] ytd-two-column-browse-results-renderer {
            display: none !important;
        }

        /* Hide the subscriptions sidebar section, targeting the collapsible structure */
        html[hide_subscriptions_sidebar] ytd-guide-section-renderer:has(ytd-guide-collapsible-section-entry-renderer:has(#header-entry .title.yt-formatted-string)) {
            display: none !important;
        }
        
        /* Also hide mini-guide entry for consistency with sidebar hide */
        html[hide_subscriptions_sidebar] ytd-mini-guide-entry-renderer[aria-label="Subscriptions"] {
            display: none !important;
        }
    `;

    const style = document.createElement('style');
    style.id = cssId;
    style.textContent = css;
    document.head.appendChild(style);
}
