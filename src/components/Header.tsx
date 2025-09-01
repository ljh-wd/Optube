import {useMemo} from "react";
import {useGlobalContext} from "../context/globalContext";

export default function Header() {
    const {settings} = useGlobalContext()
    const activeCount = useMemo(() => Object.values(settings).filter(Boolean).length, [settings]);
    const total = Object.keys(settings).length;

    return (
        <header className="app-header">
            <div className="brand-block">
                <h1 className="app-title">Optube</h1>
                <p className="tagline">Focus your YouTube experience</p>
            </div>
                <div className="status-pill" aria-label={`Active filters ${activeCount} of ${total}`}>
                    <span>{activeCount}</span><span className="divider"/>{total}
                </div>
        </header>
    )
}