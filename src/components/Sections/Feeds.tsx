import { useGlobalContext } from "../../context/globalContext";
import CardWithInput from "../CardWithInput";
import NestedToggle from "../NestedToggle";
import SettingsGrid from "../SettingsGrid";
import SettingsGroup from "../SettingsGroup";

export default function Feeds() {
    const { settings, handleToggle } = useGlobalContext();

    return (
        <SettingsGroup title="Feeds">
            <SettingsGrid>
                <CardWithInput label="Home" checked={settings.hideHome} onChange={handleToggle('hideHome')} />
                <CardWithInput label="Shorts" checked={settings.hideShorts} onChange={handleToggle('hideShorts')} />
                <NestedToggle label="Subscriptions" checked={settings.hideSubscriptions} onChange={handleToggle('hideSubscriptions')}>
                    <CardWithInput label="Subscription sidebar" checked={settings.hideSubscriptionsSidebar} onChange={handleToggle('hideSubscriptionsSidebar')} disabled={settings.hideSubscriptions} />
                </NestedToggle>
                <CardWithInput label="Posts" checked={settings.hidePosts} onChange={handleToggle('hidePosts')} />
            </SettingsGrid>
        </SettingsGroup>
    )
}