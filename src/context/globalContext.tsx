/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type Dispatch, type PropsWithChildren, type SetStateAction } from 'react';
import type { Settings } from '../types/global';

// TODO: Split these types up for better maintainability and readability
const defaultSettings: Settings = {
    theme: 'dark',
    hideShorts: false,
    hideSubscriptions: false,
    hideAiSummary: false,
    hideSubscriptionsSidebar: false,
    hideChannelSubscriberCount: false,
    hideHome: false,
    hideYouFeed: false,
    hideMasthead: false,
    hideAvatar: false,
    hideSearchbar: false,
    hideNotifications: false,
    hideCreateButton: false,
    hideFold: false,
    hideComments: false,
    hideCommentAvatars: false,
    hideCategoryAndTopic: false,
    hideRecommended: false,
    hidePosts: false,
    hideSidebar: false,
    hideDescription: false,
    hideTitle: false,
    hideCreator: false,
    hideVideoFilterChips: false,
    cinematicMode: false,
    cinemaPreviewMuted: true,
    // Layout
    hideDurationBadges: false,
    hidePreviewDetails: false,
    hidePreviewAvatars: false,
    hideBadgesChips: false,
    hideWatchedProgress: false,
    hideHoverPreview: false,
    hideLiveVideos: false,
    hideLiveChat: false,
    hideYoutubePlayables: false,
    // Video Actions
    hideActions: false,
    hideActionLikeDislike: false,
    hideActionShare: false,
    hideActionSave: false,
    hideActionEllipsis: false,
    hideActionJoin: false,
    hideActionSubscribe: false,
    hideActionClip: false,
    // Navigation additions
    hideExplore: false,
    hideMoreFromYouTube: false,
    hideYouSection: false,
    hidePlaylists: false,
    hideYourVideos: false,
    hideYourCourses: false,
    hideWatchLater: false,
    hideLikedVideos: false,
    hideHistory: false,
    // Explore submenu
    hideExploreMusic: false,
    hideExploreMovies: false,
    hideExploreLive: false,
    hideExploreGaming: false,
    hideExploreNews: false,
    hideExploreSport: false,
    hideExploreLearning: false,
    hideExploreFashion: false,
    hideExplorePodcasts: false,
    hideExplorePlayables: false,
};

type Props = {
    settings: Settings;
    defaultSettings: Settings;
    setSettings: Dispatch<SetStateAction<Settings>>;
}

export const GlobalContext = createContext<Props | undefined>(undefined);

export const GlobalProvider = ({ children }: PropsWithChildren) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    // One-time load of persisted settings (merge into defaults)
    useEffect(() => {
        try {
            const keys = Object.keys(defaultSettings);
            chrome.storage.sync.get(keys, (stored) => {
                if (stored && typeof stored === 'object') {
                    setSettings(prev => ({ ...prev, ...stored }));
                }
            });
        } catch { /* ignore */ }
    }, []);

    const value: Props = {
        settings,
        setSettings,
        defaultSettings
    };

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
};



