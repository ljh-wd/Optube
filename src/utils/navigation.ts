// Fine-grained navigation sidebar element removal.
// We rely on text content matching of section titles / item titles.

interface NavSettings {
    hideExplore: boolean;
    hideMoreFromYouTube: boolean;
    hideYouSection: boolean;
    hideHistory: boolean;
    hidePlaylists: boolean;
    hideYourVideos: boolean;
    hideYourCourses: boolean;
    hideWatchLater: boolean;
    hideLikedVideos: boolean;
}

function hideMatchingGuideSections(predicate: (title: string) => boolean, hide: boolean) {
    // Standard sections
    document.querySelectorAll('ytd-guide-section-renderer').forEach(sec => {
        const titleEl = sec.querySelector('#guide-section-title, yt-formatted-string');
        const title = (titleEl?.textContent || '').trim();
        if (predicate(title)) {
            (sec as HTMLElement).style.display = hide ? 'none' : '';
        }
    });
    // Collapsible 'You' section container uses a different host element
    if (predicate('You')) {
        document.querySelectorAll('ytd-guide-collapsible-section-entry-renderer').forEach(sec => {
            const headerText = sec.querySelector('#header-entry .title')?.textContent?.trim();
            if (headerText === 'You') {
                (sec as HTMLElement).style.display = hide ? 'none' : '';
            }
        });
    }
}

function hideIndividualEntries(matchers: { title: string, hide: boolean }[]) {
    // Entries inside all guide sections including collapsible
    document.querySelectorAll('ytd-guide-entry-renderer').forEach(entry => {
        const label = (entry.querySelector('.title, yt-formatted-string')?.textContent || '').trim();
        matchers.forEach(m => {
            if (label === m.title) {
                (entry as HTMLElement).style.display = m.hide ? 'none' : '';
            }
        });
    });
}

export function applyNavigation(settings: Partial<NavSettings>) {
    hideMatchingGuideSections(t => t === 'Explore', !!settings.hideExplore);
    hideMatchingGuideSections(t => t === 'More from YouTube', !!settings.hideMoreFromYouTube);
    hideMatchingGuideSections(t => t === 'You', !!settings.hideYouSection);

    // If whole You section hidden, skip individual entries for performance
    if (!settings.hideYouSection) {
        hideIndividualEntries([
            { title: 'History', hide: !!settings.hideHistory },
            { title: 'Playlists', hide: !!settings.hidePlaylists },
            { title: 'Your videos', hide: !!settings.hideYourVideos },
            { title: 'Your courses', hide: !!settings.hideYourCourses },
            { title: 'Watch Later', hide: !!settings.hideWatchLater },
            { title: 'Liked videos', hide: !!settings.hideLikedVideos },
        ]);
    }

    // Mini guide (collapsed) entry for "You" – hide when the full You section is hidden
    document.querySelectorAll('ytd-mini-guide-entry-renderer').forEach(entry => {
        const label = (entry.getAttribute('aria-label') || entry.querySelector('.title')?.textContent || '').trim();
        if (label === 'You') {
            (entry as HTMLElement).style.display = settings.hideYouSection ? 'none' : '';
        }
    });
}

export function observeNavigation() {
    const KEYS: (keyof NavSettings)[] = ['hideExplore', 'hideMoreFromYouTube', 'hideYouSection', 'hideHistory', 'hidePlaylists', 'hideYourVideos', 'hideYourCourses', 'hideWatchLater', 'hideLikedVideos'];
    chrome.storage.sync.get(KEYS, applyNavigation);
    chrome.storage.onChanged.addListener(ch => {
        if (KEYS.some(k => ch[k])) {
            chrome.storage.sync.get(KEYS, applyNavigation);
        }
    });

    // Mutation observer to re-run when sidebar re-renders.
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(KEYS, applyNavigation);
    });
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
}
