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
    setCommentUploadTimeVisibility, injectCommentTimeCSS,
    setCommentRepliesVisibility, injectCommentRepliesCSS
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
    const isExtensionEnabled = settings.extensionEnabled !== false;
    const flag = (value?: boolean) => Boolean(isExtensionEnabled && value);

    setShortsVisibility(flag(settings.hideShorts));
    setHomeVisibility(flag(settings.hideHome));
    setSubscriptionsVisibility(flag(settings.hideSubscriptions));
    setSubscriptionsSidebarVisibility(flag(settings.hideSubscriptionsSidebar));
    setChannelSubscriberCount(flag(settings.hideChannelSubscriberCount));
    setMastheadVisibility(flag(settings.hideMasthead));
    setMastheadAvatarVisibility(flag(settings.hideAvatar));
    setMastheadAvatarVisibility(flag(settings.hideAvatar));
    setSearchbarVisibility(flag(settings.hideSearchbar));
    setNotificationsVisibility(flag(settings.hideNotifications));
    setCreateButtonVisibility(flag(settings.hideCreateButton));
    setCommentsVisibility(flag(settings.hideComments));
    setCommentAvatarsVisibility(flag(settings.hideCommentAvatars));
    setCommentUploadTimeVisibility(flag(settings.hideCommentUploadTime));
    setCommentRepliesVisibility(flag(settings.hideCommentReplies));
    setAiSummaryVisibility(flag(settings.hideAiSummary));
    setFoldVisibility(flag(settings.hideFold));
    setCategoryAndTopicVisibility(flag(settings.hideCategoryAndTopic));
    setRecommendedVisibility(flag(settings.hideRecommended));
    setPostsVisibility(flag(settings.hidePosts));
    setSidebarVisibility(flag(settings.hideSidebar));
    setDescriptionVisibility(flag(settings.hideDescription));
    setTitleVisibility(flag(settings.hideTitle));
    setCreatorVisibility(flag(settings.hideCreator));
    applyActions({
        hideActions: flag(settings.hideActions),
        hideActionLikeDislike: flag(settings.hideActionLikeDislike),
        hideActionShare: flag(settings.hideActionShare),
        hideActionSave: flag(settings.hideActionSave),
        hideActionEllipsis: flag(settings.hideActionEllipsis),
        hideActionJoin: flag(settings.hideActionJoin),
        hideActionSubscribe: flag(settings.hideActionSubscribe),
        hideActionClip: flag(settings.hideActionClip),
    });
    setVideoFilterChipsVisibility(flag(settings.hideVideoFilterChips));
    applyLayout({
        hideDurationBadges: flag(settings.hideDurationBadges),
        hidePreviewDetails: flag(settings.hidePreviewDetails),
        hidePreviewAvatars: flag(settings.hidePreviewAvatars),
        hideBadgesChips: flag(settings.hideBadgesChips),
        hideWatchedProgress: flag(settings.hideWatchedProgress),
        hideHoverPreview: flag(settings.hideHoverPreview),
        hideLiveVideos: flag(settings.hideLiveVideos),
        hideLiveChat: flag(settings.hideLiveChat),
        hideYoutubePlayables: flag(settings.hideYoutubePlayables),
    });
    applyCinema({ cinematicMode: flag(settings.cinematicMode), cinemaPreviewMuted: flag(settings.cinemaPreviewMuted) });
    applyNavigation({
        hideExplore: flag(settings.hideExplore),
        hideExploreMusic: flag(settings.hideExploreMusic),
        hideExploreMovies: flag(settings.hideExploreMovies),
        hideExploreLive: flag(settings.hideExploreLive),
        hideExploreGaming: flag(settings.hideExploreGaming),
        hideExploreNews: flag(settings.hideExploreNews),
        hideExploreSport: flag(settings.hideExploreSport),
        hideExploreLearning: flag(settings.hideExploreLearning),
        hideExploreFashion: flag(settings.hideExploreFashion),
        hideExplorePodcasts: flag(settings.hideExplorePodcasts),
        hideExplorePlayables: flag(settings.hideExplorePlayables),
        hideMoreFromYouTube: flag(settings.hideMoreFromYouTube),
        hideYouSection: flag(settings.hideYouSection),
        hideYouFeed: flag(settings.hideYouFeed),
        hideHistory: flag(settings.hideHistory),
        hidePlaylists: flag(settings.hidePlaylists),
        hideYourVideos: flag(settings.hideYourVideos),
        hideYourCourses: flag(settings.hideYourCourses),
        hideWatchLater: flag(settings.hideWatchLater),
        hideLikedVideos: flag(settings.hideLikedVideos),
    });


    applyYouFeedAttributes({
        hideYouSection: flag(settings.hideYouFeed),
        hideHistory: flag(settings.hideHistory),
        hidePlaylists: flag(settings.hidePlaylists),
        hideYourVideos: flag(settings.hideYourVideos),
        hideYourCourses: flag(settings.hideYourCourses),
        hideWatchLater: flag(settings.hideWatchLater),
        hideLikedVideos: flag(settings.hideLikedVideos),
    });
}