export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    const { setSettings, ...restContext } = context;


    const saveSettings = (newSettings: Settings) => {
        chrome.storage.sync.set(newSettings);
    };

    const handleToggle = (key: keyof Settings) => (checked: boolean) => {
        // Restoration path: user is turning OFF the hideSidebar flag (showing sidebar again)
        if (key === 'hideSidebar' && !checked) {
            // Showing sidebar again: force ALL nested hides to false (unhide everything)
            setSettings(prev => {
                const updated: Settings = { ...prev, hideSidebar: false };
                updated.hideExplore = false;
                updated.hideExploreMusic = false;
                updated.hideExploreMovies = false;
                updated.hideExploreLive = false;
                updated.hideExploreGaming = false;
                updated.hideExploreNews = false;
                updated.hideExploreSport = false;
                updated.hideExploreLearning = false;
                updated.hideExploreFashion = false;
                updated.hideExplorePodcasts = false;
                updated.hideExplorePlayables = false;
                updated.hideMoreFromYouTube = false;
                updated.hideYouSection = false;
                // leave hideYouFeed untouched (independent)
                updated.hideHistory = false;
                updated.hidePlaylists = false;
                updated.hideYourVideos = false;
                updated.hideYourCourses = false;
                updated.hideWatchLater = false;
                updated.hideLikedVideos = false;
                saveSettings(updated);
                // Clean any legacy backup key if exists
                chrome.storage.sync.remove('_sidebarNestedBackup');
                return updated;
            });
            return;
        }

        if (key === 'hideSidebar' && checked) {
            // Showing sidebar again: force ALL nested hides to true (hide everything)
            setSettings(prev => {
                const updated: Settings = { ...prev, hideSidebar: true };
                updated.hideExplore = true;
                updated.hideExploreMusic = true;
                updated.hideExploreMovies = true;
                updated.hideExploreLive = true;
                updated.hideExploreGaming = true;
                updated.hideExploreNews = true;
                updated.hideExploreSport = true;
                updated.hideExploreLearning = true;
                updated.hideExploreFashion = true;
                updated.hideExplorePodcasts = true;
                updated.hideExplorePlayables = true;
                updated.hideMoreFromYouTube = true;
                updated.hideYouSection = true;
                // do not auto-toggle hideYouFeed here
                updated.hideHistory = true;
                updated.hidePlaylists = true;
                updated.hideYourVideos = true;
                updated.hideYourCourses = true;
                updated.hideWatchLater = true;
                updated.hideLikedVideos = true;
                saveSettings(updated);
                chrome.storage.sync.remove('_sidebarNestedBackup');
                return updated;
            });
            return;
        }



        setSettings(prev => {
            const updated: Settings = { ...prev, [key]: checked } as Settings;

            // If topbar is being enabled, also enable searchbar and notifications
            if (key === 'hideMasthead' && checked) {
                updated.hideSearchbar = true;
                updated.hideNotifications = true;
                updated.hideCreateButton = true;
                updated.hideAvatar = true;
            }

            // If topbar is being disabled, also disable searchbar and notifications
            if (key === 'hideMasthead' && !checked) {
                updated.hideSearchbar = false;
                updated.hideNotifications = false;
                updated.hideCreateButton = false;
                updated.hideAvatar = false;
            }

            // If subscriptions is being enabled, also enable subscriptions sidebar
            if (key === 'hideSubscriptions' && checked) {
                updated.hideSubscriptionsSidebar = true;
            }

            // If subscriptions is being disabled, also disable subscriptions sidebar
            if (key === 'hideSubscriptions' && !checked) {
                updated.hideSubscriptionsSidebar = false;
            }

            // If video details is being enabled, also enable description, title, creator and category/topic
            if (key === 'hideFold' && checked) {
                updated.hideDescription = true;
                updated.hideTitle = true;
                updated.hideCreator = true;
                updated.hideAiSummary = true;
                updated.hideCategoryAndTopic = true;
            }

            // If video details is being disabled, also disable description, title, creator and category/topic
            if (key === 'hideFold' && !checked) {
                updated.hideDescription = false;
                updated.hideTitle = false;
                updated.hideCreator = false;
                updated.hideAiSummary = false;
                updated.hideCategoryAndTopic = false;
            }

            // Cascade comment avatars with comments parent
            if (key === 'hideComments' && checked) {
                updated.hideCommentAvatars = true;
            }
            if (key === 'hideComments' && !checked) {
                updated.hideCommentAvatars = false;
            }


            // If live videos is being enabled/disabled, cascade to live chat
            if (key === 'hideLiveVideos' && checked) {
                updated.hideLiveChat = true;
            }
            if (key === 'hideLiveVideos' && !checked) {
                updated.hideLiveChat = false;
            }

            // If preview details (layout) is enabled, also enable preview avatars automatically
            if (key === 'hidePreviewDetails' && checked) {
                updated.hidePreviewAvatars = true;
            }
            if (key === 'hidePreviewDetails' && !checked) {
                updated.hidePreviewAvatars = false;
            }

            // If 'You' section is toggled, cascade to its children
            if (key === 'hideYouSection' && checked) {
                updated.hideHistory = true;
                updated.hidePlaylists = true;
                updated.hideYourVideos = true;
                updated.hideYourCourses = true;
                updated.hideWatchLater = true;
                updated.hideLikedVideos = true;
            }
            if (key === 'hideYouSection' && !checked) {
                updated.hideHistory = false;
                updated.hidePlaylists = false;
                updated.hideYourVideos = false;
                updated.hideYourCourses = false;
                updated.hideWatchLater = false;
                updated.hideLikedVideos = false;
            }

            // If parent Explore is toggled, cascade to all children
            if (key === 'hideExplore') {
                updated.hideExploreMusic = checked;
                updated.hideExploreMovies = checked;
                updated.hideExploreLive = checked;
                updated.hideExploreGaming = checked;
                updated.hideExploreNews = checked;
                updated.hideExploreSport = checked;
                updated.hideExploreLearning = checked;
                updated.hideExploreFashion = checked;
                updated.hideExplorePodcasts = checked;
                updated.hideExplorePlayables = checked;
            }

            // Actions parent cascade: like/dislike, share, save, ellipsis, join, subscribe, clip
            if (key === 'hideActions') {
                updated.hideActionLikeDislike = checked;
                updated.hideActionShare = checked;
                updated.hideActionSave = checked;
                updated.hideActionEllipsis = checked;
                updated.hideActionJoin = checked;
                updated.hideActionSubscribe = checked;
                updated.hideActionClip = checked;
            }

            // Keep parent Actions reflecting all children when a child changes
            if ([
                'hideActionLikeDislike',
                'hideActionShare',
                'hideActionSave',
                'hideActionEllipsis',
                'hideActionJoin',
                'hideActionSubscribe',
                'hideActionClip'
            ].includes(key)) {
                const allChildren = [
                    key === 'hideActionLikeDislike' ? checked : prev.hideActionLikeDislike,
                    key === 'hideActionShare' ? checked : prev.hideActionShare,
                    key === 'hideActionSave' ? checked : prev.hideActionSave,
                    key === 'hideActionEllipsis' ? checked : prev.hideActionEllipsis,
                    key === 'hideActionJoin' ? checked : prev.hideActionJoin,
                    key === 'hideActionSubscribe' ? checked : prev.hideActionSubscribe,
                    key === 'hideActionClip' ? checked : prev.hideActionClip,
                ];
                updated.hideActions = allChildren.every(Boolean);
            }

            // If any Explore child is toggled, only update itself and parent
            if ([
                'hideExploreMusic',
                'hideExploreMovies',
                'hideExploreLive',
                'hideExploreGaming',
                'hideExploreNews',
                'hideExploreSport',
                'hideExploreLearning',
                'hideExploreFashion',
                'hideExplorePodcasts',
                'hideExplorePlayables'
            ].includes(key)) {
                // Only update parent Explore toggle to reflect all children
                const allChildren = [
                    key === 'hideExploreMusic' ? checked : prev.hideExploreMusic,
                    key === 'hideExploreMovies' ? checked : prev.hideExploreMovies,
                    key === 'hideExploreLive' ? checked : prev.hideExploreLive,
                    key === 'hideExploreGaming' ? checked : prev.hideExploreGaming,
                    key === 'hideExploreNews' ? checked : prev.hideExploreNews,
                    key === 'hideExploreSport' ? checked : prev.hideExploreSport,
                    key === 'hideExploreLearning' ? checked : prev.hideExploreLearning,
                    key === 'hideExploreFashion' ? checked : prev.hideExploreFashion,
                    key === 'hideExplorePodcasts' ? checked : prev.hideExplorePodcasts,
                    key === 'hideExplorePlayables' ? checked : prev.hideExplorePlayables
                ];
                updated.hideExplore = allChildren.every(Boolean);
            }

            saveSettings(updated);
            return updated;
        });
    };

    return { ...restContext, setSettings, handleToggle, saveSettings };
}
