import './App.css';
import { useEffect, useState, useMemo } from 'react';
import CardWithInput from './components/CardWithInput';
import NestedToggle from './components/NestedToggle';
import SettingsGroup from './components/SettingsGroup';
import type { Settings } from './types/global';

const defaultSettings: Settings = {
  hideShorts: false,
  hideSubscriptions: false,
  hideSubscriptionsSidebar: false,
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
  // Layout
  hideDurationBadges: false,
  hideLiveChannels: false,
  hidePreviewDetails: false,
  hidePreviewAvatars: false,
  hideBadgesChips: false,
  // Navigation additions
  hideExplore: false,
  hideMoreFromYouTube: false,
  hideYouSection: false,
  hidePlaylists: false,
  hideYourVideos: false,
  hideYourCourses: false,
  hideWatchLater: false,
  hideLikedVideos: false,
  hideHistory: false,
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

      // If subscriptions is being enabled, also enable subscriptions sidebar
      if (key === 'hideSubscriptions' && checked) {
        updated.hideSubscriptionsSidebar = true;
      }

      // If subscriptions is being disabled, also disable subscriptions sidebar
      if (key === 'hideSubscriptions' && !checked) {
        updated.hideSubscriptionsSidebar = false;
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

      // If preview details (layout) is enabled, also enable preview avatars automatically
      if (key === 'hidePreviewDetails' && checked) {
        updated.hidePreviewAvatars = true;
      }
      if (key === 'hidePreviewDetails' && !checked) {
        updated.hidePreviewAvatars = false;
      }

      // If 'You' section is toggled, cascade to its children
      if (key === 'hideYouSection' && checked) {
        updated.hideHistory = true;
        updated.hidePlaylists = true;
        updated.hideYourVideos = true;
        updated.hideYourCourses = true;
        updated.hideWatchLater = true;
        updated.hideLikedVideos = true;
      }
      if (key === 'hideYouSection' && !checked) {
        updated.hideHistory = false;
        updated.hidePlaylists = false;
        updated.hideYourVideos = false;
        updated.hideYourCourses = false;
        updated.hideWatchLater = false;
        updated.hideLikedVideos = false;
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
            <NestedToggle label="Subscriptions" checked={settings.hideSubscriptions} onChange={handleToggle('hideSubscriptions')}>
              <CardWithInput label="Subscription sidebar" checked={settings.hideSubscriptionsSidebar} onChange={handleToggle('hideSubscriptionsSidebar')} disabled={settings.hideSubscriptions} />
            </NestedToggle>
            <CardWithInput label="Sidebar" checked={settings.hideSidebar} onChange={handleToggle('hideSidebar')} />
            <NestedToggle label="Top bar" checked={settings.hideMasthead} onChange={handleToggle('hideMasthead')}>
              <CardWithInput label="Search" checked={settings.hideSearchbar} onChange={handleToggle('hideSearchbar')} disabled={settings.hideMasthead} />
              <CardWithInput label="Notifications" checked={settings.hideNotifications} onChange={handleToggle('hideNotifications')} disabled={settings.hideMasthead} />
            </NestedToggle>
            <CardWithInput label="Explore" checked={settings.hideExplore} onChange={handleToggle('hideExplore')} />
            <CardWithInput label="More from YouTube" checked={settings.hideMoreFromYouTube} onChange={handleToggle('hideMoreFromYouTube')} />
            <NestedToggle label="You" checked={settings.hideYouSection} onChange={handleToggle('hideYouSection')}>
              <CardWithInput label="History" checked={settings.hideHistory} onChange={handleToggle('hideHistory')} disabled={settings.hideYouSection} />
              <CardWithInput label="Playlists" checked={settings.hidePlaylists} onChange={handleToggle('hidePlaylists')} disabled={settings.hideYouSection} />
              <CardWithInput label="Your videos" checked={settings.hideYourVideos} onChange={handleToggle('hideYourVideos')} disabled={settings.hideYouSection} />
              <CardWithInput label="Your courses" checked={settings.hideYourCourses} onChange={handleToggle('hideYourCourses')} disabled={settings.hideYouSection} />
              <CardWithInput label="Watch later" checked={settings.hideWatchLater} onChange={handleToggle('hideWatchLater')} disabled={settings.hideYouSection} />
              <CardWithInput label="Liked videos" checked={settings.hideLikedVideos} onChange={handleToggle('hideLikedVideos')} disabled={settings.hideYouSection} />
            </NestedToggle>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Layout">
          <div className="settings-grid">
            <CardWithInput label="Duration badges" checked={settings.hideDurationBadges} onChange={handleToggle('hideDurationBadges')} />
            <CardWithInput label="Live channels" checked={settings.hideLiveChannels} onChange={handleToggle('hideLiveChannels')} />
            <NestedToggle label="Video preview details" checked={settings.hidePreviewDetails} onChange={handleToggle('hidePreviewDetails')}>
              <CardWithInput label="Avatars" checked={settings.hidePreviewAvatars} onChange={handleToggle('hidePreviewAvatars')} disabled={settings.hidePreviewDetails} />
            </NestedToggle>
            <CardWithInput label="Filter chips (badges)" checked={settings.hideBadgesChips} onChange={handleToggle('hideBadgesChips')} />
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
