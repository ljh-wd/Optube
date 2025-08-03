import './App.css';
import { forwardRef, useEffect, useState, type ComponentPropsWithRef, type ForwardedRef } from 'react';

function App() {
  const [hideShorts, setHideShorts] = useState(false);
  const [hideHomeGrid, setHideHomeGrid] = useState(false);
  const [hideMasthead, setHideMasthead] = useState(false);
  const [hideFold, setHideFold] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all settings on mount and listen for changes from other tabs/extensions
  useEffect(() => {
    function updateFromStorage(result: { hideShorts?: boolean; hideHomeGrid?: boolean; hideMasthead?: boolean; hideFold?: boolean }) {
      setHideShorts(result.hideShorts ?? false);
      setHideHomeGrid(result.hideHomeGrid ?? false);
      setHideMasthead(result.hideMasthead ?? false);
      setHideFold(result.hideFold ?? false);
      setLoading(false);
    }
    chrome.storage.sync.get(['hideShorts', 'hideHomeGrid', 'hideMasthead', 'hideFold'], updateFromStorage);
    function handleStorageChange(
      _: { [key: string]: chrome.storage.StorageChange },
      areaName: 'sync' | 'local' | 'managed' | 'session'
    ) {
      if (areaName === 'sync') {
        chrome.storage.sync.get(['hideShorts', 'hideHomeGrid', 'hideMasthead', 'hideFold'], updateFromStorage);
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
    // TODO: need some dependencies, or better yet, avoid useEffect entirely.
  }, []);


  const settings = { hideShorts, hideHomeGrid, hideMasthead, hideFold };

  // Save all settings together, always including all current values
  const saveSettings = (settings: { hideShorts: boolean; hideHomeGrid: boolean; hideMasthead: boolean, hideFold: boolean }) => {
    chrome.storage.sync.set(settings);
  };

  // Handlers
  const handleShortsToggle = () => {
    setHideShorts((prev) => {
      const newVal = !prev;
      saveSettings({ ...settings, hideShorts: newVal });
      return newVal;
    });
  };

  const handleHomeGridToggle = () => {
    setHideHomeGrid((prev) => {
      const newVal = !prev;
      saveSettings({ ...settings, hideHomeGrid: newVal });
      return newVal;
    });
  };

  const handleMastheadToggle = () => {
    setHideMasthead((prev) => {
      const newVal = !prev;
      saveSettings({ ...settings, hideMasthead: newVal });
      return newVal;
    });
  };

  const handleVideoDetailsToggle = () => {
    setHideFold((prev) => {
      const newVal = !prev;
      saveSettings({ ...settings, hideFold: newVal });
      return newVal;
    });
  };

  return (
    <div>
      <h1>Optube</h1>
      <h2>YouTube utility</h2>
      {loading ? (
        <p>Loading settings...</p>
      ) : (
        <>
          <CardWithInput
            label="Hide Shorts"
            checked={hideShorts}
            onChange={handleShortsToggle}
          />

          <CardWithInput
            label="Hide home page"
            checked={hideHomeGrid}
            onChange={handleHomeGridToggle}
          />

          <CardWithInput
            label="Hide Top Bar"
            checked={hideMasthead}
            onChange={handleMastheadToggle}
          />

          <CardWithInput
            label="Toggle video details"
            checked={hideFold}
            onChange={handleVideoDetailsToggle}
          />

          <div className="info-text">
            Settings are saved and auto-applied across YouTube pages.
          </div>
        </>
      )}
    </div>
  );
}

type Props = ComponentPropsWithRef<'input'> & { label: string, ref: ForwardedRef<HTMLInputElement> }

const CardWithInput = forwardRef<HTMLInputElement, Props>(
  function CardWithInput({ label, checked, onChange }, ref) {
    return (
      <div className="card-section">
        <label>
          <input ref={ref} type="checkbox" checked={checked} onChange={onChange} />
          {label}
        </label>
      </div>
    );
  })

export default App;
