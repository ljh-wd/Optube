import type { PropsWithChildren } from "react";


export default function Panels({ children }: PropsWithChildren) {
    return (
        <main className="panels" role="region" aria-label="Settings">{children}</main>
    )
}