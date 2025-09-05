import { useGlobalContext } from "../../context/globalContext";
import SettingsGroup from "../SettingsGroup";
import SettingsGrid from "../SettingsGrid";
import CardWithInput from "../CardWithInput";

export default function UI() {
    const { settings, handleToggle } = useGlobalContext();
    return (
        <SettingsGroup title="UI">
            <SettingsGrid>
                <CardWithInput label="Cinema" checked={settings.cinematicMode} onChange={handleToggle('cinematicMode')} />
            </SettingsGrid>
        </SettingsGroup>
    );
}
