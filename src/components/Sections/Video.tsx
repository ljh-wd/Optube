import { useGlobalContext } from "../../context/globalContext";
import CardWithInput from "../CardWithInput";
import NestedToggle from "../NestedToggle";
import SettingsGrid from "../SettingsGrid";
import SettingsGroup from "../SettingsGroup";

export default function Video() {
    const { settings, handleToggle } = useGlobalContext();
    return (
        <SettingsGroup title="Video">
            <SettingsGrid>
                <NestedToggle label="Details" checked={settings.hideFold} onChange={handleToggle('hideFold')}>
                    <CardWithInput label="Title" checked={settings.hideTitle} onChange={handleToggle('hideTitle')} disabled={settings.hideFold} />
                    <CardWithInput label="Creator" checked={settings.hideCreator} onChange={handleToggle('hideCreator')} disabled={settings.hideFold} />
                    <CardWithInput label="Description" checked={settings.hideDescription} onChange={handleToggle('hideDescription')} disabled={settings.hideFold} />
                    <CardWithInput label="AI Summary" checked={settings.hideAiSummary} onChange={handleToggle('hideAiSummary')} disabled={settings.hideFold} />
                    <CardWithInput label="Category / Topic" checked={settings.hideCategoryAndTopic} onChange={handleToggle('hideCategoryAndTopic')} disabled={settings.hideFold} />
                </NestedToggle>
                <NestedToggle label="Comments" checked={settings.hideComments} onChange={handleToggle('hideComments')}>
                    <CardWithInput label="Avatars" checked={settings.hideCommentAvatars} onChange={handleToggle('hideCommentAvatars')} disabled={settings.hideComments} />
                </NestedToggle>
                <CardWithInput label="Recommended" checked={settings.hideRecommended} onChange={handleToggle('hideRecommended')} />
            </SettingsGrid>
        </SettingsGroup>
    )
}