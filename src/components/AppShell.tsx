import type { PropsWithChildren } from "react";
import { useGlobalContext } from '../context/globalContext';
import { SunIcon, MoonIcon, PowerIcon } from '@heroicons/react/24/solid';

export default function AppShell({ children }: PropsWithChildren) {
    const { settings, setSettings, handleToggle } = useGlobalContext();
    const toggleTheme = () => {
        const next: 'light' | 'dark' = (settings.theme === 'light' ? 'dark' : 'light');
        const updated = { ...settings, theme: next };
        setSettings(updated);
        chrome.storage.sync.set(updated);
    };

    const isExtensionEnabled = settings.extensionEnabled !== false;
    const toggleExtension = () => {
        handleToggle('extensionEnabled')(!isExtensionEnabled);
    };

    return (
        <div className='app-shell' data-theme={settings.theme || 'dark'}>
            <div className="app-shell-top">
                <button
                    className={`icon-btn power-icon-btn ${isExtensionEnabled ? 'is-active' : 'is-disabled'}`}
                    onClick={toggleExtension}
                    aria-label={isExtensionEnabled ? 'Disable Optube filters' : 'Enable Optube filters'}
                    aria-pressed={isExtensionEnabled}
                    type='button'
                >
                    <PowerIcon className="hint-icon" />
                </button>
                <button className='icon-btn theme-icon-btn' onClick={toggleTheme} aria-label='Toggle theme' type='button'>
                    {settings.theme === 'light' ? <MoonIcon className="hint-icon" /> : <SunIcon className="hint-icon" />}
                </button>
            </div>
            {children}
        </div>
    );
}