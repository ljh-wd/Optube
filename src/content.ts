import {
    observeMasthead,
    setMastheadVisibility,
    observeSearchbar,
    setSearchbarVisibility,
    observeNotifications,
    setNotificationsVisibility,
    observeCreateButton,
    injectCreateButtonCSS,
    setCreateButtonVisibility,
    setMastheadAvatarVisibility
} from './utils/topBar';
import {
    observeCategoryAndTopic,
    observeComments,
    observeFold,
    observeRecommended,
    observeDescription,
    observeTitle,
    observeCreator,
    setCategoryAndTopicVisibility,
    setCommentsVisibility,
    setFoldVisibility,
    setRecommendedVisibility,
    setDescriptionVisibility,
    setTitleVisibility,
    setCreatorVisibility,
    observeCommentAvatars,
    setCommentAvatarsVisibility,
    setAiSummaryVisibility,
    injectCommentAvatarCSS,
    observeAiSummary, injectVideoPlayerCSS,
    applyActions, observeActions, injectActionsCSS,
    setVideoFilterChipsVisibility, injectVideoChipsCSS,
    setCommentUploadTimeVisibility, injectCommentTimeCSS
} from './utils/video';
import { observeSidebar, setSidebarVisibility } from './utils/sidebar';
import type { Settings } from './types/global';
import { observeShorts, setShortsVisibility, injectShortsCSS } from './utils/shorts.ts';
import { observeHome, setHomeVisibility, injectHomeCSS } from './utils/home';
import {
    observeSubscriptions,
    observeSubscriptionsSidebar,
    setSubscriptionsVisibility,
    setSubscriptionsSidebarVisibility,
    injectSubscriptionsCSS,
    setChannelSubscriberCount
} from './utils/subscriptions';
import { applyLayout, injectLayoutCSS, observeLayout } from './utils/layout';
import { applyNavigation, observeNavigation } from './utils/navigation';
import { setPostsVisibility, observePosts, injectPostsCSS } from './utils/posts.ts';
import { applyYouFeedAttributes, observeYouFeed, injectYouFeedCSS } from './utils/you';
import { applyCinema, injectCinemaCSS, observeCinema } from './utils/cinema';

function cleanYouTube(settings: Settings): void {
    setShortsVisibility(!!settings.hideShorts);
    setHomeVisibility(!!settings.hideHome);
    setSubscriptionsVisibility(!!settings.hideSubscriptions);
    setSubscriptionsSidebarVisibility(!!settings.hideSubscriptionsSidebar);
    setChannelSubscriberCount(!!settings.hideChannelSubscriberCount);
    setMastheadVisibility(!!settings.hideMasthead);
    setMastheadAvatarVisibility(!!settings.hideAvatar);
    setMastheadAvatarVisibility(!!settings.hideAvatar);
    setSearchbarVisibility(!!settings.hideSearchbar);
    setNotificationsVisibility(!!settings.hideNotifications);
    setCreateButtonVisibility(!!settings.hideCreateButton);
    setCommentsVisibility(!!settings.hideComments);
    setCommentAvatarsVisibility(!!settings.hideCommentAvatars);
    setCommentUploadTimeVisibility(!!settings.hideCommentUploadTime);
    setAiSummaryVisibility(!!settings.hideAiSummary);
    setFoldVisibility(!!settings.hideFold);
    setCategoryAndTopicVisibility(!!settings.hideCategoryAndTopic);
    setRecommendedVisibility(!!settings.hideRecommended);
    setPostsVisibility(!!settings.hidePosts);
    setSidebarVisibility(!!settings.hideSidebar);
    setDescriptionVisibility(!!settings.hideDescription);
    setTitleVisibility(!!settings.hideTitle);
    setCreatorVisibility(!!settings.hideCreator);
    applyActions({
        hideActions: settings.hideActions,
        hideActionLikeDislike: settings.hideActionLikeDislike,
        hideActionShare: settings.hideActionShare,
        hideActionSave: settings.hideActionSave,
        hideActionEllipsis: settings.hideActionEllipsis,
        hideActionJoin: settings.hideActionJoin,
        hideActionSubscribe: settings.hideActionSubscribe,
        hideActionClip: settings.hideActionClip,
    });
    setVideoFilterChipsVisibility(!!settings.hideVideoFilterChips);
    applyLayout({
        hideDurationBadges: settings.hideDurationBadges,
        hidePreviewDetails: settings.hidePreviewDetails,
        hidePreviewAvatars: settings.hidePreviewAvatars,
        hideBadgesChips: settings.hideBadgesChips,
        hideWatchedProgress: settings.hideWatchedProgress,
        hideHoverPreview: settings.hideHoverPreview,
        hideLiveVideos: settings.hideLiveVideos,
        hideLiveChat: settings.hideLiveChat,
        hideYoutubePlayables: settings.hideYoutubePlayables,
    });
    applyCinema({ cinematicMode: settings.cinematicMode, cinemaPreviewMuted: settings.cinemaPreviewMuted });
    applyNavigation({
        hideExplore: settings.hideExplore,
        hideExploreMusic: settings.hideExploreMusic,
        hideExploreMovies: settings.hideExploreMovies,
        hideExploreLive: settings.hideExploreLive,
        hideExploreGaming: settings.hideExploreGaming,
        hideExploreNews: settings.hideExploreNews,
        hideExploreSport: settings.hideExploreSport,
        hideExploreLearning: settings.hideExploreLearning,
        hideExploreFashion: settings.hideExploreFashion,
        hideExplorePodcasts: settings.hideExplorePodcasts,
        hideExplorePlayables: settings.hideExplorePlayables,
        hideMoreFromYouTube: settings.hideMoreFromYouTube,
        hideYouSection: settings.hideYouSection,
        hideYouFeed: settings.hideYouFeed,
        hideHistory: settings.hideHistory,
        hidePlaylists: settings.hidePlaylists,
        hideYourVideos: settings.hideYourVideos,
        hideYourCourses: settings.hideYourCourses,
        hideWatchLater: settings.hideWatchLater,
        hideLikedVideos: settings.hideLikedVideos,
    });


    applyYouFeedAttributes({
        hideYouSection: settings.hideYouFeed,
        hideHistory: settings.hideHistory,
        hidePlaylists: settings.hidePlaylists,
        hideYourVideos: settings.hideYourVideos,
        hideYourCourses: settings.hideYourCourses,
        hideWatchLater: settings.hideWatchLater,
        hideLikedVideos: settings.hideLikedVideos,
    });
}

