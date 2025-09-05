import { useGlobalContext } from "../../../context/globalContext";
import CardWithInput from "../../CardWithInput";
import NestedToggle from "../../NestedToggle";

export default function Preview() {
    const { settings, handleToggle } = useGlobalContext();

    return (
        <NestedToggle label="Video preview details" checked={settings.hidePreviewDetails} onChange={handleToggle('hidePreviewDetails')}>
            <CardWithInput label="Avatars" checked={settings.hidePreviewAvatars} onChange={handleToggle('hidePreviewAvatars')} disabled={settings.hidePreviewDetails} />
        </NestedToggle>
    )
}