/**
 * Hide sections on the /feed/you page using ONLY CSS (no direct inline style changes for hiding).
 * Strategy:
 *  - We annotate each `ytd-rich-section-renderer` on the You page with a data attribute `data-optube-section`
 *    whose value matches one of the known You section labels (History, Playlists, Your videos, Your courses,
 *    Watch later, Liked videos) when we can infer it from a heading element.
 *  - We set attributes on <html> derived from existing settings (hideYouSection + individual children) so that
 *    injected CSS can hide the matching sections.
 *  - If the parent (hideYouSection) is enabled we hide all sections on the You page.
 *
 * NOTE: We intentionally use MutationObserver + attribute driven CSS instead of imperative inline styling
 *       to satisfy the "CSS injection" requirement.
 */

type YouSettings = {
    hideYouSection?: boolean;
    hideHistory?: boolean;
    hidePlaylists?: boolean;
    hideYourVideos?: boolean;
    hideYourCourses?: boolean;
    hideWatchLater?: boolean;
    hideLikedVideos?: boolean;
};

const ROOT_FLAG = 'optube-you-page';

const SECTION_LABELS = [
    'History',
    'Playlists',
    'Your videos',
    'Your courses',
    'Watch later',
    'Liked videos'
];

/** Apply / update root <html> attributes reflecting current settings */
export function applyYouFeedAttributes(settings: YouSettings) {
    if (!isYouFeed()) {
        // Clean up attributes when leaving the page
        document.documentElement.removeAttribute(ROOT_FLAG);
        removeAttr('hide_you_section');
        removeAttr('hide_you_history');
        removeAttr('hide_you_playlists');
        removeAttr('hide_you_your_videos');
        removeAttr('hide_you_your_courses');
        removeAttr('hide_you_watch_later');
        removeAttr('hide_you_liked_videos');
        return;
    }

    document.documentElement.setAttribute(ROOT_FLAG, 'true');

    toggleAttr('hide_you_section', !!settings.hideYouSection);
    toggleAttr('hide_you_history', !!settings.hideHistory);
    toggleAttr('hide_you_playlists', !!settings.hidePlaylists);
    toggleAttr('hide_you_your_videos', !!settings.hideYourVideos);
    toggleAttr('hide_you_your_courses', !!settings.hideYourCourses);
    toggleAttr('hide_you_watch_later', !!settings.hideWatchLater);
    toggleAttr('hide_you_liked_videos', !!settings.hideLikedVideos);
}

function toggleAttr(name: string, on: boolean) {
    if (on) document.documentElement.setAttribute(name, 'true');
    else document.documentElement.removeAttribute(name);
}

function removeAttr(name: string) {
    document.documentElement.removeAttribute(name);
}

function isYouFeed(): boolean {
    return window.location.pathname.startsWith('/feed/you');
}

/**
 * Annotate sections with data-optube-section="<Label>" so CSS can target them.
 */
function annotateYouSections(root: ParentNode = document) {
    if (!isYouFeed()) return;
    root.querySelectorAll('ytd-rich-section-renderer:not([data-optube-section])').forEach(sec => {
        const label = extractSectionLabel(sec as HTMLElement);
        if (label && SECTION_LABELS.includes(label)) {
            sec.setAttribute('data-optube-section', label);
        }
    });
}

function extractSectionLabel(sec: HTMLElement): string | null {
    // Heuristic: look for common heading containers inside the section.
    // The heading might live inside #contents or #title-container; fall back to first yt-formatted-string.
    const headingEl = sec.querySelector<HTMLElement>(
        'h2, #title-container, #title, #header, yt-formatted-string#title-text, yt-formatted-string.style-scope'
    );
    if (headingEl) {
        const text = headingEl.textContent?.trim();
        if (text) {
            // Normalize typical capitalization mismatches
            const normalized = text.replace(/\s+/g, ' ').trim();
            // Attempt to map partial matches (e.g. "Your Videos" vs "Your videos")
            for (const lbl of SECTION_LABELS) {
                const lowerLbl = lbl.toLowerCase();
                if (normalized.toLowerCase().startsWith(lowerLbl)) return lbl; // prefix tolerant
            }
            return null;
        }
    }
    return null;
}

/**
 * Observe DOM mutations on the You feed page and annotate new sections.
 */
export function observeYouFeed() {
    const observer = new MutationObserver(muts => {
        if (!isYouFeed()) return; // Ignore when not on page; attributes cleaned elsewhere via applyYouFeedAttributes
        let needs = false;
        for (const m of muts) {
            for (const n of Array.from(m.addedNodes)) {
                if (n instanceof HTMLElement) {
                    if (n.tagName === 'YTD-RICH-SECTION-RENDERER' || n.querySelector?.('ytd-rich-section-renderer')) {
                        needs = true; break;
                    }
                }
            }
            if (needs) break;
        }
        if (needs) {
            // Batch annotate in next frame for performance
            requestAnimationFrame(() => annotateYouSections());
        }
    });
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
    // Initial pass
    annotateYouSections();
    return observer;
}

/** Inject CSS controlling visibility based on root attributes + per-section attributes. */
export function injectYouFeedCSS() {
    const id = 'optube-you-feed-css';
    document.getElementById(id)?.remove();
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
    /* Hide ALL You feed sections when master flag on */
    html[${ROOT_FLAG}][hide_you_section] ytd-rich-section-renderer { display: none !important; }

    /* Individual sections (only effective if master not hiding everything) */
    html[${ROOT_FLAG}]:not([hide_you_section])[hide_you_history] ytd-rich-section-renderer[data-optube-section="History"] { display: none !important; }
    html[${ROOT_FLAG}]:not([hide_you_section])[hide_you_playlists] ytd-rich-section-renderer[data-optube-section="Playlists"] { display: none !important; }
    html[${ROOT_FLAG}]:not([hide_you_section])[hide_you_your_videos] ytd-rich-section-renderer[data-optube-section="Your videos"] { display: none !important; }
    html[${ROOT_FLAG}]:not([hide_you_section])[hide_you_your_courses] ytd-rich-section-renderer[data-optube-section="Your courses"] { display: none !important; }
    html[${ROOT_FLAG}]:not([hide_you_section])[hide_you_watch_later] ytd-rich-section-renderer[data-optube-section="Watch later"] { display: none !important; }
    html[${ROOT_FLAG}]:not([hide_you_section])[hide_you_liked_videos] ytd-rich-section-renderer[data-optube-section="Liked videos"] { display: none !important; }
  `;
    document.head.appendChild(style);
}
