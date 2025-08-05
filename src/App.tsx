import './App.css';
import { useEffect, useState, } from 'react';
import CardWithInput from './components/CardWithInput';



type Settings = {
  hideShorts: boolean;
  hideHomeGrid: boolean;
  hideMasthead: boolean;
  hideFold: boolean;
  hideComments: boolean;
  hideCategoryAndTopic: boolean;
  hideRecommended: boolean;
};

const defaultSettings: Settings = {
  hideShorts: false,
  hideHomeGrid: false,
  hideMasthead: false,
  hideFold: false,
  hideComments: false,
  hideCategoryAndTopic: false,
  hideRecommended: false,
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

        <CardWithInput
          label="Hide Shorts"
          checked={settings.hideShorts}
          onChange={handleToggle('hideShorts')}
        />

        <CardWithInput
          label="Hide home page"
          checked={settings.hideHomeGrid}
          onChange={handleToggle('hideHomeGrid')}
        />

        <CardWithInput
          label="Hide Top Bar"
          checked={settings.hideMasthead}
          onChange={handleToggle('hideMasthead')}
        />

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
