import type { PropsWithChildren } from "react";
import { useGlobalContext } from '../context/globalContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export default function AppShell({ children }: PropsWithChildren) {
    const { settings, setSettings } = useGlobalContext();
    const toggleTheme = () => {
        const next: 'light' | 'dark' = (settings.theme === 'light' ? 'dark' : 'light');
        const updated = { ...settings, theme: next };
        setSettings(updated);
        chrome.storage.sync.set(updated);
    };
    return (
        <div className='app-shell' data-theme={settings.theme || 'dark'}>
            <div className="app-shell-top">
                <div className="spacer" />
                <button className='theme-icon-btn' onClick={toggleTheme} aria-label='Toggle theme'>
                    {settings.theme === 'light' ? <MoonIcon className="hint-icon" /> : <SunIcon className="hint-icon" />}
                </button>
            </div>
            {children}
        </div>
    );
}