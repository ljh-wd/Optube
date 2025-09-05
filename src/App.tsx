import './App.css';
import { useEffect } from 'react';

import type { Settings } from './types/global';
import { useGlobalContext } from './context/globalContext';
import Header from './components/Header';
import Hint from './components/Hint';
import Panels from './components/Panels';
import Feeds from './components/Sections/Feeds';
import Layout from './components/Sections/Layout';
import Video from './components/Sections/Video';
import UI from './components/Sections/UI';
import Footer from './components/Footer';
import AppShell from './components/AppShell';

function App() {
    const { settings, setSettings, defaultSettings } = useGlobalContext();

    useEffect(() => {
        function updateFromStorage(result: Partial<Settings>) {
            setSettings({ ...settings, ...result });
        }

        chrome.storage.sync.get(
            Object.entries(defaultSettings).reduce(
                (acc, [key, value]) => ({ ...acc, [key]: value }),
                {} as Record<string, boolean>
            ),
            updateFromStorage
        );

        function handleStorageChange(
            _: { [key: string]: chrome.storage.StorageChange },
            areaName: 'sync' | 'local' | 'managed' | 'session'
        ) {
            if (areaName === 'sync') chrome.storage.sync.get(Object.keys(defaultSettings) as (keyof Settings)[], updateFromStorage);
        }

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, [defaultSettings, setSettings, settings]);

    return (
        <AppShell>
            <Header />

            <Hint>Enable filters to customize your view.</Hint>
            <Panels>
                <Feeds />
                <UI />
                <Layout />
                <Video />
            </Panels>

            <Footer />
        </AppShell>
    );
}

export default App;