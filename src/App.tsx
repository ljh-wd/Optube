
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  // Persistent settings
  const [hideShorts, setHideShorts] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load settings from chrome.storage.sync
  useEffect(() => {
    chrome.storage.sync.get(['hideShorts'], (result) => {
      setHideShorts(result.hideShorts ?? true);
      setLoading(false);
    });
  }, []);

  // Save settings to chrome.storage.sync
  const saveSettings = (newSettings: Partial<{ hideShorts: boolean; }>) => {
    chrome.storage.sync.set(newSettings);
  };

  // Handler
  const handleShortsToggle = () => {
    setHideShorts((prev) => {
      saveSettings({ hideShorts: !prev });
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
