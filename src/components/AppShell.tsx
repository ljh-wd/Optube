import type { PropsWithChildren } from "react";

export default function AppShell({ children }: PropsWithChildren) {
    return <div className='app-shell'>{children}</div>;
}