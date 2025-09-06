import { useMemo } from "react";
import { useGlobalContext } from "../context/globalContext";

export default function Header() {
    const { settings } = useGlobalContext()
    // Compute counts ignoring non-boolean fields and theme selector
    const { activeCount, total } = useMemo(() => {
        const entries = Object.entries(settings).filter(([k, v]) => k !== 'theme' && typeof v === 'boolean');
        return { activeCount: entries.filter(([, v]) => !!v).length, total: entries.length };
    }, [settings]);

    return (
        <header className="app-header">
            <div className="brand-block">
                <h1 className="app-title">Optube</h1>
                <p className="tagline">Focus your YouTube experience</p>
            </div>
            <div className="status-pill" aria-label={`Active filters ${activeCount} of ${total}`}>
                <span>{activeCount}</span><span className="divider" />{total}
            </div>
        </header>
    )
}