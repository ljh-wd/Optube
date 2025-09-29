// Utilities for Layout category actions (CSS injection)
// Duration badges, live badges, preview metadata (details / avatars), filter chips row

interface LayoutToggles {
    hideDurationBadges: boolean;
    hidePreviewDetails: boolean;
    hidePreviewAvatars: boolean;
    hideBadgesChips: boolean;
    hideWatchedProgress: boolean;
    hideHoverPreview: boolean;
    hideChannelSubscriberCount: boolean;
    hideLiveVideos: boolean;
    hideLiveChat: boolean;
    hideYoutubePlayables: boolean;
}

const STYLE_ID = 'optube-layout-css';

// Keeps duration badges hidden when new cards stream in (home/search/watch)
let durationObserver: MutationObserver | null = null;
let durationObserverActive = false;
let durationDebounce: number | null = null;
// Watched progress: pure CSS (no removal) so the layout stays stable.

// Additional hover delegation to catch elements rendered inside ShadyDOM / shadow roots during inline preview
let hoverDelegationAttached = false;
const hoverProgressObservers = new WeakMap<HTMLElement, MutationObserver>();
let previewBlockerAttached = false;
let playablesObserver: MutationObserver | null = null;

// Start/stop the duration observer based on the toggle state
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

// Tag Playables shelves so CSS can hide them reliably (locale‑agnostic except for the word root)
function tagPlayablesShelves() {
    // Only bother if the root attribute is set (avoid extra work when feature off)
    if (!document.documentElement.hasAttribute('hide_youtube_playables')) return;

    document.querySelectorAll<HTMLElement>('ytd-rich-section-renderer:not([data-optube-playables])').forEach(sec => {
        // Header title span inside rich shelf renderer
        const titleEl = sec.querySelector<HTMLElement>('ytd-rich-shelf-renderer #title');
        if (!titleEl) return;
        const title = titleEl.textContent?.trim() || '';
        // Match “Playables” (case-insensitive); adjust if YouTube localizes differently for you
        if (/playables/i.test(title)) {
            sec.setAttribute('data-optube-playables', '');
        }
    });
}

function ensurePlayablesObserver(active: boolean) {
    if (active) {
        if (playablesObserver) return;
        playablesObserver = new MutationObserver(muts => {
            let need = false;
            for (const m of muts) {
                if (m.addedNodes.length) { need = true; break; }
            }
            if (need) tagPlayablesShelves();
        });
        playablesObserver.observe(document.body, { childList: true, subtree: true });
        // Initial pass
        tagPlayablesShelves();
    } else if (playablesObserver) {
        playablesObserver.disconnect();
        playablesObserver = null;
    }
}

export function applyLayout(settings: Partial<LayoutToggles>) {
    const root = document.documentElement;
    toggleAttr(root, 'hide_duration_badges', settings.hideDurationBadges);
    toggleAttr(root, 'hide_preview_details', settings.hidePreviewDetails);
    toggleAttr(root, 'hide_preview_avatars', settings.hidePreviewAvatars);
    toggleAttr(root, 'hide_badges_chips', settings.hideBadgesChips);
    toggleAttr(root, 'hide_watched_progress', settings.hideWatchedProgress);
    toggleAttr(root, 'hide_hover_preview', settings.hideHoverPreview);
    toggleAttr(root, 'hide_channel_subscriber_count', settings.hideChannelSubscriberCount);
    toggleAttr(root, 'hide_live_videos', settings.hideLiveVideos);
    toggleAttr(root, 'hide_live_chat', settings.hideLiveChat);
    toggleAttr(root, 'hide_youtube_playables', settings.hideYoutubePlayables);

    ensureDurationObserver(!!settings.hideDurationBadges);
    if (settings.hideDurationBadges) hideDurationBadges(); else showDurationBadges();

    // Playables tagging & observer
    ensurePlayablesObserver(!!settings.hideYoutubePlayables);
    if (settings.hideYoutubePlayables) tagPlayablesShelves();
}

// TODO: Export this as a global util for the other util files
function toggleAttr(el: HTMLElement, name: string, enabled?: boolean) {
    if (enabled) el.setAttribute(name, 'true'); else el.removeAttribute(name);
}

