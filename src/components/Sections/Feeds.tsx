import { useGlobalContext } from "../../context/globalContext";
import CardWithInput from "../CardWithInput";

import SettingsGrid from "../SettingsGrid";
import SettingsGroup from "../SettingsGroup";

export default function Feeds() {
    const { settings, handleToggle } = useGlobalContext();

    return (
        <SettingsGroup title="Feeds">
            <SettingsGrid>
                <CardWithInput label="Home" checked={settings.hideHome} onChange={handleToggle('hideHome')} />
                <CardWithInput label="Shorts" checked={settings.hideShorts} onChange={handleToggle('hideShorts')} />
                <CardWithInput label="Subscriptions" checked={settings.hideSubscriptions} onChange={handleToggle('hideSubscriptions')} />
                <CardWithInput label="Posts" checked={settings.hidePosts} onChange={handleToggle('hidePosts')} />
            </SettingsGrid>
        </SettingsGroup>
    )
}