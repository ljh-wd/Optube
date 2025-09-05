import { useGlobalContext } from "../../context/globalContext";
import CardWithInput from "../CardWithInput";
import SettingsGrid from "../SettingsGrid";
import SettingsGroup from "../SettingsGroup";
import Comments from "../Toggles/Video/Comments";
import Details from "../Toggles/Video/Details";

export default function Video() {
    const { settings, handleToggle } = useGlobalContext();
    return (
        <SettingsGroup title="Video">
            <SettingsGrid>
                <Details />
                <Comments />
                <CardWithInput label="Recommended" checked={settings.hideRecommended} onChange={handleToggle('hideRecommended')} />
            </SettingsGrid>
        </SettingsGroup>
    )
}