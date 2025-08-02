import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [hideShorts, setHideShorts] = useState(true);
  const [hideHomeGrid, setHideHomeGrid] = useState(false);
  const [hideMasthead, setHideMasthead] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all settings on mount and listen for changes from other tabs/extensions
  useEffect(() => {
    function updateFromStorage(result: { hideShorts?: boolean; hideHomeGrid?: boolean; hideMasthead?: boolean }) {
      setHideShorts(result.hideShorts ?? true);
      setHideHomeGrid(result.hideHomeGrid ?? false);
      setHideMasthead(result.hideMasthead ?? false);
      setLoading(false);
    }
    chrome.storage.sync.get(['hideShorts', 'hideHomeGrid', 'hideMasthead'], updateFromStorage);
    function handleStorageChange(
      _: { [key: string]: chrome.storage.StorageChange },
      areaName: 'sync' | 'local' | 'managed' | 'session'
    ) {
      if (areaName === 'sync') {
        chrome.storage.sync.get(['hideShorts', 'hideHomeGrid', 'hideMasthead'], updateFromStorage);
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Save all settings together, always including all current values
  const saveSettings = (settings: { hideShorts: boolean; hideHomeGrid: boolean; hideMasthead: boolean }) => {
    chrome.storage.sync.set(settings);
  };

  // Handlers
  const handleShortsToggle = () => {
    setHideShorts((prev) => {
      const newVal = !prev;
      saveSettings({ hideShorts: newVal, hideHomeGrid, hideMasthead });
      return newVal;
    });
  };

  const handleHomeGridToggle = () => {
    setHideHomeGrid((prev) => {
      const newVal = !prev;
      saveSettings({ hideShorts, hideHomeGrid: newVal, hideMasthead });
      return newVal;
    });
  };

  const handleMastheadToggle = () => {
    setHideMasthead((prev) => {
      const newVal = !prev;
      saveSettings({ hideShorts, hideHomeGrid, hideMasthead: newVal });
      return newVal;
    });
  };

  return (
    <>
      <h1>Optube</h1>
      <div className="card">
        <h2>YouTube Customizer</h2>
        {loading ? (
          <div>Loading settings...</div>
        ) : (
          <>
            <div className="card-section">
              <label>
                <input type="checkbox" checked={hideShorts} onChange={handleShortsToggle} />
                Hide Shorts
              </label>
            </div>
            <div className="card-section">
              <label>
                <input type="checkbox" checked={hideHomeGrid} onChange={handleHomeGridToggle} />
                Hide Home Page Grid
              </label>
            </div>
            <div className="card-section">
              <label>
                <input type="checkbox" checked={hideMasthead} onChange={handleMastheadToggle} />
                Hide Top Bar
              </label>
            </div>
            <div className="info-text">
              Settings are saved and auto-applied across YouTube pages.
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
