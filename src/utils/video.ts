/**
 * Shows or hides the YouTube fold (video title/description etc.) by toggling the display on 'ytd-fold' elements.
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
    observer.observe(document.body, {childList: true, subtree: true});
}


export function setCommentsVisibility(hide: boolean) {
    const comments = document.querySelectorAll('ytd-comments')

    if (!comments) return
    comments.forEach(comment => {
        (comment as HTMLElement).style.display = hide ? 'none' : '';
    });
}

export function setAiSummaryVisibility(hide: boolean) {
    document.querySelectorAll('#expandable-metadata').forEach(el => {
        (el as HTMLElement).style.display = hide ? 'none' : '';
    });
}

export function observeAiSummary() {
    chrome.storage.sync.get(['hideAiSummary'], (settings) => {
        setAiSummaryVisibility(!!settings.hideAiSummary);
    });
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideAiSummary'], (settings) => {
            setAiSummaryVisibility(!!settings.hideAiSummary);
        });
    });
    observer.observe(document.body, {childList: true, subtree: true});
}


export function setCommentAvatarsVisibility(hide: boolean) {
    // Use attribute and injected CSS so dynamically loaded comments update automatically.
    if (hide) {
        document.documentElement.setAttribute('hide_comment_avatars', 'true');
    } else {
        document.documentElement.removeAttribute('hide_comment_avatars');
    }
    // Fallback immediate inline application for currently present nodes (in case CSS race).
    document.querySelectorAll('#author-thumbnail, ytd-comment-view-model #author-thumbnail, ytd-comment-simplebox-renderer #author-thumbnail').forEach(el => {
        (el as HTMLElement).style.display = hide ? 'none' : '';
    });
}


export function injectVideoPlayerCSS() {
    let videoPlayerCSSInjected = false;
    if (videoPlayerCSSInjected) return;
    const id = 'optube-video-player-css';
    if (document.getElementById(id)) {
        return;
    }

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
html[optube_hide_recommended] #movie_player .html5-video-container {
width: 100% !important;
height: 100% !important;
box-sizing: border-box !important;
position: relative !important;
}
html[optube_hide_recommended] #movie_player .ytp-chrome-bottom {
width: 100% !important;
}
html[optube_hide_recommended] #movie_player .html5-video-container video {
width: 100% !important;
height: 100% !important;
min-width: 100% !important;
min-height: 100% !important;
object-fit: cover !important;
position: absolute !important;
top: 0 !important;
left: 0 !important;
}
html[optube_hide_recommended] #movie_player .ytp-chapters-container {
width: 100% !important;
display: flex !important;
justify-content: space-between !important;
box-sizing: border-box !important;
gap: 0.2rem !important;
}
html[optube_hide_recommended] #movie_player .ytp-heat-map-container {
width: 100% !important;
display: flex !important;
justify-content: space-between !important;
box-sizing: border-box !important;
gap: 0.2rem !important;
}
html[optube_hide_recommended] #movie_player .ytp-heat-map-container > div {
width: auto !important;
flex-grow: 1 !important;
left: unset !important;
position: relative !important;
margin-right: 0 !important;
}
html[optube_hide_recommended] #movie_player .ytp-chapters-container .ytp-chapter-hover-container {
width: auto !important;
min-width: 0 !important;
margin-right: 0 !important;
flex-grow: 1 !important;
box-sizing: border-box !important;
}
html[optube_hide_recommended] #movie_player .ytp-chapters-container .ytp-chapter-hover-container:last-child {
margin-right: 0 !important; /* Remove margin on the last child */
}
`;
    document.head.appendChild(style);
    videoPlayerCSSInjected = true;
}

export function observeCommentAvatars() {
    chrome.storage.sync.get(['hideCommentAvatars'], (settings) => setCommentAvatarsVisibility(!!settings.hideCommentAvatars));
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['hideCommentAvatars'], (settings) => setCommentAvatarsVisibility(!!settings.hideCommentAvatars));
    });
    observer.observe(document.body, {childList: true, subtree: true});
}


// Inject CSS for comment avatar hiding (once)
export function injectCommentAvatarCSS() {
    let commentAvatarCSSInjected = false;
    if (commentAvatarCSSInjected) return;
    const id = 'optube-comment-avatars-css';
    if (document.getElementById(id)) {
        commentAvatarCSSInjected = true;
        return;
    }
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
html[hide_comment_avatars] #author-thumbnail,
html[hide_comment_avatars] ytd-comment-view-model #author-thumbnail,
html[hide_comment_avatars] ytd-comment-simplebox-renderer #author-thumbnail {
  display: none !important;
}
html[hide_comment_avatars] #expander.style-scope.ytd-comment-replies-renderer .expander-header.style-scope.ytd-comment-replies-renderer {
  align-items: flex-start !important;
}
`;
    document.head.appendChild(style);
    commentAvatarCSSInjected = true;
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
    observer.observe(document.body, {childList: true, subtree: true});
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

    observer.observe(document.body, {childList: true, subtree: true});
}


let recommendedApplied = false;

function cleanupRecommendedStyles() {
    const recommendedInner = document.getElementById('secondary-inner');
    const secondary = recommendedInner ? (recommendedInner.closest('#secondary') as HTMLElement | null) : document.getElementById('secondary') as HTMLElement | null;
    // Prefer #columns that actually contain the #secondary (scoped to the watch layout).
    let columns = document.getElementById('columns') as HTMLElement | null;
    if (secondary && columns && !columns.contains(secondary)) {
        // try finding a column element relative to the secondary
        const candidate = secondary.closest('#columns') as HTMLElement | null;
        if (candidate) columns = candidate;
    }
    // If columns are scoped, try to find the primary inside it; fallback to global lookup.
    const primary = columns ? columns.querySelector('#primary') as HTMLElement | null : document.getElementById('primary') as HTMLElement | null;
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
    // Only apply on canonical watch pages (/watch + v param) OR if ytd-watch-flexy is present.
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
    const secondary = recommendedInner ? (recommendedInner.closest('#secondary') as HTMLElement | null) : null;
    if (!recommendedInner || !secondary) return;

    // Prefer #columns that actually contain the #secondary (scoped to the watch layout).
    let columns = document.getElementById('columns') as HTMLElement | null;
    if (columns && !columns.contains(secondary)) {
        const candidate = secondary.closest('#columns') as HTMLElement | null;
        if (candidate) columns = candidate;
    }
    // Find primary inside the scoped columns when possible.
    const primary = columns ? columns.querySelector('#primary') as HTMLElement | null : document.getElementById('primary') as HTMLElement | null;
    if (!columns || !primary) return;

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
    observer.observe(document.body, {childList: true, subtree: true});
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
    observer.observe(document.body, {childList: true, subtree: true});
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
    observer.observe(document.body, {childList: true, subtree: true});
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
    observer.observe(document.body, {childList: true, subtree: true});
}