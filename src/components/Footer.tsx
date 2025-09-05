import { useGlobalContext } from "../context/globalContext";
import type { Settings } from "../types/global";

export default function Footer() {
    const { handleToggle, defaultSettings } = useGlobalContext();

    return (
        <footer className="app-footer">
            <div className="footer-card" role="contentinfo">
                <button
                    className="reset-btn"
                    onClick={() => {
                        Object.keys(defaultSettings).forEach(key => {
                            const value = defaultSettings[key as keyof Settings];
                            handleToggle(key as keyof Settings)(typeof value === 'boolean' ? value : false);
                        });
                        chrome.storage.sync.remove('_sidebarNestedBackup');
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