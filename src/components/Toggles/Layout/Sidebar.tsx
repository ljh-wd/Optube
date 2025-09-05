import { useGlobalContext } from "../../../context/globalContext";
import CardWithInput from "../../CardWithInput";
import NestedToggle from "../../NestedToggle";
import Explore from "./Explore";

export default function Sidebar() {
    const { settings, handleToggle } = useGlobalContext();
    return (
        <NestedToggle label="Sidebar" checked={settings.hideSidebar} onChange={handleToggle('hideSidebar')}>
            <CardWithInput label="Subscription channels" checked={settings.hideSubscriptionsSidebar} onChange={handleToggle('hideSubscriptionsSidebar')} disabled={settings.hideSubscriptions} />
            <Explore />
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
    )
}