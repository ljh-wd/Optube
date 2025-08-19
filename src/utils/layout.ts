// Utilities for Layout category actions (CSS injection)
// Duration badges, live badges, preview metadata (details / avatars), filter chips row

interface LayoutToggles {
    hideDurationBadges: boolean;
    hideLiveChannels: boolean;
    hidePreviewDetails: boolean;
    hidePreviewAvatars: boolean;
    hideBadgesChips: boolean;
}

const STYLE_ID = 'optube-layout-css';

export function applyLayout(settings: Partial<LayoutToggles>) {
    // We set attributes for easier pure-CSS hiding where feasible
    const root = document.documentElement;
    toggleAttr(root, 'hide_duration_badges', settings.hideDurationBadges);
    toggleAttr(root, 'hide_live_channels', settings.hideLiveChannels);
    toggleAttr(root, 'hide_preview_details', settings.hidePreviewDetails);
    toggleAttr(root, 'hide_preview_avatars', settings.hidePreviewAvatars);
    toggleAttr(root, 'hide_badges_chips', settings.hideBadgesChips);

    if (settings.hideDurationBadges) hideDurationBadges(); else showDurationBadges();
    if (settings.hideLiveChannels) hideLiveVideos(); else showLiveVideos();
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
        /* Live videos: JS handles full card removal (see hideLiveVideos). We only hide avatar rings here for redundancy. */
        html[hide_live_channels] .yt-spec-avatar-shape__live-badge { display: none !important; }

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
  `;
    document.head.appendChild(style);
}

export function observeLayout() {
    chrome.storage.sync.get(['hideDurationBadges', 'hideLiveChannels', 'hidePreviewDetails', 'hidePreviewAvatars', 'hideBadgesChips'], applyLayout);
    chrome.storage.onChanged.addListener(ch => {
        if (ch.hideDurationBadges || ch.hideLiveChannels || ch.hidePreviewDetails || ch.hidePreviewAvatars || ch.hideBadgesChips) {
            chrome.storage.sync.get(['hideDurationBadges', 'hideLiveChannels', 'hidePreviewDetails', 'hidePreviewAvatars', 'hideBadgesChips'], applyLayout);
        }
    });
}

// JS helpers for duration & live badges (more precise than CSS alone)
function hideDurationBadges() {
    // Standard duration elements
    const selector = 'yt-thumbnail-overlay-badge-view-model, .ytThumbnailBottomOverlayViewModelBadgeContainer';
    document.querySelectorAll(selector).forEach(el => {
        const text = el.textContent?.trim() || '';
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) (el as HTMLElement).style.display = 'none';
    });
}

function showDurationBadges() {
    document.querySelectorAll('yt-thumbnail-overlay-badge-view-model, .ytThumbnailBottomOverlayViewModelBadgeContainer').forEach(el => {
        const text = el.textContent?.trim() || '';
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) (el as HTMLElement).style.display = '';
    });
}
// Hide/show entire live video cards
function hideLiveVideos() {
    document.querySelectorAll('ytd-rich-item-renderer').forEach(card => {
        const hasLiveBadge = !!card.querySelector('.badge-shape-wiz__text')?.textContent?.toUpperCase().includes('LIVE');
        if (hasLiveBadge) (card as HTMLElement).style.display = 'none';
    });
}
function showLiveVideos() {
    document.querySelectorAll('ytd-rich-item-renderer').forEach(card => {
        const hasLiveBadge = !!card.querySelector('.badge-shape-wiz__text')?.textContent?.toUpperCase().includes('LIVE');
        if (hasLiveBadge) (card as HTMLElement).style.display = '';
    });
}