export function injectLayoutCSS() {
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    // Replace previously injected style to keep rules up to date across navigations
    if (style) style.remove();
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
    /* Hide live chat panel when attribute active */
    html[hide_live_chat] #chat, /* classic */
    html[hide_live_chat] ytd-live-chat-frame,
    html[hide_live_chat] ytd-live-chat-renderer,
    html[hide_live_chat] #chat-messages,
    html[hide_live_chat] #chatframe,
    html[hide_live_chat] #chat-container,
    html[hide_live_chat] #live-chat-iframe,
    html[hide_live_chat] #secondary-inner ytd-live-chat-frame,
    html[hide_live_chat] #secondary-inner ytd-live-chat-renderer,
    html[hide_live_chat] #contents ytd-live-chat-renderer,
    html[hide_live_chat] #contents #chat,
    html[hide_live_chat] #contents #chat-messages,
    html[hide_live_chat] #contents #chatframe,
    html[hide_live_chat] #contents #chat-container,
    html[hide_live_chat] #contents #live-chat-iframe {
        display: none !important;
    }

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
  html[hide_preview_details] .yt-lockup-view-model__metadata, 
  html[hide_preview_details] .yt-lockup-metadata-view-model__text-container,
  html[hide_preview_details] .yt-lockup-metadata-view-model__menu-button,
  html[hide_preview_details] ytd-rich-grid-media #details,
  html[hide_preview_details] ytd-video-renderer #metadata { display: none !important; }
  
  html[hide_preview_details] .yt-lockup-view-model__content-image,
  html[hide_preview_details] ytd-rich-grid-media #thumbnail,
  html[hide_preview_details] ytd-video-renderer #thumbnail { width: 100% !important; margin-right: 0 !important; }

  html[hide_preview_details] .yt-lockup-view-model,
  html[hide_preview_details] ytd-rich-grid-media,
  html[hide_preview_details] ytd-video-renderer { max-width: 100% !important; }

  /* Avatars inside preview cards */
  html[hide_preview_avatars] .yt-lockup-metadata-view-model__avatar,
  html[hide_preview_avatars] ytd-rich-grid-media #avatar-container,
  html[hide_preview_avatars] ytd-video-renderer #avatar-link { display: none !important; }

  /* Filter chips row */
  html[hide_badges_chips] #chips-wrapper, html[hide_badges_chips] ytd-feed-filter-chip-bar-renderer { display: none !important; }
  html[hide_badges_chips] #frosted-glass { height: 65px !important; }
  
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
        /* Broaden watched progress hiding to legacy / class-based hosts & hover preview */
        html[hide_watched_progress] .ytThumbnailOverlayProgressBarHost,
        html[hide_watched_progress] .ytThumbnailOverlayProgressBarHost *,
        html[hide_watched_progress] .ytThumbnailOverlayProgressBarHostWatchedProgressBar,
        html[hide_watched_progress] .ytThumbnailOverlayProgressBarHostWatchedProgressBar * {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
        /* Generic substring match fallbacks */
        html[hide_watched_progress] ytd-rich-item-renderer [class*='ProgressBar'],
        html[hide_watched_progress] ytd-rich-grid-media [class*='ProgressBar'],
        html[hide_watched_progress] yt-lockup-view-model [class*='ProgressBar'],
        html[hide_watched_progress] ytd-video-renderer [class*='ProgressBar'] {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
        /* Ensure badge hides even when hover preview swaps overlay structure */
        html[hide_duration_badges] ytd-rich-item-renderer:hover .ytThumbnailBottomOverlayViewModelBadgeContainer,
        html[hide_duration_badges] ytd-rich-item-renderer:hover badge-shape.badge-shape-wiz--thumbnail-badge,
        html[hide_duration_badges] ytd-rich-item-renderer:hover .thumbnail-overlay-badge-shape,
        html[hide_duration_badges] ytd-rich-item-renderer:hover ytd-thumbnail-overlay-time-status-renderer,
        html[hide_duration_badges] ytd-rich-item-renderer:hover yt-thumbnail-overlay-time-status-renderer,
        html[hide_duration_badges] ytd-rich-item-renderer:hover yt-thumbnail-badge-view-model,
        html[hide_duration_badges] ytd-rich-item-renderer:hover .ytThumbnailBottomOverlayViewModelBadgeContainer:has(.badge-shape-wiz__text) {
            display: none !important;
        }
        /* Also guard against the container being re-inserted while progress bar present */
        html[hide_duration_badges] yt-thumbnail-bottom-overlay-view-model:has(.ytThumbnailOverlayProgressBarHost) .ytThumbnailBottomOverlayViewModelBadgeContainer { display: none !important; }

        /* Disable hover preview playback (prevent inline video from appearing) */
        html[hide_hover_preview] ytd-rich-item-renderer:hover video,
        html[hide_hover_preview] ytd-rich-grid-media:hover video,
        html[hide_hover_preview] yt-lockup-view-model:hover video {
            display: none !important;
        }
        /* Block preview container transitions */
        html[hide_hover_preview] ytd-rich-item-renderer:hover .ytd-rich-item-renderer,
        html[hide_hover_preview] ytd-rich-item-renderer:hover .yt-thumbnail-view-model__image img { filter: none !important; }
        /* Prevent any play button overlays */
        html[hide_hover_preview] ytd-rich-item-renderer [class*='inline-preview'],
        html[hide_hover_preview] ytd-rich-item-renderer [class*='InlinePreview'] { display: none !important; }

    /* Playables (games) – shelves tagged by JS */
    html[hide_youtube_playables] ytd-rich-section-renderer[data-optube-playables] {
        display: none !important;
    }

    /* Live videos – hide cards containing LIVE badges */
    html[hide_live_videos] ytd-rich-item-renderer:has(badge-shape.yt-badge-shape--thumbnail-live),
    html[hide_live_videos] ytd-rich-item-renderer:has(yt-live-badge-renderer),
    html[hide_live_videos] ytd-rich-grid-media:has(badge-shape.yt-badge-shape--thumbnail-live),
    html[hide_live_videos] yt-lockup-view-model:has(badge-shape.yt-badge-shape--thumbnail-live),
    html[hide_live_videos] ytd-video-renderer:has(badge-shape.yt-badge-shape--thumbnail-live),
    html[hide_live_videos] ytd-compact-video-renderer:has(badge-shape.yt-badge-shape--thumbnail-live),
    html[hide_live_videos] ytd-grid-video-renderer:has(badge-shape.yt-badge-shape--thumbnail-live),
    html[hide_live_videos] ytd-compact-video-renderer:has(yt-live-badge-renderer),
    html[hide_live_videos] ytd-video-renderer:has(yt-live-badge-renderer),
    html[hide_live_videos] ytd-rich-grid-media:has(yt-live-badge-renderer),
    html[hide_live_videos] ytd-rich-item-renderer:has(yt-thumbnail-overlay-live-badge-renderer),
    html[hide_live_videos] ytd-video-renderer:has(yt-thumbnail-overlay-live-badge-renderer),
    html[hide_live_videos] ytd-compact-video-renderer:has(yt-thumbnail-overlay-live-badge-renderer) {
        display: none !important;
    }
  `;
    document.head.appendChild(style);
}

export function observeLayout() {
    chrome.storage.sync.get([
        'hideDurationBadges',
        'hidePreviewDetails',
        'hidePreviewAvatars',
        'hideBadgesChips',
        'hideWatchedProgress',
        'hideHoverPreview',
        'hideLiveVideos',
        'hideChannelSubscriberCount',
        'hideYoutubePlayables'
    ], applyLayout);

    chrome.storage.onChanged.addListener(ch => {
        if (ch.hideDurationBadges || ch.hidePreviewDetails || ch.hidePreviewAvatars ||
            ch.hideBadgesChips || ch.hideWatchedProgress || ch.hideHoverPreview ||
            ch.hideLiveVideos ||
            ch.hideChannelSubscriberCount || ch.hideYoutubePlayables) {

            chrome.storage.sync.get([
                'hideDurationBadges',
                'hidePreviewDetails',
                'hidePreviewAvatars',
                'hideBadgesChips',
                'hideWatchedProgress',
                'hideHoverPreview',
                'hideLiveVideos',
                'hideChannelSubscriberCount',
                'hideYoutubePlayables'
            ], applyLayout);
        }
    });

    attachHoverDelegation();
    attachPreviewBlocker();
}

// JS helpers for duration and live badges (more precise than CSS alone)
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

// Re-hide on hover for dynamically reparented / regenerated nodes
function attachHoverDelegation() {
    if (hoverDelegationAttached) return;
    document.addEventListener('mouseenter', evt => {
        const root = document.documentElement;
        if (!root.hasAttribute('hide_duration_badges') && !root.hasAttribute('hide_watched_progress')) return;
        const target = (evt.target as HTMLElement)?.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model');
        if (!target) return;
        if (root.hasAttribute('hide_duration_badges')) hideDurationBadgesWithin(target as HTMLElement);
        if (root.hasAttribute('hide_watched_progress')) {
            hideWatchedProgressWithin(target as HTMLElement);
            ensureProgressObserver(target as HTMLElement);
        }
    }, true); // capture so we run early
    document.addEventListener('mouseleave', evt => {
        const target = (evt.target as HTMLElement)?.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model');
        if (!target) return;
        const obs = hoverProgressObservers.get(target as HTMLElement);
        if (obs) {
            obs.disconnect();
            hoverProgressObservers.delete(target as HTMLElement);
        }
    }, true);
    hoverDelegationAttached = true;
}

function attachPreviewBlocker() {
    if (previewBlockerAttached) return;
    // Cancel events that often trigger preview initialization
    const cancelEvents = ['mouseover', 'mouseenter', 'mousemove'];
    cancelEvents.forEach(ev => {
        document.addEventListener(ev, e => {
            const root = document.documentElement;
            if (!root.hasAttribute('hide_hover_preview')) return;
            const card = (e.target as HTMLElement)?.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model');
            if (!card) return;
            // Stop propagation so YouTube's preview logic doesn't run
            e.stopImmediatePropagation();
        }, true);
    });
    // Also, remove any video elements inserted inside hovered cards quickly
    const mo = new MutationObserver(mutations => {
        if (!document.documentElement.hasAttribute('hide_hover_preview')) return;
        for (const m of mutations) {
            m.addedNodes.forEach(node => {
                if (node instanceof HTMLElement) {
                    if (node.tagName === 'VIDEO' && node.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model')) {
                        node.remove();
                    } else {
                        node.querySelectorAll?.('video').forEach(v => {
                            if (v.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model')) v.remove();
                        });
                    }
                }
            });
        }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    previewBlockerAttached = true;
}

function hideDurationBadgesWithin(scope: HTMLElement) {
    const nodes = scope.querySelectorAll<HTMLElement>([
        'ytd-thumbnail-overlay-time-status-renderer',
        'yt-thumbnail-overlay-time-status-renderer',
        'ytd-thumbnail-overlay-resume-playback-renderer',
        'yt-thumbnail-overlay-badge-view-model',
        '.ytThumbnailBottomOverlayViewModelBadgeContainer',
        '.thumbnail-overlay-badge-shape',
        'badge-shape.badge-shape-wiz--thumbnail-badge'
    ].join(','));
    nodes.forEach(el => {
        const textEl = el.querySelector('.badge-shape-wiz__text') as HTMLElement | null;
        const text = (textEl?.textContent || el.textContent || '').trim();
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) {
            el.style.display = 'none';
        }
    });
}

function hideWatchedProgressWithin(scope: HTMLElement) {
    const nodes = scope.querySelectorAll<HTMLElement>([
        'yt-thumbnail-overlay-progress-bar-view-model',
        '.ytThumbnailOverlayProgressBarHost',
        '.ytThumbnailOverlayProgressBarHostWatchedProgressBar'
    ].join(','));
    nodes.forEach(el => {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
    });
}

function ensureProgressObserver(card: HTMLElement) {
    if (hoverProgressObservers.has(card)) return;
    const obs = new MutationObserver(mutations => {
        let added = false;
        for (const m of mutations) {
            if (m.addedNodes && m.addedNodes.length) {
                added = true;
                break;
            }
        }
        if (added) hideWatchedProgressWithin(card);
    });
    obs.observe(card, { childList: true, subtree: true });
    hoverProgressObservers.set(card, obs);
    // Auto-clean after 6 seconds to avoid lingering observers
    setTimeout(() => {
        const existing = hoverProgressObservers.get(card);
        if (existing === obs) {
            existing.disconnect();
            hoverProgressObservers.delete(card);
        }
    }, 6000);
}
