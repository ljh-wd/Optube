import { useGlobalContext } from "../../../context/globalContext";
import CardWithInput from "../../CardWithInput";
import NestedToggle from "../../NestedToggle";

export default function Details() {

    const { settings, handleToggle } = useGlobalContext();

    return (
        <NestedToggle label="Details" checked={settings.hideFold} onChange={handleToggle('hideFold')}>
            <CardWithInput label="Title" checked={settings.hideTitle} onChange={handleToggle('hideTitle')} disabled={settings.hideFold} />
            <CardWithInput label="Creator" checked={settings.hideCreator} onChange={handleToggle('hideCreator')} disabled={settings.hideFold} />
            <CardWithInput label="Description" checked={settings.hideDescription} onChange={handleToggle('hideDescription')} disabled={settings.hideFold} />
            <CardWithInput label="AI Summary" checked={settings.hideAiSummary} onChange={handleToggle('hideAiSummary')} disabled={settings.hideFold} />
            <CardWithInput label="Category / Topic" checked={settings.hideCategoryAndTopic} onChange={handleToggle('hideCategoryAndTopic')} disabled={settings.hideFold} />
        </NestedToggle>
    );
}
