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

function cleanupHomeFeed() {
    document.querySelectorAll('ytd-browse[page-subtype="home"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });

    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Home') {
            (entry as HTMLElement).style.display = 'none';
        }
    });

    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = 'none';
        }
    });

    document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = 'none';
        }
    });

    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = 'none';
        }
    });
}

function restoreHomeFeed() {
    document.querySelectorAll('ytd-browse[page-subtype="home"]').forEach(el => {
        (el as HTMLElement).style.display = '';
    });

    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'Home') {
            (entry as HTMLElement).style.display = '';
        }
    });

    document.querySelectorAll('ytd-rich-grid-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = '';
        }
    });

    document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = '';
        }
    });

    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            (el as HTMLElement).style.display = '';
        }
    });
}

export function observeHome() {
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

export function injectHomeCSS() {
    const cssId = 'optube-home-css';

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
