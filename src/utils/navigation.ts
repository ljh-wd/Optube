interface NavSettings {
    hideExplore: boolean;
    hideMoreFromYouTube: boolean;
    hideYouSection: boolean;
    hideYouFeed?: boolean;
    hideHistory: boolean;
    hidePlaylists: boolean;
    hideYourVideos: boolean;
    hideYourCourses: boolean;
    hideWatchLater: boolean;
    hideLikedVideos: boolean;
    hideExploreMusic: boolean;
    hideExploreMovies: boolean;
    hideExploreLive: boolean;
    hideExploreGaming: boolean;
    hideExploreNews: boolean;
    hideExploreSport: boolean;
    hideExploreLearning: boolean;
    hideExploreFashion: boolean;
    hideExplorePodcasts: boolean;
    hideExplorePlayables: boolean;
}

export function injectNavigationCSS() {
    const id = 'optube-navigation-css';
    if (document.getElementById(id)) {
        return;
    }
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
        ytd-guide-section-renderer[data-optube-hidden="true"],
        ytd-guide-collapsible-section-entry-renderer[data-optube-hidden="true"],
        ytd-guide-entry-renderer[data-optube-hidden="true"],
        ytd-mini-guide-entry-renderer[data-optube-hidden="true"] {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

function markMatchingGuideSections(predicate: (title: string) => boolean, hide: boolean) {
    document.querySelectorAll('ytd-guide-section-renderer').forEach(sec => {
        const titleEl = sec.querySelector('#guide-section-title, yt-formatted-string');
        const title = (titleEl?.textContent || '').trim();
        if (predicate(title)) {
            if (hide) {
                sec.setAttribute('data-optube-hidden', 'true');
            } else {
                sec.removeAttribute('data-optube-hidden');
            }
        }
    });
    if (predicate('You')) {
        document.querySelectorAll('ytd-guide-collapsible-section-entry-renderer').forEach(sec => {
            const headerText = sec.querySelector('#header-entry .title')?.textContent?.trim();
            if (headerText === 'You') {
                if (hide) {
                    sec.setAttribute('data-optube-hidden', 'true');
                } else {
                    sec.removeAttribute('data-optube-hidden');
                }
            }
        });
    }
}

function markIndividualEntries(matchers: { title: string, hide: boolean }[]) {
    document.querySelectorAll('ytd-guide-entry-renderer').forEach(entry => {
        const label = (entry.querySelector('.title, yt-formatted-string')?.textContent || '').trim();
        matchers.forEach(m => {
            if (label === m.title) {
                if (m.hide) {
                    entry.setAttribute('data-optube-hidden', 'true');
                } else {
                    entry.removeAttribute('data-optube-hidden');
                }
            }
        });
    });
}

export function applyNavigation(settings: Partial<NavSettings>) {
    const allExploreChildrenHidden = [
        settings.hideExploreMusic,
        settings.hideExploreMovies,
        settings.hideExploreLive,
        settings.hideExploreGaming,
        settings.hideExploreNews,
        settings.hideExploreSport,
        settings.hideExploreLearning,
        settings.hideExploreFashion,
        settings.hideExplorePodcasts,
        settings.hideExplorePlayables
    ].every(v => v === true);  // Adjusted to check for true, assuming undefined as false

    const effectiveHideExplore = !!settings.hideExplore || allExploreChildrenHidden;

    const allYouChildrenHidden = [
        settings.hideHistory,
        settings.hidePlaylists,
        settings.hideYourVideos,
        settings.hideYourCourses,
        settings.hideWatchLater,
        settings.hideLikedVideos
    ].every(v => v === true);  // Adjusted to check for true, assuming undefined as false

    const effectiveHideYouSection = !!settings.hideYouSection || allYouChildrenHidden || !!settings.hideYouFeed;

    markMatchingGuideSections(t => t === 'Explore', effectiveHideExplore);
    markMatchingGuideSections(t => t === 'More from YouTube', !!settings.hideMoreFromYouTube);
    markMatchingGuideSections(t => t === 'You', effectiveHideYouSection);

    if (!effectiveHideYouSection) {
        markIndividualEntries([
            { title: 'History', hide: !!settings.hideHistory },
            { title: 'Playlists', hide: !!settings.hidePlaylists },
            { title: 'Your videos', hide: !!settings.hideYourVideos },
            { title: 'Your courses', hide: !!settings.hideYourCourses },
            { title: 'Watch Later', hide: !!settings.hideWatchLater },
            { title: 'Liked videos', hide: !!settings.hideLikedVideos },
        ]);
    }

    if (!effectiveHideExplore) {
        markIndividualEntries([
            { title: 'Music', hide: !!settings.hideExploreMusic },
            { title: 'Movies & TV', hide: !!settings.hideExploreMovies },
            { title: 'Live', hide: !!settings.hideExploreLive },
            { title: 'Gaming', hide: !!settings.hideExploreGaming },
            { title: 'News', hide: !!settings.hideExploreNews },
            { title: 'Sport', hide: !!settings.hideExploreSport },
            { title: 'Learning', hide: !!settings.hideExploreLearning },
            { title: 'Fashion & beauty', hide: !!settings.hideExploreFashion },
            { title: 'Podcasts', hide: !!settings.hideExplorePodcasts },
            { title: 'Playables', hide: !!settings.hideExplorePlayables },
        ]);
    }

    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'You') {
            if (effectiveHideYouSection) {
                entry.setAttribute('data-optube-hidden', 'true');
            } else {
                entry.removeAttribute('data-optube-hidden');
            }
        }
    });
}

export function observeNavigation() {
    injectNavigationCSS();

    const KEYS: (keyof NavSettings)[] = ['hideExplore', 'hideMoreFromYouTube', 'hideYouSection', 'hideYouFeed', 'hideHistory', 'hidePlaylists', 'hideYourVideos', 'hideYourCourses', 'hideWatchLater', 'hideLikedVideos', 'hideExploreMusic', 'hideExploreMovies', 'hideExploreLive', 'hideExploreGaming', 'hideExploreNews', 'hideExploreSport', 'hideExploreLearning', 'hideExploreFashion', 'hideExplorePodcasts', 'hideExplorePlayables'];
    chrome.storage.sync.get(KEYS, applyNavigation);
    chrome.storage.onChanged.addListener(ch => {
        if (KEYS.some(k => ch[k])) {
            chrome.storage.sync.get(KEYS, applyNavigation);
        }
    });

    const observer = new MutationObserver(() => {

        if (typeof document === 'undefined' || !document.body) return;
        chrome.storage.sync.get(KEYS, applyNavigation);
    });
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
    return observer;
}