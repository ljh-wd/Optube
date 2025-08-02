import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [hideShorts, setHideShorts] = useState(true);
  const [hideHomeGrid, setHideHomeGrid] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['hideShorts', 'hideHomeGrid'], (result) => {
      setHideShorts(result.hideShorts ?? true);
      setHideHomeGrid(result.hideHomeGrid ?? false);
      setLoading(false);
    });
  }, []);

  // Save all settings together
  const saveSettings = (settings: { hideShorts: boolean; hideHomeGrid: boolean }) => {
    chrome.storage.sync.set(settings);
  };

  // Handlers
  const handleShortsToggle = () => {
    setHideShorts((prev) => {
      const newVal = !prev;
      saveSettings({ hideShorts: newVal, hideHomeGrid });
      return newVal;
    });
  };

  const handleHomeGridToggle = () => {
    setHideHomeGrid((prev) => {
      const newVal = !prev;
      saveSettings({ hideShorts, hideHomeGrid: newVal });
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
