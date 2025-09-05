import { useGlobalContext } from "../../context/globalContext";
import SettingsGroup from "../SettingsGroup";
import SettingsGrid from "../SettingsGrid";
import CardWithInput from "../CardWithInput";
import Hint from "../Hint";

export default function UI() {
    const { settings, handleToggle } = useGlobalContext();
    return (
        <SettingsGroup title="UI">
            <Hint>Enabling UI features toggle some settings by default and reset all filters when untoggled.</Hint>
            <SettingsGrid>
                <CardWithInput label="Cinema" checked={settings.cinematicMode} onChange={handleToggle('cinematicMode')} />
            </SettingsGrid>
        </SettingsGroup>
    );
}
