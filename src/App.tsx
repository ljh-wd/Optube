import './App.css';
import { useEffect, useState, useMemo } from 'react';
import CardWithInput from './components/CardWithInput';
import NestedToggle from './components/NestedToggle';
import SettingsGroup from './components/SettingsGroup';
import type { Settings } from './types/global';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

const defaultSettings: Settings = {
  hideShorts: false,
  hideSubscriptions: false,
  hideSubscriptionsSidebar: false,
  hideHome: false,
  hideMasthead: false,
  hideSearchbar: false,
  hideNotifications: false,
  hideCreateButton: false,
  hideFold: false,
  hideComments: false,
  hideCommentAvatars: false,
  hideCategoryAndTopic: false,
  hideRecommended: false,
  hidePosts: false,
  hideSidebar: false,
  hideDescription: false,
  hideTitle: false,
  hideCreator: false,
  // Layout
  hideDurationBadges: false,
  hidePreviewDetails: false,
  hidePreviewAvatars: false,
  hideBadgesChips: false,
  hideWatchedProgress: false,
  hideHoverPreview: false,
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
    // Restoration path: user is turning OFF the hideSidebar flag (showing sidebar again)
    if (key === 'hideSidebar' && !checked) {
      // Showing sidebar again: force ALL nested hides to false (unhide everything)
      setSettings(prev => {
        const updated: Settings = { ...prev, hideSidebar: false };
        updated.hideExplore = false;
        updated.hideMoreFromYouTube = false;
        updated.hideYouSection = false;
        updated.hideHistory = false;
        updated.hidePlaylists = false;
        updated.hideYourVideos = false;
        updated.hideYourCourses = false;
        updated.hideWatchLater = false;
        updated.hideLikedVideos = false;
        saveSettings(updated);
        // Clean any legacy backup key if exists
        chrome.storage.sync.remove('_sidebarNestedBackup');
        return updated;
      });
      return;
    }

    setSettings(prev => {
      const updated: Settings = { ...prev, [key]: checked } as Settings;

      // If topbar is being enabled, also enable searchbar and notifications
      if (key === 'hideMasthead' && checked) {
        updated.hideSearchbar = true;
        updated.hideNotifications = true;
        updated.hideCreateButton = true;
      }

      // If topbar is being disabled, also disable searchbar and notifications
      if (key === 'hideMasthead' && !checked) {
        updated.hideSearchbar = false;
        updated.hideNotifications = false;
        updated.hideCreateButton = false;
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

      // Cascade comment avatars with comments parent
      if (key === 'hideComments' && checked) {
        updated.hideCommentAvatars = true;
      }
      if (key === 'hideComments' && !checked) {
        updated.hideCommentAvatars = false;
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

      // When hiding entire sidebar (checked true), backup current nav states then force-hide all for consistency
      if (key === 'hideSidebar' && checked) {
        // Hiding sidebar: force all nested hides true; we no longer preserve prior states
        updated.hideExplore = true;
        updated.hideMoreFromYouTube = true;
        updated.hideYouSection = true;
        updated.hideHistory = true;
        updated.hidePlaylists = true;
        updated.hideYourVideos = true;
        updated.hideYourCourses = true;
        updated.hideWatchLater = true;
        updated.hideLikedVideos = true;
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
      <div className='hint-container'>
        <InformationCircleIcon className='hint-icon' />
        <p className="hint">Enable filters to customize your view</p>
      </div>
      <main className="panels" role="region" aria-label="Settings">
        <SettingsGroup title="Feeds">
          <div className="settings-grid">
            <CardWithInput label="Home" checked={settings.hideHome} onChange={handleToggle('hideHome')} />
            <CardWithInput label="Shorts" checked={settings.hideShorts} onChange={handleToggle('hideShorts')} />
            <CardWithInput label="Posts" checked={settings.hidePosts} onChange={handleToggle('hidePosts')} />
            <NestedToggle label="Subscriptions" checked={settings.hideSubscriptions} onChange={handleToggle('hideSubscriptions')}>
              <CardWithInput label="Subscription sidebar" checked={settings.hideSubscriptionsSidebar} onChange={handleToggle('hideSubscriptionsSidebar')} disabled={settings.hideSubscriptions} />
            </NestedToggle>
            {/* Explore / More / You moved under Sidebar group */}
          </div>
        </SettingsGroup>

        <SettingsGroup title="Layout">
          <div className="settings-grid">
            <CardWithInput label="Duration badges" checked={settings.hideDurationBadges} onChange={handleToggle('hideDurationBadges')} />
            <CardWithInput label="Duration watched" checked={settings.hideWatchedProgress} onChange={handleToggle('hideWatchedProgress')} />
            <CardWithInput label="Hover preview" checked={settings.hideHoverPreview} onChange={handleToggle('hideHoverPreview')} />
            <NestedToggle label="Video preview details" checked={settings.hidePreviewDetails} onChange={handleToggle('hidePreviewDetails')}>
              <CardWithInput label="Avatars" checked={settings.hidePreviewAvatars} onChange={handleToggle('hidePreviewAvatars')} disabled={settings.hidePreviewDetails} />
            </NestedToggle>
            <CardWithInput label="Filter chips (badges)" checked={settings.hideBadgesChips} onChange={handleToggle('hideBadgesChips')} />
            <NestedToggle label="Top bar" checked={settings.hideMasthead} onChange={handleToggle('hideMasthead')}>
              <CardWithInput label="Search" checked={settings.hideSearchbar} onChange={handleToggle('hideSearchbar')} disabled={settings.hideMasthead} />
              <CardWithInput label="Notifications" checked={settings.hideNotifications} onChange={handleToggle('hideNotifications')} disabled={settings.hideMasthead} />
              <CardWithInput label="Create" checked={settings.hideCreateButton} onChange={handleToggle('hideCreateButton')} disabled={settings.hideMasthead} />
            </NestedToggle>
            <NestedToggle label="Sidebar" checked={settings.hideSidebar} onChange={handleToggle('hideSidebar')}>
              <CardWithInput label="Explore" checked={settings.hideExplore} onChange={handleToggle('hideExplore')} disabled={settings.hideSidebar} />
              <CardWithInput label="More from YouTube" checked={settings.hideMoreFromYouTube} onChange={handleToggle('hideMoreFromYouTube')} disabled={settings.hideSidebar} />
              <NestedToggle label="You" checked={settings.hideYouSection} onChange={handleToggle('hideYouSection')} disabled={settings.hideSidebar}>
                <CardWithInput label="History" checked={settings.hideHistory} onChange={handleToggle('hideHistory')} disabled={settings.hideYouSection || settings.hideSidebar} />
                <CardWithInput label="Playlists" checked={settings.hidePlaylists} onChange={handleToggle('hidePlaylists')} disabled={settings.hideYouSection || settings.hideSidebar} />
                <CardWithInput label="Your videos" checked={settings.hideYourVideos} onChange={handleToggle('hideYourVideos')} disabled={settings.hideYouSection || settings.hideSidebar} />
                <CardWithInput label="Your courses" checked={settings.hideYourCourses} onChange={handleToggle('hideYourCourses')} disabled={settings.hideYouSection || settings.hideSidebar} />
                <CardWithInput label="Watch later" checked={settings.hideWatchLater} onChange={handleToggle('hideWatchLater')} disabled={settings.hideYouSection || settings.hideSidebar} />
                <CardWithInput label="Liked videos" checked={settings.hideLikedVideos} onChange={handleToggle('hideLikedVideos')} disabled={settings.hideYouSection || settings.hideSidebar} />
              </NestedToggle>
            </NestedToggle>
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
            <NestedToggle label="Comments" checked={settings.hideComments} onChange={handleToggle('hideComments')}>
              <CardWithInput label="Avatars" checked={settings.hideCommentAvatars} onChange={handleToggle('hideCommentAvatars')} disabled={settings.hideComments} />
            </NestedToggle>
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
              chrome.storage.sync.remove('_sidebarNestedBackup');
            }}
            type='button'
          >
            Reset filters
          </button>
          <div className="info-text">Settings persist across YouTube pages.</div>
        </div>
      </footer>
    </div>
  );
}



export default App;
