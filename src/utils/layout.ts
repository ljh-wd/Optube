// Utilities for Layout category actions (CSS injection)
// Duration badges, live badges, preview metadata (details / avatars), filter chips row

interface LayoutToggles {
    hideDurationBadges: boolean;
    hidePreviewDetails: boolean;
    hidePreviewAvatars: boolean;
    hideBadgesChips: boolean;
    hideWatchedProgress: boolean;
}

const STYLE_ID = 'optube-layout-css';

// Mutation observer to keep hiding duration badges on dynamically loaded content
let durationObserver: MutationObserver | null = null;
let durationObserverActive = false;
let durationDebounce: number | null = null;
// Watched progress: pure CSS (no removal) so layout stays stable.

function ensureDurationObserver(active: boolean) {
    if (active && !durationObserverActive) {
        durationObserver = new MutationObserver(() => {
            if (durationDebounce) window.clearTimeout(durationDebounce);
            durationDebounce = window.setTimeout(() => {
                if (document.documentElement.hasAttribute('hide_duration_badges')) hideDurationBadges();
            }, 100);
        });
        durationObserver.observe(document.body, { childList: true, subtree: true });
        durationObserverActive = true;
    } else if (!active && durationObserverActive && durationObserver) {
        durationObserver.disconnect();
        durationObserverActive = false;
    }
}

export function applyLayout(settings: Partial<LayoutToggles>) {
    // We set attributes for easier pure-CSS hiding where feasible
    const root = document.documentElement;
    toggleAttr(root, 'hide_duration_badges', settings.hideDurationBadges);
    toggleAttr(root, 'hide_preview_details', settings.hidePreviewDetails);
    toggleAttr(root, 'hide_preview_avatars', settings.hidePreviewAvatars);
    toggleAttr(root, 'hide_badges_chips', settings.hideBadgesChips);
    toggleAttr(root, 'hide_watched_progress', settings.hideWatchedProgress);

    // Manage duration badges (JS + observer)
    ensureDurationObserver(!!settings.hideDurationBadges);
    if (settings.hideDurationBadges) hideDurationBadges(); else showDurationBadges();

    // Watched progress handled by CSS opacity only (no JS needed)
}

function toggleAttr(el: HTMLElement, name: string, enabled?: boolean) {
    if (enabled) el.setAttribute(name, 'true'); else el.removeAttribute(name);
}

