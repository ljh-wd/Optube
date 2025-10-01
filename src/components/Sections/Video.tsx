import { useGlobalContext } from "../../context/globalContext";
import CardWithInput from "../CardWithInput";
import SettingsGrid from "../SettingsGrid";
import SettingsGroup from "../SettingsGroup";
import Comments from "../Toggles/Video/Comments";
import Details from "../Toggles/Video/Details";
import Actions from "../Toggles/Video/Actions";

export default function Video() {
    const { settings, handleToggle } = useGlobalContext();
    return (
        <SettingsGroup title="Video">
            <SettingsGrid>
                <Details />
                <Comments />
                <Actions />
                <CardWithInput label="Filter chips" checked={settings.hideVideoFilterChips} onChange={handleToggle('hideVideoFilterChips')} />
                <CardWithInput label="Recommended" checked={settings.hideRecommended} onChange={handleToggle('hideRecommended')} />
            </SettingsGrid>
        </SettingsGroup>
    )
}