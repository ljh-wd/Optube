import './App.css';
import { useEffect, useState, useMemo } from 'react';
import CardWithInput from './components/CardWithInput';
import NestedToggle from './components/NestedToggle';
import SettingsGroup from './components/SettingsGroup';
import type { Settings } from './types/global';

const defaultSettings: Settings = {
  hideShorts: false,
  hideSubscriptions: false,
  hideHome: false,
  hideMasthead: false,
  hideSearchbar: false,
  hideNotifications: false,
  hideFold: false,
  hideComments: false,
  hideCategoryAndTopic: false,
  hideRecommended: false,
  hideSidebar: false,
  hideDescription: false,
  hideTitle: false,
  hideCreator: false,
};

function App() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    function updateFromStorage(result: Partial<Settings>) {
      setSettings({ ...defaultSettings, ...result });
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
      if (areaName === 'sync') {
        chrome.storage.sync.get(Object.keys(defaultSettings) as (keyof Settings)[], updateFromStorage);
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const saveSettings = (newSettings: Settings) => {
    chrome.storage.sync.set(newSettings);
  };

  const handleToggle = (key: keyof Settings) => (checked: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: checked };

      // If topbar is being enabled, also enable searchbar and notifications
      if (key === 'hideMasthead' && checked) {
        updated.hideSearchbar = true;
        updated.hideNotifications = true;
      }

      // If topbar is being disabled, also disable searchbar and notifications
      if (key === 'hideMasthead' && !checked) {
        updated.hideSearchbar = false;
        updated.hideNotifications = false;
      }

      // If video details is being enabled, also enable description, title, creator and category/topic
      if (key === 'hideFold' && checked) {
        updated.hideDescription = true;
        updated.hideTitle = true;
        updated.hideCreator = true;
        updated.hideCategoryAndTopic = true;
      }

      // If video details is being disabled, also disable description, title, creator and category/topic
      if (key === 'hideFold' && !checked) {
        updated.hideDescription = false;
        updated.hideTitle = false;
        updated.hideCreator = false;
        updated.hideCategoryAndTopic = false;
      }

      saveSettings(updated);
      return updated;
    });
  };

  const activeCount = useMemo(() => Object.values(settings).filter(Boolean).length, [settings]);
  const total = Object.keys(settings).length;

  return (
    <div className='app-shell'>
      <header className="app-header">
        <div className="brand-block">
          <h1 className="app-title">Optube</h1>
          <p className="tagline">Focus your YouTube experience</p>
        </div>
        <div className="status-pill" aria-label={`Active filters ${activeCount} of ${total}`}>
          <span>{activeCount}</span><span className="divider" />{total}
        </div>
      </header>

      <main className="panels" role="region" aria-label="Settings">
        <SettingsGroup title="Navigation">
          <div className="settings-grid">
            <CardWithInput label="Home" checked={settings.hideHome} onChange={handleToggle('hideHome')} />
            <CardWithInput label="Shorts" checked={settings.hideShorts} onChange={handleToggle('hideShorts')} />
            <CardWithInput label="Subscriptions" checked={settings.hideSubscriptions} onChange={handleToggle('hideSubscriptions')} />
            <CardWithInput label="Sidebar" checked={settings.hideSidebar} onChange={handleToggle('hideSidebar')} />
            <NestedToggle label="Top bar" checked={settings.hideMasthead} onChange={handleToggle('hideMasthead')}>
              <CardWithInput label="Search" checked={settings.hideSearchbar} onChange={handleToggle('hideSearchbar')} disabled={settings.hideMasthead} />
              <CardWithInput label="Notifications" checked={settings.hideNotifications} onChange={handleToggle('hideNotifications')} disabled={settings.hideMasthead} />
            </NestedToggle>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Video">
          <div className="settings-grid">
            <NestedToggle label="Details" checked={settings.hideFold} onChange={handleToggle('hideFold')}>
              <CardWithInput label="Title" checked={settings.hideTitle} onChange={handleToggle('hideTitle')} disabled={settings.hideFold} />
              <CardWithInput label="Creator" checked={settings.hideCreator} onChange={handleToggle('hideCreator')} disabled={settings.hideFold} />
              <CardWithInput label="Description" checked={settings.hideDescription} onChange={handleToggle('hideDescription')} disabled={settings.hideFold} />
              <CardWithInput label="Category / Topic" checked={settings.hideCategoryAndTopic} onChange={handleToggle('hideCategoryAndTopic')} disabled={settings.hideFold} />
            </NestedToggle>
            <CardWithInput label="Comments" checked={settings.hideComments} onChange={handleToggle('hideComments')} />
            <CardWithInput label="Recommended" checked={settings.hideRecommended} onChange={handleToggle('hideRecommended')} />
          </div>
        </SettingsGroup>
      </main>
      <footer className="app-footer">
        <div className="footer-card" role="contentinfo">
          <button
            className="reset-btn"
            onClick={() => {
              Object.keys(defaultSettings).forEach(key => {
                handleToggle(key as keyof Settings)(defaultSettings[key as keyof Settings]);
              });
            }}
            type='button'
          >
            Reset to defaults
          </button>
          <div className="info-text">Settings persist across YouTube pages.</div>
        </div>
      </footer>
    </div>
  );
}



export default App;
