// Converted from content.js to TypeScript
import { setShortsVisibility, hideEmptyShortsShelves } from './utils/shorts';
import { hideHomeGridIfNeeded, observeHomeGrid, saveLastNonHomeUrl, maybeRedirectFromHome, injectHomeNavHideStyles } from './utils/homeFeed';
import { removeElementsByText, setupGlobalListeners } from './utils/global';
import { injectShortsNavHideStyles } from './utils/shorts';
import { observeMasthead, setMastheadVisibility } from './utils/topBar';
import { observeCategoryAndTopic, observeComments, observeFold, setCategoryAndTopicVisibility, setCommentsVisibility, setFoldVisibility } from './utils/video';

function injectStyles(hideShorts: boolean, hideHomeGrid: boolean): void {
    let styleElement = document.getElementById('optube-styles') as HTMLStyleElement | null;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'optube-styles';
        document.head.appendChild(styleElement);
    }

    let css = '';

    if (hideShorts) {
        css += `
            .ytGridShelfViewModelHost,
            [class*="shelf"][class*="shorts" i],
            ytm-shorts-lockup-view-model-v2,
            ytm-shorts-lockup-view-model,
            a[href^="/shorts/"] {
                display: none !important;
            }
        `;
    }

    if (hideHomeGrid && location.pathname === '/' && !location.search.includes('feed')) {
        css += `
            ytd-rich-grid-renderer {
                display: none !important;
            }
        `;
    }

    styleElement.textContent = css;
}
observeHomeGrid();

function cleanYouTube(settings: { hideShorts?: boolean; hideHomeGrid?: boolean; hideHomeNav?: boolean; hideMasthead?: boolean, hideFold?: boolean, hideComments?: boolean, hideCategoryAndTopic?: boolean }): void {
    injectStyles(!!settings.hideShorts, !!settings.hideHomeGrid);
    setShortsVisibility(!!settings.hideShorts);
    injectHomeNavHideStyles(!!settings.hideHomeGrid || !!settings.hideHomeNav);
    injectShortsNavHideStyles(!!settings.hideShorts);
    setMastheadVisibility(!!settings.hideMasthead);
    setCommentsVisibility(!!settings.hideComments);
    setFoldVisibility(!!settings.hideFold);
    setCategoryAndTopicVisibility(!!settings.hideCategoryAndTopic);
    if (settings.hideShorts) hideEmptyShortsShelves();
    hideHomeGridIfNeeded(!!settings.hideHomeGrid);
}

function run(): void {
    chrome.storage.sync.get(['hideShorts', 'hideHomeGrid', 'hideHomeNav', 'hideMasthead', 'hideFold', 'hideComments', 'hideCategoryAndTopic'], cleanYouTube);
}

let debounceId: number | null = null;
const observer = new MutationObserver((mutations) => {
    const hasShortsRelatedMutation = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
            (node) =>
                node.nodeType === Node.ELEMENT_NODE &&
                ((node as Element).matches?.('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i],ytd-rich-shelf-renderer') ||
                    (node as Element).querySelector?.('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i],ytd-rich-shelf-renderer'))
        )
    );

    if (hasShortsRelatedMutation) {
        chrome.storage.sync.get(['hideShorts'], (settings) => {
            cleanYouTube(settings);
            if (settings.hideShorts) hideEmptyShortsShelves();
        });
    } else if (debounceId) {
        clearTimeout(debounceId);
        debounceId = window.setTimeout(() => {
            run();
            // Also ensure empty shelves are hidden after debounce
            chrome.storage.sync.get(['hideShorts'], (settings) => {
                if (settings.hideShorts) hideEmptyShortsShelves();
            });
        }, 50);
    }
});

function startObserver(): void {
    if (!document.body) {
        setTimeout(() => startObserver(), 10);
        return;
    }
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

window.addEventListener('load', run);
run();
startObserver();

chrome.storage.onChanged.addListener((changes, area) => {
    if (
        area === 'sync' &&
        (changes.hideShorts || changes.hideHomeGrid || changes.hideHomeNav || changes.hideMasthead || changes.hideFold || changes.hideComments || changes.hideCategoryAndTopic)
    ) {
        setTimeout(() => {
            run();
            // ? Immediately apply grid hiding if on home and hideHomeGrid changed
            if (changes.hideHomeGrid && location.pathname === '/' && !location.search.includes('feed')) {
                hideHomeGridIfNeeded(changes.hideHomeGrid.newValue);
            }
        }, 100);
    }
});

// Remove from any anchor links with text "Home"
removeElementsByText('a', 'home');
// Remove from mini guide and sidebar
removeElementsByText('ytd-guide-entry-renderer', 'home');
removeElementsByText('ytd-mini-guide-entry-renderer', 'home');



// Setup global navigation listeners
setupGlobalListeners(saveLastNonHomeUrl, maybeRedirectFromHome);

// Initial call to hide empty Shorts shelves
hideEmptyShortsShelves();



observeMasthead();
observeFold();
observeComments();
observeCategoryAndTopic();
