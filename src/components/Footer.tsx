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
                            handleToggle(key as keyof Settings)(defaultSettings[key as keyof Settings]);
                        });
                        chrome.storage.sync.remove('_sidebarNestedBackup');
                    }}
                    type='button'
                >
                    Reset filters
                </button>
                <div className="info-text">Settings persist across YouTube pages.</div>
            </div>
        </footer>
    )
}