export function injectLayoutCSS() {
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (style) style.remove();
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
            /* live channel removal option removed */

    /* Duration badges (broad selectors) when attribute active */
    html[hide_duration_badges] ytd-thumbnail-overlay-time-status-renderer,
    html[hide_duration_badges] ytd-thumbnail-overlay-resume-playback-renderer,
    html[hide_duration_badges] yt-thumbnail-overlay-time-status-renderer,
    html[hide_duration_badges] .thumbnail-overlay-badge-shape:has(.badge-shape-wiz__text),
    html[hide_duration_badges] badge-shape.badge-shape-wiz--thumbnail-badge,
    html[hide_duration_badges] .ytThumbnailBottomOverlayViewModelBadgeContainer:has(.badge-shape-wiz__text) {
        display: none !important;
    }

  /* Video preview metadata blocks (feed card metadata container) */
  html[hide_preview_details] .yt-lockup-metadata-view-model-wiz__metadata, 
  html[hide_preview_details] .yt-lockup-metadata-view-model-wiz__text-container,
  html[hide_preview_details] .yt-lockup-metadata-view-model-wiz__menu-button,
  html[hide_preview_details] ytd-rich-grid-media #details,
  html[hide_preview_details] ytd-video-renderer #metadata { display: none !important; }

  /* Avatars inside preview cards */
  html[hide_preview_avatars] .yt-lockup-metadata-view-model-wiz__avatar,
  html[hide_preview_avatars] ytd-rich-grid-media #avatar-container,
  html[hide_preview_avatars] ytd-video-renderer #avatar-link { display: none !important; }

  /* Filter chips row */
  html[hide_badges_chips] #chips-wrapper, html[hide_badges_chips] ytd-feed-filter-chip-bar-renderer { display: none !important; }

    /* Watch page: expand recommended thumbnails to use freed space when details hidden */
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-video-renderer #dismissible,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-video-renderer #dismissible,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-radio-renderer #dismissible,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-playlist-renderer #dismissible {
        display: block !important;
    }
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-video-renderer #thumbnail,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-video-renderer #thumbnail,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-radio-renderer #thumbnail,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-playlist-renderer #thumbnail {
        width: 100% !important;
        margin-right: 0 !important;
    }
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-video-renderer #details,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-video-renderer #details,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-radio-renderer #details,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-playlist-renderer #details {
        display: none !important; /* reinforce */
    }
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-video-renderer,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-video-renderer,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-radio-renderer,
    html[hide_preview_details] ytd-watch-flexy #secondary ytd-compact-playlist-renderer {
        max-width: 100% !important;
    }

        /* Lockup (new renderer variant) support on watch page */
        html[hide_preview_details] ytd-watch-flexy #secondary yt-lockup-view-model .yt-lockup-view-model-wiz {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            flex: 0 0 auto !important;
        }
        html[hide_preview_details] ytd-watch-flexy #secondary yt-lockup-view-model .yt-lockup-view-model-wiz__content-image {
            width: 100% !important;
            margin-right: 0 !important;
            display: block !important;
        }
        html[hide_preview_details] ytd-watch-flexy #secondary yt-lockup-view-model .yt-lockup-metadata-view-model-wiz,
        html[hide_preview_details] ytd-watch-flexy #secondary yt-lockup-view-model .yt-lockup-view-model-wiz__metadata,
        html[hide_preview_details] ytd-watch-flexy #secondary yt-lockup-view-model .yt-lockup-metadata-view-model-wiz__avatar,
        html[hide_preview_details] ytd-watch-flexy #secondary yt-lockup-view-model .yt-lockup-metadata-view-model-wiz__text-container,
        html[hide_preview_details] ytd-watch-flexy #secondary yt-lockup-view-model .yt-lockup-metadata-view-model-wiz__menu-button {
            display: none !important;
        }

        /* Watched progress overlay: make transparent but preserve space */
        html[hide_watched_progress] yt-thumbnail-overlay-progress-bar-view-model,
        html[hide_watched_progress] yt-thumbnail-overlay-progress-bar-view-model * {
            opacity: 0 !important;
            visibility: hidden !important;
        }
        html[hide_watched_progress] yt-thumbnail-overlay-progress-bar-view-model { pointer-events: none !important; }
  `;
    document.head.appendChild(style);
}

export function observeLayout() {
    chrome.storage.sync.get(['hideDurationBadges', 'hidePreviewDetails', 'hidePreviewAvatars', 'hideBadgesChips', 'hideWatchedProgress'], applyLayout);
    chrome.storage.onChanged.addListener(ch => {
        if (ch.hideDurationBadges || ch.hidePreviewDetails || ch.hidePreviewAvatars || ch.hideBadgesChips || ch.hideWatchedProgress) {
            chrome.storage.sync.get(['hideDurationBadges', 'hidePreviewDetails', 'hidePreviewAvatars', 'hideBadgesChips', 'hideWatchedProgress'], applyLayout);
        }
    });
}

// JS helpers for duration & live badges (more precise than CSS alone)
function hideDurationBadges() {
    const candidates = document.querySelectorAll<HTMLElement>([
        'ytd-thumbnail-overlay-time-status-renderer',
        'yt-thumbnail-overlay-time-status-renderer',
        'ytd-thumbnail-overlay-resume-playback-renderer',
        'yt-thumbnail-overlay-badge-view-model',
        '.ytThumbnailBottomOverlayViewModelBadgeContainer',
        '.thumbnail-overlay-badge-shape',
        'badge-shape.badge-shape-wiz--thumbnail-badge'
    ].join(','));

    candidates.forEach(el => {
        // Determine text to test (either direct text or inner badge text div)
        const textEl = el.querySelector('.badge-shape-wiz__text') as HTMLElement | null;
        const text = (textEl?.textContent || el.textContent || '').trim();
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) {
            el.style.display = 'none';
        }
    });
}

function showDurationBadges() {
    const selector = [
        'ytd-thumbnail-overlay-time-status-renderer',
        'yt-thumbnail-overlay-time-status-renderer',
        'ytd-thumbnail-overlay-resume-playback-renderer',
        'yt-thumbnail-overlay-badge-view-model',
        '.ytThumbnailBottomOverlayViewModelBadgeContainer',
        '.thumbnail-overlay-badge-shape',
        'badge-shape.badge-shape-wiz--thumbnail-badge'
    ].join(',');
    document.querySelectorAll<HTMLElement>(selector).forEach(el => {
        const textEl = el.querySelector('.badge-shape-wiz__text') as HTMLElement | null;
        const text = (textEl?.textContent || el.textContent || '').trim();
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) {
            el.style.display = '';
        }
    });
}

// (Observer logic moved above; single applyLayout definition retained.)
