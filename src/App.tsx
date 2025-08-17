import './App.css';
import { useEffect, useState } from 'react';
import CardWithInput from './components/CardWithInput';
import SettingsGroup from './components/SettingsGroup';



type Settings = {
  hideMasthead: boolean;
  hideFold: boolean;
  hideComments: boolean;
  hideCategoryAndTopic: boolean;
  hideRecommended: boolean;
  hideSidebar: boolean;
};

const defaultSettings: Settings = {
  hideMasthead: true,
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
            label="Hide sidebar"
            checked={settings.hideSidebar}
            onChange={handleToggle('hideSidebar')}
          />


          <CardWithInput
            label="Hide top bar"
            checked={settings.hideMasthead}
            onChange={handleToggle('hideMasthead')}
          />
        </SettingsGroup>

        <SettingsGroup title="Video Settings">
          <CardWithInput
            label="Hide video details"
            checked={settings.hideFold}
            onChange={handleToggle('hideFold')}
          />

          <CardWithInput
            label="Hide video comments"
            checked={settings.hideComments}
            onChange={handleToggle('hideComments')}
          />

          <CardWithInput
            label="Hide recommended sidebar"
            checked={settings.hideRecommended}
            onChange={handleToggle('hideRecommended')}
          />

          <CardWithInput
            label="Hide video category/topic"
            checked={settings.hideCategoryAndTopic}
            onChange={handleToggle('hideCategoryAndTopic')}
          />
        </SettingsGroup>
      </div>

      <div className='filter-button-container'>
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
        <button
          onClick={() => {
            Object.keys(defaultSettings).forEach(key => {
              handleToggle(key as keyof Settings)(true);
            });
          }}
          type='button'
        >
          All filters
        </button>
      </div>

      <div className="info-text">
        Settings are saved and auto-applied across YouTube pages.
      </div>
    </div>
  );
}



export default App;