function run(): void {
    chrome.storage.sync.get([
        'hideShorts', 'hideHome', 'hideYouFeed', 'cinematicMode', 'cinemaPreviewMuted', 'hideSubscriptions', 'hideSubscriptionsSidebar', 'hideMasthead', 'hideSearchbar', 'hideNotifications', 'hideCreateButton', 'hideFold', 'hideComments', 'hideCommentAvatars', 'hideCategoryAndTopic', 'hideRecommended', 'hidePosts', 'hideSidebar', 'hideDescription', 'hideTitle', 'hideCreator',
        'hideDurationBadges', 'hidePreviewDetails', 'hidePreviewAvatars', 'hideBadgesChips',
        'hideWatchedProgress', 'hideHoverPreview',
        'hideLiveVideos', 'hideLiveChat',
        "hideAiSummary",
        'hideExplore', 'hideExploreMovies', 'hideExploreMusic', 'hideExploreLive', 'hideExploreGaming', 'hideExploreNews', 'hideExploreSport', 'hideExploreLearning', 'hideExploreFashion', 'hideExplorePodcasts', 'hideExplorePlayables', 'hideMoreFromYouTube', 'hideYouSection', 'hideYouFeed', 'hideHistory', 'hidePlaylists', 'hideYourVideos', 'hideYourCourses', 'hideWatchLater', 'hideLikedVideos', 'hideChannelSubscriberCount', 'hideAvatar',
        'hideYoutubePlayables',
        'hideActions', 'hideActionLikeDislike', 'hideActionShare', 'hideActionSave', 'hideActionEllipsis', 'hideActionJoin', 'hideActionSubscribe', 'hideActionClip'
        , 'hideVideoFilterChips', 'hideCommentUploadTime'
    ], cleanYouTube);
}

let debounceId: number | null = null;
const observer = new MutationObserver(() => {
    if (debounceId) clearTimeout(debounceId);
    debounceId = window.setTimeout(() => {
        run();
    }, 0);
});

function startObserver(): void {
    if (!document.body) {
        setTimeout(() => startObserver(), 10);
        return;
    }
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

window.addEventListener('load', run);
run();
startObserver();
injectShortsCSS();
injectHomeCSS();
injectVideoPlayerCSS()
injectSubscriptionsCSS();
injectCreateButtonCSS();
injectCommentAvatarCSS();
injectCommentTimeCSS();
injectPostsCSS();
injectYouFeedCSS();
injectCinemaCSS();
injectActionsCSS();
injectVideoChipsCSS();

chrome.storage.onChanged.addListener((changes, area) => {
    if (
        area === 'sync' &&
        (
            changes.hideShorts || changes.hideHome || changes.hideSubscriptions || changes.hideChannelSubscriberCount || changes.hideSubscriptionsSidebar || changes.hideMasthead || changes.hideSearchbar || changes.hideNotifications || changes.hideCreateButton || changes.hideFold || changes.hideComments || changes.hideCommentAvatars || changes.hideCommentUploadTime || changes.hideCategoryAndTopic || changes.hideRecommended || changes.hidePosts || changes.hideSidebar || changes.hideDescription || changes.hideTitle || changes.hideCreator ||
            changes.hideDurationBadges || changes.hidePreviewDetails || changes.hidePreviewAvatars || changes.hideBadgesChips || changes.hideWatchedProgress ||
            changes.hideHoverPreview || changes.hideAiSummary ||
            changes.hideLiveVideos || changes.hideLiveChat ||
            changes.hideActions || changes.hideActionLikeDislike || changes.hideActionShare || changes.hideActionSave || changes.hideActionEllipsis || changes.hideActionJoin || changes.hideActionSubscribe || changes.hideActionClip || changes.hideVideoFilterChips ||
            changes.hideExplore || changes.hideExploreMovies || changes.hideExploreLive || changes.hideExploreGaming || changes.hideExploreNews || changes.hideExploreSport || changes.hideExploreLearning || changes.hideExploreFashion || changes.hideExplorePodcasts || changes.hideExplorePlayables || changes.moreFromYouTube || changes.hideYouSection || changes.hideYouFeed || changes.hideHistory || changes.hidePlaylists || changes.hideYourVideos || changes.hideYourCourses || changes.hideWatchLater || changes.hideLikedVideos || changes.cinematicMode || changes.cinemaPreviewMuted || changes.hideAvatar ||
            changes.hideYoutubePlayables
        )
    ) {
        setTimeout(() => {
            run();
        }, 0);
    }
});

observeShorts();
observeHome();
observeSubscriptions();
observeSubscriptionsSidebar();
observeMasthead();
observeSearchbar();
observeNotifications();
observeCreateButton();
observeFold();
observeComments();
observeCommentAvatars();
observeAiSummary();
observeCategoryAndTopic();
observeRecommended();
observeSidebar();
observeDescription();
observeTitle();
observeCreator();
observeLayout();
observeNavigation();
observePosts();
observeYouFeed();
observeCinema();
observeActions();

injectLayoutCSS();

