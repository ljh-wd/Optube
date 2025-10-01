import { useGlobalContext } from "../../../context/globalContext";
import CardWithInput from "../../CardWithInput";
import NestedToggle from "../../NestedToggle";

export default function Comments() {
    const { settings, handleToggle } = useGlobalContext();

    return (
        <NestedToggle label="Comments" checked={settings.hideComments} onChange={handleToggle('hideComments')}>
            <CardWithInput label="Avatars" checked={settings.hideCommentAvatars} onChange={handleToggle('hideCommentAvatars')} disabled={settings.hideComments} />
            <CardWithInput label="Upload time" checked={settings.hideCommentUploadTime} onChange={handleToggle('hideCommentUploadTime')} disabled={settings.hideComments} />
            <CardWithInput label="Replies" checked={settings.hideCommentReplies} onChange={handleToggle('hideCommentReplies')} disabled={settings.hideComments} />
        </NestedToggle>
    )
}