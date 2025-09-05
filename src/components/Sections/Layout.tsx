import { useGlobalContext } from "../../context/globalContext";
import CardWithInput from "../CardWithInput";
import SettingsGrid from "../SettingsGrid";
import SettingsGroup from "../SettingsGroup";
import Preview from "../Toggles/Layout/Preview";
import Sidebar from "../Toggles/Layout/Sidebar";
import TopBar from "../Toggles/Layout/TopBar";


export default function Layout() {
    const { settings, handleToggle } = useGlobalContext();




    return (
        <SettingsGroup title="Layout">
            <SettingsGrid>
                <CardWithInput label="Duration badges" checked={settings.hideDurationBadges} onChange={handleToggle('hideDurationBadges')} />
                <CardWithInput label="Duration watched" checked={settings.hideWatchedProgress} onChange={handleToggle('hideWatchedProgress')} />
                <CardWithInput label="Hover preview" checked={settings.hideHoverPreview} onChange={handleToggle('hideHoverPreview')} />
                <CardWithInput label="Filter chips (badges)" checked={settings.hideBadgesChips} onChange={handleToggle('hideBadgesChips')} />
                <Sidebar />
                <Preview />
                <TopBar />
            </SettingsGrid>
        </SettingsGroup>
    )
}