function run(): void {
    chrome.storage.sync.get([
        'extensionEnabled', 'hideShorts', 'hideHome', 'hideYouFeed', 'cinematicMode', 'cinemaPreviewMuted', 'hideSubscriptions', 'hideSubscriptionsSidebar', 'hideMasthead', 'hideSearchbar', 'hideNotifications', 'hideCreateButton', 'hideFold', 'hideComments', 'hideCommentAvatars', 'hideCategoryAndTopic', 'hideRecommended', 'hidePosts', 'hideSidebar', 'hideDescription', 'hideTitle', 'hideCreator',
        'hideDurationBadges', 'hidePreviewDetails', 'hidePreviewAvatars', 'hideBadgesChips',
        'hideWatchedProgress', 'hideHoverPreview',
        'hideLiveVideos', 'hideLiveChat',
        "hideAiSummary",
        'hideExplore', 'hideExploreMovies', 'hideExploreMusic', 'hideExploreLive', 'hideExploreGaming', 'hideExploreNews', 'hideExploreSport', 'hideExploreLearning', 'hideExploreFashion', 'hideExplorePodcasts', 'hideExplorePlayables', 'hideMoreFromYouTube', 'hideYouSection', 'hideYouFeed', 'hideHistory', 'hidePlaylists', 'hideYourVideos', 'hideYourCourses', 'hideWatchLater', 'hideLikedVideos', 'hideChannelSubscriberCount', 'hideAvatar',
        'hideYoutubePlayables',
        'hideActions', 'hideActionLikeDislike', 'hideActionShare', 'hideActionSave', 'hideActionEllipsis', 'hideActionJoin', 'hideActionSubscribe', 'hideActionClip'
        , 'hideVideoFilterChips', 'hideCommentUploadTime', 'hideCommentReplies'
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
injectCommentRepliesCSS();
injectPostsCSS();
injectYouFeedCSS();
injectCinemaCSS();
injectActionsCSS();
injectVideoChipsCSS();

chrome.storage.onChanged.addListener((changes, area) => {
    if (
        area === 'sync' &&
        (
            changes.extensionEnabled || changes.hideShorts || changes.hideHome || changes.hideSubscriptions || changes.hideChannelSubscriberCount || changes.hideSubscriptionsSidebar || changes.hideMasthead || changes.hideSearchbar || changes.hideNotifications || changes.hideCreateButton || changes.hideFold || changes.hideComments || changes.hideCommentAvatars || changes.hideCommentUploadTime || changes.hideCommentReplies || changes.hideCategoryAndTopic || changes.hideRecommended || changes.hidePosts || changes.hideSidebar || changes.hideDescription || changes.hideTitle || changes.hideCreator ||
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

