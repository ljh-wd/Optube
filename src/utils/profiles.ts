import type { ProfileKey, Settings } from "../types/global";

export type ProfileDefinition = {
    key: ProfileKey;
    label: string;
    description: string;
    overrides: Partial<Settings>;
};

export const PROFILE_DEFINITIONS: ProfileDefinition[] = [
    {
        key: 'cinema',
        label: 'Cinema',
        description: 'Immersive hero layout with spotlight carousel and horizontal feed.',
        overrides: {
            cinematicMode: true,
            hideHoverPreview: true,
            hideBadgesChips: true,
            hideVideoFilterChips: true,
            hidePreviewDetails: true,
            hidePreviewAvatars: true,
            hideWatchedProgress: true,
        },
    },
    {
        key: 'focus',
        label: 'Focus',
        description: 'Hide Shorts, comments, and noisy surfaces to keep recommendations minimal.',
        overrides: {
            hideShorts: true,
            hideRecommended: true,
            hidePosts: true,
            hideAiSummary: true,
            hideComments: true,
            hideCommentAvatars: true,
            hideCommentUploadTime: true,
            hideCommentReplies: true,
            hideBadgesChips: true,
            hideVideoFilterChips: true,
            hideLiveVideos: true,
            hideLiveChat: true,
        },
    },
    {
        key: 'minimal',
        label: 'Minimal',
        description: 'Strip navigation chrome for a clean watch surface.',
        overrides: {
            hideMasthead: true,
            hideSearchbar: true,
            hideNotifications: true,
            hideCreateButton: true,
            hideAvatar: true,
            hideSidebar: true,
            hideExplore: true,
            hideExploreMusic: true,
            hideExploreMovies: true,
            hideExploreLive: true,
            hideExploreGaming: true,
            hideExploreNews: true,
            hideExploreSport: true,
            hideExploreLearning: true,
            hideExploreFashion: true,
            hideExplorePodcasts: true,
            hideExplorePlayables: true,
            hideMoreFromYouTube: true,
            hideYouSection: true,
            hidePlaylists: true,
            hideYourVideos: true,
            hideYourCourses: true,
            hideWatchLater: true,
            hideLikedVideos: true,
            hideHistory: true,
        },
    },
    {
        key: 'compact',
        label: 'Compact',
        description: 'Trim watch metadata for a condensed browsing surface.',
        overrides: {
            hideFold: true,
            hideDescription: true,
            hideTitle: true,
            hideCreator: true,
            hideAiSummary: true,
            hideCategoryAndTopic: true,
            hidePreviewDetails: true,
            hidePreviewAvatars: true,
            hideWatchedProgress: true,
            hideVideoFilterChips: true,
        },
    },
    {
        key: 'zen',
        label: 'Zen',
        description: 'Eliminate social noise and interactions for ambient viewing.',
        overrides: {
            hideShorts: true,
            hideRecommended: true,
            hideYouFeed: true,
            hidePosts: true,
            hideLiveVideos: true,
            hideLiveChat: true,
            hideComments: true,
            hideCommentAvatars: true,
            hideCommentUploadTime: true,
            hideCommentReplies: true,
            hideActions: true,
            hideActionLikeDislike: true,
            hideActionShare: true,
            hideActionSave: true,
            hideActionEllipsis: true,
            hideActionJoin: true,
            hideActionSubscribe: true,
            hideActionClip: true,
            hideNotifications: true,
            hideCreateButton: true,
            hideAvatar: true,
            hideBadgesChips: true,
            hideVideoFilterChips: true,
            hideHoverPreview: true,
        },
    },
];

export const PROFILE_OVERRIDES: Record<ProfileKey, Partial<Settings>> = PROFILE_DEFINITIONS.reduce((acc, profile) => {
    acc[profile.key] = profile.overrides;
    return acc;
}, {} as Record<ProfileKey, Partial<Settings>>);
