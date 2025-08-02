import './App.css';
import { useEffect, useState } from 'react';

function App() {
  // Persistent settings
  const [hideShorts, setHideShorts] = useState(true);
  const [hideHomeGrid, setHideHomeGrid] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from chrome.storage.sync
  useEffect(() => {
    chrome.storage.sync.get(['hideShorts', 'hideHomeGrid'], (result) => {
      setHideShorts(result.hideShorts ?? true);
      setHideHomeGrid(result.hideHomeGrid ?? false);
      setLoading(false);
    });
  }, []);

  // Save settings to chrome.storage.sync
  const saveSettings = (newSettings: Partial<{ hideShorts: boolean; hideHomeGrid: boolean }>) => {
    chrome.storage.sync.set(newSettings);
  };

  // Handlers
  const handleShortsToggle = () => {
    setHideShorts((prev) => {
      saveSettings({ hideShorts: !prev });
      return !prev;
    });
  };

  const handleHomeGridToggle = () => {
    setHideHomeGrid((prev) => {
      saveSettings({ hideHomeGrid: !prev });
      return !prev;
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
