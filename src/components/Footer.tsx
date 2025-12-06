import { useGlobalContext } from "../context/globalContext";
import type { Settings } from "../types/global";

export default function Footer() {
    const { defaultSettings, setSettings } = useGlobalContext();

    return (
        <footer className="app-footer">
            <div className="footer-card" role="contentinfo">
                <button
                    className="reset-btn"
                    onClick={() => {
                        const reset: Partial<Settings> = {};
                        (Object.keys(defaultSettings) as (keyof Settings)[]).forEach(k => {
                            if (typeof defaultSettings[k] === 'boolean') {
                                (reset as Record<string, boolean>)[k] = false;
                            }
                        });
                        reset.cinematicMode = false;
                        reset.cinemaPreviewMuted = false;
                        reset.extensionEnabled = true;
                        reset.activeProfile = null;
                        chrome.storage.sync.set(reset as Settings);
                        chrome.storage.sync.remove('_sidebarNestedBackup');
                        setSettings(prev => ({ ...prev, ...reset } as Settings));
                    }}
                    type='button'
                >
                    Reset filters
                </button>
                <div className="info-text">Settings persist across pages.</div>
            </div>
        </footer>
    )
}