/**
 * Shows or hides the YouTube fold (video title/description etc) by toggling display on 'ytd-fold' elements.
 * @param hide - Whether to hide (true) or show (false) the fold.
*/
export function setFoldVisibility(hide: boolean) {
    const fold = document.getElementById('above-the-fold')

    if (!fold) return
    fold.style.display = hide ? 'none' : '';
}

export function observeFold() {
    chrome.storage.sync.get(['hideFold'], (settings) => {
        const hide = !!settings.hideFold;
        setFoldVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideFold'], (settings) => {
            const hide = !!settings.hideFold;
            setFoldVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}


export function setCommentsVisibility(hide: boolean) {
    const comments = document.querySelectorAll('ytd-comments')

    if (!comments) return
    comments.forEach(comment => {
        (comment as HTMLElement).style.display = hide ? 'none' : '';
    });
}

export function observeComments() {
    chrome.storage.sync.get(['hideComments'], (settings) => {
        const hide = !!settings.hideComments;
        setCommentsVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideComments'], (settings) => {
            const hide = !!settings.hideComments;
            setCommentsVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

export function setCategoryAndTopicVisibility(hide: boolean) {
    const categories = document.querySelectorAll('ytd-metadata-row-container-renderer');

    if (!categories) return;
    categories.forEach(category => {
        (category as HTMLElement).style.display = hide ? 'none' : '';
    });
}

export function observeCategoryAndTopic() {
    chrome.storage.sync.get(['hideCategoryAndTopic'], (settings) => {
        const hide = !!settings.hideCategoryAndTopic;
        setCategoryAndTopicVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideCategoryAndTopic'], (settings) => {
            const hide = !!settings.hideCategoryAndTopic;
            setCategoryAndTopicVisibility(hide);
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}



let recommendedApplied = false;

function cleanupRecommendedStyles() {
    const recommendedInner = document.getElementById('secondary-inner');
    const columns = document.getElementById('columns');
    const primary = document.getElementById('primary');
    const secondary = recommendedInner ? (recommendedInner.closest('#secondary') as HTMLElement | null) : document.getElementById('secondary') as HTMLElement | null;
    if (secondary) {
        secondary.style.width = '';
        secondary.style.minWidth = '';
        secondary.style.maxWidth = '';
        secondary.style.flex = '';
        secondary.style.padding = '';
        secondary.style.margin = '';
        secondary.style.overflow = '';
        secondary.style.visibility = '';
        const related = secondary.querySelector('#related') as HTMLElement | null;
        if (related) related.style.display = '';
    }
    if (recommendedInner) recommendedInner.style.display = '';
    if (columns) {
        columns.style.display = '';
        columns.style.justifyContent = '';
        columns.style.alignItems = '';
    }
    if (primary) {
        primary.style.maxWidth = '';
        primary.style.flex = '';
        primary.style.margin = '';
    }
    document.documentElement.removeAttribute('optube_hide_recommended');
}

export function setRecommendedVisibility(hide: boolean) {
    // Only apply on canonical watch pages ( /watch + v param ) OR if ytd-watch-flexy is present.
    const params = new URLSearchParams(location.search);
    const isWatchPage = (location.pathname === '/watch' && params.has('v')) || !!document.querySelector('ytd-watch-flexy');
    if (!isWatchPage) {
        if (recommendedApplied) {
            cleanupRecommendedStyles();
            recommendedApplied = false;
        }
        return;
    }

    const recommendedInner = document.getElementById('secondary-inner');
    const columns = document.getElementById('columns');
    const primary = document.getElementById('primary');
    const secondary = recommendedInner ? (recommendedInner.closest('#secondary') as HTMLElement | null) : null;
    if (!recommendedInner || !columns || !primary || !secondary) return;

    if (hide) {
        document.documentElement.setAttribute('optube_hide_recommended', 'true');
        secondary.style.width = '0%';
        secondary.style.minWidth = '0';
        secondary.style.maxWidth = '0';
        secondary.style.flex = '0 0 0%';
        secondary.style.padding = '0';
        secondary.style.margin = '0';
        secondary.style.overflow = 'hidden';
        secondary.style.visibility = 'hidden';
        recommendedInner.style.display = 'none';
        const related = secondary.querySelector('#related') as HTMLElement | null;
        if (related) related.style.display = 'none';
        columns.style.display = 'flex';
        columns.style.justifyContent = 'center';
        columns.style.alignItems = 'flex-start';
        primary.style.maxWidth = '1280px';
        primary.style.flex = '1 1 auto';
        primary.style.margin = '0 auto';
        recommendedApplied = true;
    } else {
        cleanupRecommendedStyles();
        recommendedApplied = false;
    }
}

export function observeRecommended() {
    chrome.storage.sync.get(['hideRecommended'], (settings) => {
        const hide = !!settings.hideRecommended;
        setRecommendedVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideRecommended'], (settings) => {
            const hide = !!settings.hideRecommended;
            setRecommendedVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

export function setDescriptionVisibility(hide: boolean) {
    const description = document.querySelector('#bottom-row.style-scope.ytd-watch-metadata');
    if (!description) return;
    (description as HTMLElement).style.display = hide ? 'none' : '';
}

export function observeDescription() {
    chrome.storage.sync.get(['hideDescription'], (settings) => {
        const hide = !!settings.hideDescription;
        setDescriptionVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideDescription'], (settings) => {
            const hide = !!settings.hideDescription;
            setDescriptionVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

export function setTitleVisibility(hide: boolean) {
    const title = document.querySelector('#title.style-scope.ytd-watch-metadata');
    if (!title) return;
    (title as HTMLElement).style.display = hide ? 'none' : '';
}

export function observeTitle() {
    chrome.storage.sync.get(['hideTitle'], (settings) => {
        const hide = !!settings.hideTitle;
        setTitleVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideTitle'], (settings) => {
            const hide = !!settings.hideTitle;
            setTitleVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

export function setCreatorVisibility(hide: boolean) {
    const creator = document.querySelector('#top-row.style-scope.ytd-watch-metadata');
    if (!creator) return;
    (creator as HTMLElement).style.display = hide ? 'none' : '';
}

export function observeCreator() {
    chrome.storage.sync.get(['hideCreator'], (settings) => {
        const hide = !!settings.hideCreator;
        setCreatorVisibility(hide);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideCreator'], (settings) => {
            const hide = !!settings.hideCreator;
            setCreatorVisibility(hide);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}