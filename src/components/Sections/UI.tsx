import { useGlobalContext } from "../../context/globalContext";
import SettingsGroup from "../SettingsGroup";
import SettingsGrid from "../SettingsGrid";
import CardWithInput from "../CardWithInput";
import NestedToggle from "../NestedToggle";
import Hint from "../Hint";
import { PROFILE_DEFINITIONS } from "../../utils/profiles";

export default function UI() {
    const { settings, handleToggle, applyProfile } = useGlobalContext();

    return (
        <SettingsGroup title="Profiles">
            <Hint>
                Profiles bundle opinionated toggles. Only one profile can be active at a time and switching restores the
                previous preset.
            </Hint>
            <SettingsGrid>
                {PROFILE_DEFINITIONS.map((profile) => (
                    <NestedToggle
                        key={profile.key}
                        label={profile.label}
                        checked={settings.activeProfile === profile.key}
                        onChange={(checked) => applyProfile(checked ? profile.key : null)}
                    >
                        <Hint>{profile.description}</Hint>
                        {profile.key === 'cinema' && (
                            <CardWithInput
                                label="Mute spotlight"
                                checked={settings.cinemaPreviewMuted}
                                onChange={handleToggle('cinemaPreviewMuted')}
                                disabled={settings.activeProfile !== 'cinema'}
                            />
                        )}
                    </NestedToggle>
                ))}
            </SettingsGrid>
        </SettingsGroup>
    );
}
