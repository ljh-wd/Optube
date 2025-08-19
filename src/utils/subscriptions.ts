/**
 * Toggle Subscriptions feed visibility using CSS injection.
 * This hides the subscriptions feed content and navigation.
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
    // Hide the main subscriptions feed content
    document.querySelectorAll('ytd-browse[page-subtype="subscriptions"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });

    // Hide rich grid renderer on subscriptions page
    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        // Only hide if we're on the subscriptions page
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = 'none';
        }
    });

    // Hide individual rich items on subscriptions page
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
}

function restoreSubscriptionsFeed() {
    // Restore the main subscriptions feed content
    document.querySelectorAll('ytd-browse[page-subtype="subscriptions"]').forEach(el => {
        (el as HTMLElement).style.display = '';
    });

    // Restore rich grid renderer on subscriptions page
    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        // Only restore if we're on the subscriptions page
        if (window.location.pathname.includes('/feed/subscriptions')) {
            (el as HTMLElement).style.display = '';
        }
    });

    // Restore individual rich items on subscriptions page
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
}

function cleanupSubscriptionsSidebar() {
    // Hide the subscription section in the sidebar
    document.querySelectorAll('ytd-guide-section-renderer').forEach(el => {
        const titleElement = el.querySelector('#guide-section-title, yt-formatted-string');
        if (titleElement && titleElement.textContent?.trim() === 'Subscriptions') {
            (el as HTMLElement).style.display = 'none';
        }
    });
}

function restoreSubscriptionsSidebar() {
    // Restore the subscription section in the sidebar
    document.querySelectorAll('ytd-guide-section-renderer').forEach(el => {
        const titleElement = el.querySelector('#guide-section-title, yt-formatted-string');
        if (titleElement && titleElement.textContent?.trim() === 'Subscriptions') {
            (el as HTMLElement).style.display = '';
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
    // Observer specifically for subscriptions sidebar changes
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

    // Remove existing CSS if it exists
    const existingStyle = document.getElementById(cssId);
    if (existingStyle) {
        existingStyle.remove();
    }

    const css = `
        /* Hide Subscriptions navigation in sidebar */
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
    `;

    const style = document.createElement('style');
    style.id = cssId;
    style.textContent = css;
    document.head.appendChild(style);
}
