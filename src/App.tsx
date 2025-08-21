import './App.css';
import { useEffect, useMemo } from 'react';
import CardWithInput from './components/CardWithInput';
import NestedToggle from './components/NestedToggle';
import SettingsGroup from './components/SettingsGroup';
import type { Settings } from './types/global';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { useGlobalContext } from './context/globalContext';

function App() {
  const { settings, handleToggle, setSettings, defaultSettings, saveSettings } = useGlobalContext();

  useEffect(() => {
    function updateFromStorage(result: Partial<Settings>) {
      setSettings({ ...settings, ...result });
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
    // TODO: come back to this dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Helper for Explore cascade
  const allExploreToggled = [
    settings.hideExploreMusic,
    settings.hideExploreMovies,
    settings.hideExploreLive,
    settings.hideExploreGaming,
    settings.hideExploreNews,
    settings.hideExploreSport,
    settings.hideExploreLearning,
    settings.hideExploreFashion,
    settings.hideExplorePodcasts,
    settings.hideExplorePlayables
  ].every(Boolean);

  function toggleAllExplore(checked: boolean) {
    setSettings(prev => {
      const updated: Settings = { ...prev };
      updated.hideExploreMusic = checked;
      updated.hideExploreMovies = checked;
      updated.hideExploreLive = checked;
      updated.hideExploreGaming = checked;
      updated.hideExploreNews = checked;
      updated.hideExploreSport = checked;
      updated.hideExploreLearning = checked;
      updated.hideExploreFashion = checked;
      updated.hideExplorePodcasts = checked;
      updated.hideExplorePlayables = checked;
      updated.hideExplore = checked;
      saveSettings(updated);
      return updated;
    });
  }



  const activeCount = useMemo(() => Object.values(settings).filter(Boolean).length, [settings]);
  const total = Object.keys(settings).length;

  // TODO: Place these sections into components and use context to share state and functionality
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
              <NestedToggle label="Explore" checked={allExploreToggled} onChange={toggleAllExplore} disabled={settings.hideSidebar}>
                <CardWithInput label="Music" checked={settings.hideExploreMusic} onChange={handleToggle('hideExploreMusic')} disabled={settings.hideSidebar} />
                <CardWithInput label="Movies & TV" checked={settings.hideExploreMovies} onChange={handleToggle('hideExploreMovies')} disabled={settings.hideSidebar} />
                <CardWithInput label="Live" checked={settings.hideExploreLive} onChange={handleToggle('hideExploreLive')} disabled={settings.hideSidebar} />
                <CardWithInput label="Gaming" checked={settings.hideExploreGaming} onChange={handleToggle('hideExploreGaming')} disabled={settings.hideSidebar} />
                <CardWithInput label="News" checked={settings.hideExploreNews} onChange={handleToggle('hideExploreNews')} disabled={settings.hideSidebar} />
                <CardWithInput label="Sport" checked={settings.hideExploreSport} onChange={handleToggle('hideExploreSport')} disabled={settings.hideSidebar} />
                <CardWithInput label="Learning" checked={settings.hideExploreLearning} onChange={handleToggle('hideExploreLearning')} disabled={settings.hideSidebar} />
                <CardWithInput label="Fashion & Beauty" checked={settings.hideExploreFashion} onChange={handleToggle('hideExploreFashion')} disabled={settings.hideSidebar} />
                <CardWithInput label="Podcasts" checked={settings.hideExplorePodcasts} onChange={handleToggle('hideExplorePodcasts')} disabled={settings.hideSidebar} />
                <CardWithInput label="Playables" checked={settings.hideExplorePlayables} onChange={handleToggle('hideExplorePlayables')} disabled={settings.hideSidebar} />
              </NestedToggle>
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
