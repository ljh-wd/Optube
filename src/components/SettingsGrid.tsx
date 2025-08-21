import type { PropsWithChildren } from "react";

export default function SettingsGrid({ children }: PropsWithChildren) {
    return (
        <div className="settings-grid">{children}</div>
    )
}