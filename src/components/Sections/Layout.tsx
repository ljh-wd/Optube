import { useGlobalContext } from "../../context/globalContext";
import type { Settings } from "../../types/global";
import CardWithInput from "../CardWithInput";
import NestedToggle from "../NestedToggle";
import SettingsGrid from "../SettingsGrid";
import SettingsGroup from "../SettingsGroup";


export default function Layout() {
    const { settings, handleToggle, setSettings, saveSettings } = useGlobalContext();


    const allExploreToggled = [
        settings.hideExploreMusic,
        settings.hideExploreMovies,
        settings.hideExploreLive,
        settings.hideExploreGaming,
        settings.hideExploreNews,
        settings.hideExploreSport,
        settings.hideExploreLearning,
        settings.hideExploreFashion,
        settings.hideExplorePodcasts,
        settings.hideExplorePlayables
    ].every(Boolean);

    function toggleAllExplore(checked: boolean) {
        setSettings(prev => {
            const updated: Settings = { ...prev };
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
            updated.hideExplore = checked;
            saveSettings(updated);
            return updated;
        });
    }
    return (
        <SettingsGroup title="Layout">
            <SettingsGrid>
                <CardWithInput label="Duration badges" checked={settings.hideDurationBadges} onChange={handleToggle('hideDurationBadges')} />
                <CardWithInput label="Duration watched" checked={settings.hideWatchedProgress} onChange={handleToggle('hideWatchedProgress')} />
                <CardWithInput label="Hover preview" checked={settings.hideHoverPreview} onChange={handleToggle('hideHoverPreview')} />
                <NestedToggle label="Video preview details" checked={settings.hidePreviewDetails} onChange={handleToggle('hidePreviewDetails')}>
                    <CardWithInput label="Avatars" checked={settings.hidePreviewAvatars} onChange={handleToggle('hidePreviewAvatars')} disabled={settings.hidePreviewDetails} />
                </NestedToggle>
                <CardWithInput label="Filter chips (badges)" checked={settings.hideBadgesChips} onChange={handleToggle('hideBadgesChips')} />
                <NestedToggle label="Top bar" checked={settings.hideMasthead} onChange={handleToggle('hideMasthead')}>
                    <CardWithInput label="Search" checked={settings.hideSearchbar} onChange={handleToggle('hideSearchbar')} disabled={settings.hideMasthead} />
                    <CardWithInput label="Notifications" checked={settings.hideNotifications} onChange={handleToggle('hideNotifications')} disabled={settings.hideMasthead} />
                    <CardWithInput label="Create" checked={settings.hideCreateButton} onChange={handleToggle('hideCreateButton')} disabled={settings.hideMasthead} />
                </NestedToggle>
                <NestedToggle label="Sidebar" checked={settings.hideSidebar} onChange={handleToggle('hideSidebar')}>
                    <CardWithInput label="Subscriptions" checked={settings.hideSubscriptionsSidebar} onChange={handleToggle('hideSubscriptionsSidebar')} disabled={settings.hideSubscriptions} />
                    <NestedToggle label="Explore" checked={allExploreToggled} onChange={toggleAllExplore} disabled={settings.hideSidebar}>
                        <CardWithInput label="Music" checked={settings.hideExploreMusic} onChange={handleToggle('hideExploreMusic')} disabled={settings.hideSidebar} />
                        <CardWithInput label="Movies & TV" checked={settings.hideExploreMovies} onChange={handleToggle('hideExploreMovies')} disabled={settings.hideSidebar} />
                        <CardWithInput label="Live" checked={settings.hideExploreLive} onChange={handleToggle('hideExploreLive')} disabled={settings.hideSidebar} />
                        <CardWithInput label="Gaming" checked={settings.hideExploreGaming} onChange={handleToggle('hideExploreGaming')} disabled={settings.hideSidebar} />
                        <CardWithInput label="News" checked={settings.hideExploreNews} onChange={handleToggle('hideExploreNews')} disabled={settings.hideSidebar} />
                        <CardWithInput label="Sport" checked={settings.hideExploreSport} onChange={handleToggle('hideExploreSport')} disabled={settings.hideSidebar} />
                        <CardWithInput label="Learning" checked={settings.hideExploreLearning} onChange={handleToggle('hideExploreLearning')} disabled={settings.hideSidebar} />
                        <CardWithInput label="Fashion & Beauty" checked={settings.hideExploreFashion} onChange={handleToggle('hideExploreFashion')} disabled={settings.hideSidebar} />
                        <CardWithInput label="Podcasts" checked={settings.hideExplorePodcasts} onChange={handleToggle('hideExplorePodcasts')} disabled={settings.hideSidebar} />
                        <CardWithInput label="Playables" checked={settings.hideExplorePlayables} onChange={handleToggle('hideExplorePlayables')} disabled={settings.hideSidebar} />
                    </NestedToggle>
                    <CardWithInput label="More from YouTube" checked={settings.hideMoreFromYouTube} onChange={handleToggle('hideMoreFromYouTube')} disabled={settings.hideSidebar} />
                    <NestedToggle label="You" checked={settings.hideYouSection} onChange={handleToggle('hideYouSection')} disabled={settings.hideSidebar}>
                        <CardWithInput label="History" checked={settings.hideHistory} onChange={handleToggle('hideHistory')} disabled={settings.hideYouSection || settings.hideSidebar} />
                        <CardWithInput label="Playlists" checked={settings.hidePlaylists} onChange={handleToggle('hidePlaylists')} disabled={settings.hideYouSection || settings.hideSidebar} />
                        <CardWithInput label="Your videos" checked={settings.hideYourVideos} onChange={handleToggle('hideYourVideos')} disabled={settings.hideYouSection || settings.hideSidebar} />
                        <CardWithInput label="Your courses" checked={settings.hideYourCourses} onChange={handleToggle('hideYourCourses')} disabled={settings.hideYouSection || settings.hideSidebar} />
                        <CardWithInput label="Watch later" checked={settings.hideWatchLater} onChange={handleToggle('hideWatchLater')} disabled={settings.hideYouSection || settings.hideSidebar} />
                        <CardWithInput label="Liked videos" checked={settings.hideLikedVideos} onChange={handleToggle('hideLikedVideos')} disabled={settings.hideYouSection || settings.hideSidebar} />
                    </NestedToggle>
                </NestedToggle>
            </SettingsGrid>
        </SettingsGroup>
    )
}