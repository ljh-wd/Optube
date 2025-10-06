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

let durationObserver: MutationObserver | null = null;
let durationObserverActive = false;
let durationDebounce: number | null = null;
let hoverDelegationAttached = false;
const hoverProgressObservers = new WeakMap<HTMLElement, MutationObserver>();
let previewBlockerAttached = false;
let playablesObserver: MutationObserver | null = null;

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

function tagPlayablesShelves() {
    if (!document.documentElement.hasAttribute('hide_youtube_playables')) return;

    document.querySelectorAll<HTMLElement>('ytd-rich-section-renderer:not([data-optube-playables])').forEach(sec => {
        const titleEl = sec.querySelector<HTMLElement>('ytd-rich-shelf-renderer #title');
        if (!titleEl) return;
        const title = titleEl.textContent?.trim() || '';
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

    ensurePlayablesObserver(!!settings.hideYoutubePlayables);
    if (settings.hideYoutubePlayables) tagPlayablesShelves();
}

// TODO: Export this as a global util for the other util files
function toggleAttr(el: HTMLElement, name: string, enabled?: boolean) {
    if (enabled) el.setAttribute(name, 'true'); else el.removeAttribute(name);
}

export function injectLayoutCSS() {
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
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

  
  html[hide_preview_avatars] .yt-lockup-metadata-view-model__avatar,
  html[hide_preview_avatars] ytd-rich-grid-media #avatar-container,
  html[hide_preview_avatars] ytd-video-renderer #avatar-link { display: none !important; }

  
  html[hide_badges_chips] #chips-wrapper, html[hide_badges_chips] ytd-feed-filter-chip-bar-renderer { display: none !important; }
  html[hide_badges_chips] #frosted-glass { height: 65px !important; }
  
    
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

        
        html[hide_watched_progress] yt-thumbnail-overlay-progress-bar-view-model,
        html[hide_watched_progress] yt-thumbnail-overlay-progress-bar-view-model * {
            opacity: 0 !important;
            visibility: hidden !important;
        }
        html[hide_watched_progress] yt-thumbnail-overlay-progress-bar-view-model { pointer-events: none !important; }
        
        html[hide_watched_progress] .ytThumbnailOverlayProgressBarHost,
        html[hide_watched_progress] .ytThumbnailOverlayProgressBarHost *,
        html[hide_watched_progress] .ytThumbnailOverlayProgressBarHostWatchedProgressBar,
        html[hide_watched_progress] .ytThumbnailOverlayProgressBarHostWatchedProgressBar * {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
        
        html[hide_watched_progress] ytd-rich-item-renderer [class*='ProgressBar'],
        html[hide_watched_progress] ytd-rich-grid-media [class*='ProgressBar'],
        html[hide_watched_progress] yt-lockup-view-model [class*='ProgressBar'],
        html[hide_watched_progress] ytd-video-renderer [class*='ProgressBar'] {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
        
        html[hide_duration_badges] ytd-rich-item-renderer:hover .ytThumbnailBottomOverlayViewModelBadgeContainer,
        html[hide_duration_badges] ytd-rich-item-renderer:hover badge-shape.badge-shape-wiz--thumbnail-badge,
        html[hide_duration_badges] ytd-rich-item-renderer:hover .thumbnail-overlay-badge-shape,
        html[hide_duration_badges] ytd-rich-item-renderer:hover ytd-thumbnail-overlay-time-status-renderer,
        html[hide_duration_badges] ytd-rich-item-renderer:hover yt-thumbnail-overlay-time-status-renderer,
        html[hide_duration_badges] ytd-rich-item-renderer:hover yt-thumbnail-badge-view-model,
        html[hide_duration_badges] ytd-rich-item-renderer:hover .ytThumbnailBottomOverlayViewModelBadgeContainer:has(.badge-shape-wiz__text) {
            display: none !important;
        }
        
        html[hide_duration_badges] yt-thumbnail-bottom-overlay-view-model:has(.ytThumbnailOverlayProgressBarHost) .ytThumbnailBottomOverlayViewModelBadgeContainer { display: none !important; }

        
        html[hide_hover_preview] ytd-rich-item-renderer:hover video,
        html[hide_hover_preview] ytd-rich-grid-media:hover video,
        html[hide_hover_preview] yt-lockup-view-model:hover video {
            display: none !important;
        }
        
        html[hide_hover_preview] ytd-rich-item-renderer:hover .ytd-rich-item-renderer,
        html[hide_hover_preview] ytd-rich-item-renderer:hover .yt-thumbnail-view-model__image img { filter: none !important; }
        
        html[hide_hover_preview] ytd-rich-item-renderer [class*='inline-preview'],
        html[hide_hover_preview] ytd-rich-item-renderer [class*='InlinePreview'] { display: none !important; }

    
    html[hide_youtube_playables] ytd-rich-section-renderer[data-optube-playables] {
        display: none !important;
    }

    
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
    }, true);
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
    const cancelEvents = ['mouseover', 'mouseenter', 'mousemove'];
    cancelEvents.forEach(ev => {
        document.addEventListener(ev, e => {
            const root = document.documentElement;
            if (!root.hasAttribute('hide_hover_preview')) return;
            const card = (e.target as HTMLElement)?.closest('ytd-rich-item-renderer, ytd-rich-grid-media, yt-lockup-view-model');
            if (!card) return;
            e.stopImmediatePropagation();
        }, true);
    });
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
    setTimeout(() => {
        const existing = hoverProgressObservers.get(card);
        if (existing === obs) {
            existing.disconnect();
            hoverProgressObservers.delete(card);
        }
    }, 6000);
}
