export interface Settings {
    hideShorts: boolean;
    hideFold: boolean;
    hideComments: boolean;
    hideCommentAvatars: boolean; // new sub option under Comments
    hideCategoryAndTopic: boolean;
    hideRecommended: boolean;
    hidePosts: boolean; // new posts (community) feed items
    hideMasthead: boolean;
    hideSidebar: boolean;
    hideHome: boolean;
    hideSubscriptions: boolean;
    hideSubscriptionsSidebar: boolean;
    hideSearchbar: boolean;
    hideNotifications: boolean;
    hideCreateButton: boolean; // new create button in top bar
    hideDescription: boolean;
    hideTitle: boolean;
    hideCreator: boolean;
    // Layout category
    hideDurationBadges: boolean;
    hidePreviewDetails: boolean; // video preview metadata (feed cards)
    hidePreviewAvatars: boolean;
    hideBadgesChips: boolean; // filter chips row
    hideWatchedProgress: boolean; // watched progress bar overlay
    // Navigation additions
    hideExplore: boolean;
    hideMoreFromYouTube: boolean;
    hideYouSection: boolean;
    hidePlaylists: boolean;
    hideYourVideos: boolean;
    hideYourCourses: boolean;
    hideWatchLater: boolean;
    hideLikedVideos: boolean;
    hideHistory: boolean; // newly added for You section sub item
}
