import { useGlobalContext } from "../../../context/globalContext";
import type { Settings } from "../../../types/global";
import CardWithInput from "../../CardWithInput";
import NestedToggle from "../../NestedToggle";

export default function Explore() {
    const { settings, setSettings, handleToggle, saveSettings } = useGlobalContext();

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
    )
}