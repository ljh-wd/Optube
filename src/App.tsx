import './App.css';
import { useEffect, useState } from 'react';


function App() {
  // Persistent settings
  const [hideShorts, setHideShorts] = useState(true);
  const [minDuration, setMinDuration] = useState(10); // minutes
  const [hideLiveNow, setHideLiveNow] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from chrome.storage.sync
  useEffect(() => {
    chrome.storage.sync.get(['hideShorts', 'minDuration', 'hideLiveNow'], (result) => {
      setHideShorts(result.hideShorts ?? true);
      setMinDuration(result.minDuration ?? 10);
      setHideLiveNow(result.hideLiveNow ?? false);
      setLoading(false);
    });
  }, []);

  // Save settings to chrome.storage.sync
  const saveSettings = (newSettings: Partial<{ hideShorts: boolean; minDuration: number; hideLiveNow: boolean; }>) => {
    chrome.storage.sync.set(newSettings);
  };

  // Handlers
  const handleShortsToggle = () => {
    setHideShorts((prev) => {
      saveSettings({ hideShorts: !prev });
      return !prev;
    });
  };
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setMinDuration(value);
    saveSettings({ minDuration: value });
  };
  const handleLiveNowToggle = () => {
    setHideLiveNow((prev) => {
      saveSettings({ hideLiveNow: !prev });
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
                Minimum video duration:
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={minDuration}
                  onChange={handleDurationChange}
                  className="slider"
                />
                <span>{minDuration} min</span>
              </label>
            </div>
            <div className="card-section">
              <label>
                <input type="checkbox" checked={hideLiveNow} onChange={handleLiveNowToggle} />
                Hide "Live Now" section
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
