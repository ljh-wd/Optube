import { useGlobalContext } from "../../../context/globalContext";
import CardWithInput from "../../CardWithInput";
import NestedToggle from "../../NestedToggle";

export default function Actions() {
    const { settings, handleToggle } = useGlobalContext();

    return (
        <NestedToggle label="Actions" checked={settings.hideActions} onChange={handleToggle('hideActions')}>
            <CardWithInput label="Like/Dislike" checked={settings.hideActionLikeDislike} onChange={handleToggle('hideActionLikeDislike')} disabled={settings.hideActions} />
            <CardWithInput label="Share" checked={settings.hideActionShare} onChange={handleToggle('hideActionShare')} disabled={settings.hideActions} />
            <CardWithInput label="Save" checked={settings.hideActionSave} onChange={handleToggle('hideActionSave')} disabled={settings.hideActions} />
            <CardWithInput label="More (ellipsis)" checked={settings.hideActionEllipsis} onChange={handleToggle('hideActionEllipsis')} disabled={settings.hideActions} />
            <CardWithInput label="Join" checked={settings.hideActionJoin} onChange={handleToggle('hideActionJoin')} disabled={settings.hideActions} />
            <CardWithInput label="Subscribe" checked={settings.hideActionSubscribe} onChange={handleToggle('hideActionSubscribe')} disabled={settings.hideActions} />
            <CardWithInput label="Clip" checked={settings.hideActionClip} onChange={handleToggle('hideActionClip')} disabled={settings.hideActions} />
        </NestedToggle>
    );
}
