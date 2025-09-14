/**
 * Toggle Home feed visibility using CSS injection.
 * This hides the main feed content on the YouTube home page.
 */
export function setHomeVisibility(hide: boolean) {
    if (hide) {
        document.documentElement.setAttribute('hide_home', 'true');
        cleanupHomeFeed();
    } else {
        document.documentElement.removeAttribute('hide_home');
        restoreHomeFeed();
    }
}

// Conservative inline hides only within the actual Home surface
function cleanupHomeFeed() {
    // Hide the main home feed content
    document.querySelectorAll('ytd-browse[page-subtype="home"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });

    // Hide mini guide Home entry
    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Home') {
            (entry as HTMLElement).style.display = 'none';
        }
    });

    // Hide rich grid renderer on home page (main feed container)
    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        // Only hide if we're on the home page
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = 'none';
        }
    });

    // Hide individual rich items on home page
    document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = 'none';
        }
    });

    // Hide rich section renderer (home page sections)
    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = 'none';
        }
    });
}

// Reverse inline hides applied during cleanup
function restoreHomeFeed() {
    // Restore the main home feed content
    document.querySelectorAll('ytd-browse[page-subtype="home"]').forEach(el => {
        (el as HTMLElement).style.display = '';
    });

    // Restore mini guide Home entry
    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Home') {
            (entry as HTMLElement).style.display = '';
        }
    });

    // Restore rich grid renderer on home page (main feed container)
    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        // Only restore if we're on the home page
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = '';
        }
    });

    // Restore individual rich items on home page
    document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = '';
        }
    });

    // Restore rich section renderer (home page sections)
    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = '';
        }
    });
}

export function observeHome() {
    // Observer specifically for home page changes
    const observer = new MutationObserver(() => {
        const hideHome = document.documentElement.hasAttribute('hide_home');
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '';

        if (isHomePage) {
            if (hideHome) {
                cleanupHomeFeed();
                return;
            }
            restoreHomeFeed();
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
 * Inject CSS to hide home feed elements.
 * This provides a more reliable way to hide content that gets dynamically loaded.
 */
export function injectHomeCSS() {
    const cssId = 'optube-home-css';

    // Remove existing CSS if it exists
    const existingStyle = document.getElementById(cssId);
    if (existingStyle) {
        existingStyle.remove();
    }

    const css = `
        /* Hide Home navigation in sidebar */
        html[hide_home] ytd-guide-entry-renderer:has([title="Home"]) {
            display: none !important;
        }
        
        /* Hide home feed when hide_home attribute is present - ONLY on home page */
        html[hide_home] ytd-browse[page-subtype="home"] {
            display: none !important;
        }
        
        /* Only hide these elements when specifically on the home page */
        html[hide_home] ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
            display: none !important;
        }
        
        html[hide_home] ytd-browse[page-subtype="home"] ytd-rich-item-renderer {
            display: none !important;
        }
        
        html[hide_home] ytd-browse[page-subtype="home"] ytd-rich-section-renderer {
            display: none !important;
        }
        
        /* Hide home feed containers more specifically */
        html[hide_home] ytd-browse[page-subtype="home"] #contents {
            display: none !important;
        }
        
        html[hide_home] ytd-browse[page-subtype="home"] #primary {
            display: none !important;
        }
        
        /* Alternative approach - hide content only when URL is root */
        html[hide_home] ytd-browse[page-subtype="home"] ytd-two-column-browse-results-renderer {
            display: none !important;
        }
    `;

    const style = document.createElement('style');
    style.id = cssId;
    style.textContent = css;
    document.head.appendChild(style);
}
