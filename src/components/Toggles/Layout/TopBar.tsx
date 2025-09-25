import { useGlobalContext } from "../../../context/globalContext";
import CardWithInput from "../../CardWithInput";
import NestedToggle from "../../NestedToggle";

export default function TopBar() {
    const { settings, handleToggle } = useGlobalContext();

    return (
        <NestedToggle label="Top bar" checked={settings.hideMasthead} onChange={handleToggle('hideMasthead')}>
            <CardWithInput label="Search" checked={settings.hideSearchbar} onChange={handleToggle('hideSearchbar')} disabled={settings.hideMasthead} />
            <CardWithInput label="Notifications" checked={settings.hideNotifications} onChange={handleToggle('hideNotifications')} disabled={settings.hideMasthead} />
            <CardWithInput label="Create" checked={settings.hideCreateButton} onChange={handleToggle('hideCreateButton')} disabled={settings.hideMasthead} />
            <CardWithInput label="Avatar" checked={settings.hideAvatar} onChange={handleToggle('hideAvatar')} disabled={settings.hideMasthead} />
        </NestedToggle>
    )
}