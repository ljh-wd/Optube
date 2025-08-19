import './App.css';
import { useEffect, useState } from 'react';
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

      saveSettings(updated);
      return updated;
    });
  };

  return (
    <div className='container'>
      <h1>Optube</h1>
      <h2>YouTube utility</h2>

      <div className='card'>

        <SettingsGroup title="Navigation" >
          <CardWithInput
            label="Toggle home"
            checked={settings.hideHome}
            onChange={handleToggle('hideHome')}
          />

          <CardWithInput
            label="Toggle shorts"
            checked={settings.hideShorts}
            onChange={handleToggle('hideShorts')}
          />

          <CardWithInput
            label="Toggle subscriptions"
            checked={settings.hideSubscriptions}
            onChange={handleToggle('hideSubscriptions')}
          />

          <CardWithInput
            label="Toggle sidebar"
            checked={settings.hideSidebar}
            onChange={handleToggle('hideSidebar')}
          />

          <NestedToggle
            label="Toggle top bar"
            checked={settings.hideMasthead}
            onChange={handleToggle('hideMasthead')}
          >
            <CardWithInput
              label="Toggle searchbar"
              checked={settings.hideSearchbar}
              onChange={handleToggle('hideSearchbar')}
              disabled={settings.hideMasthead}
            />
            <CardWithInput
              label="Toggle notifications"
              checked={settings.hideNotifications}
              onChange={handleToggle('hideNotifications')}
              disabled={settings.hideMasthead}
            />
          </NestedToggle>
        </SettingsGroup>

        <SettingsGroup title="Video Settings">
          <CardWithInput
            label="Toggle video details"
            checked={settings.hideFold}
            onChange={handleToggle('hideFold')}
          />

          <CardWithInput
            label="Toggle video comments"
            checked={settings.hideComments}
            onChange={handleToggle('hideComments')}
          />

          <CardWithInput
            label="Toggle recommended"
            checked={settings.hideRecommended}
            onChange={handleToggle('hideRecommended')}
          />

          <CardWithInput
            label="Toggle category/topic"
            checked={settings.hideCategoryAndTopic}
            onChange={handleToggle('hideCategoryAndTopic')}
          />
        </SettingsGroup>
      </div>

      <button
        onClick={() => {
          Object.keys(defaultSettings).forEach(key => {
            handleToggle(key as keyof Settings)(defaultSettings[key as keyof Settings]);
          });
        }}
        type='button'
      >
        Clear filters
      </button>


      <div className="info-text">
        Settings are saved and auto-applied across YouTube pages.
      </div>
    </div>
  );
}



export default App;
