import { observeMasthead, setMastheadVisibility, observeSearchbar, setSearchbarVisibility, observeNotifications, setNotificationsVisibility } from './utils/topBar';
import { observeCategoryAndTopic, observeComments, observeFold, observeRecommended, observeDescription, observeTitle, observeCreator, setCategoryAndTopicVisibility, setCommentsVisibility, setFoldVisibility, setRecommendedVisibility, setDescriptionVisibility, setTitleVisibility, setCreatorVisibility } from './utils/video';
import { observeSidebar, setSidebarVisibility } from './utils/sidebar';
import type { Settings } from './types/global';
import { observeShorts, setShortsVisibility, injectShortsCSS } from './utils/shorts';
import { observeHome, setHomeVisibility, injectHomeCSS } from './utils/home';
import { observeSubscriptions, observeSubscriptionsSidebar, setSubscriptionsVisibility, setSubscriptionsSidebarVisibility, injectSubscriptionsCSS } from './utils/subscriptions';
import { applyLayout, injectLayoutCSS, observeLayout } from './utils/layout';
import { applyNavigation, observeNavigation } from './utils/navigation';

function cleanYouTube(settings: Settings): void {
  setShortsVisibility(!!settings.hideShorts);
  setHomeVisibility(!!settings.hideHome);
  setSubscriptionsVisibility(!!settings.hideSubscriptions);
  setSubscriptionsSidebarVisibility(!!settings.hideSubscriptionsSidebar);
  setMastheadVisibility(!!settings.hideMasthead);
  setSearchbarVisibility(!!settings.hideSearchbar);
  setNotificationsVisibility(!!settings.hideNotifications);
  setCommentsVisibility(!!settings.hideComments);
  setFoldVisibility(!!settings.hideFold);
  setCategoryAndTopicVisibility(!!settings.hideCategoryAndTopic);
  setRecommendedVisibility(!!settings.hideRecommended);
  setSidebarVisibility(!!settings.hideSidebar);
  setDescriptionVisibility(!!settings.hideDescription);
  setTitleVisibility(!!settings.hideTitle);
  setCreatorVisibility(!!settings.hideCreator);
  applyLayout({
    hideDurationBadges: settings.hideDurationBadges,
    hidePreviewDetails: settings.hidePreviewDetails,
    hidePreviewAvatars: settings.hidePreviewAvatars,
    hideBadgesChips: settings.hideBadgesChips,
  });
  applyNavigation({
    hideExplore: settings.hideExplore,
    hideMoreFromYouTube: settings.hideMoreFromYouTube,
    hideYouSection: settings.hideYouSection,
    hideHistory: settings.hideHistory,
    hidePlaylists: settings.hidePlaylists,
    hideYourVideos: settings.hideYourVideos,
    hideYourCourses: settings.hideYourCourses,
    hideWatchLater: settings.hideWatchLater,
    hideLikedVideos: settings.hideLikedVideos,
  });
}

function run(): void {
  chrome.storage.sync.get([
    'hideShorts', 'hideHome', 'hideSubscriptions', 'hideSubscriptionsSidebar', 'hideMasthead', 'hideSearchbar', 'hideNotifications', 'hideFold', 'hideComments', 'hideCategoryAndTopic', 'hideRecommended', 'hideSidebar', 'hideDescription', 'hideTitle', 'hideCreator',
    'hideDurationBadges', 'hidePreviewDetails', 'hidePreviewAvatars', 'hideBadgesChips',
    'hideExplore', 'hideMoreFromYouTube', 'hideYouSection', 'hideHistory', 'hidePlaylists', 'hideYourVideos', 'hideYourCourses', 'hideWatchLater', 'hideLikedVideos'
  ], cleanYouTube);
}

let debounceId: number | null = null;

const observer = new MutationObserver(() => {
  if (debounceId) {
    clearTimeout(debounceId);
    debounceId = window.setTimeout(() => {
      run();
    }, 0);
  }
});

function startObserver(): void {
  if (!document.body) {
    setTimeout(() => startObserver(), 10);
    return;
  }
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

window.addEventListener('load', run);
run();
startObserver();

// Inject CSS for shorts, home, and subscriptions hiding
injectShortsCSS();
injectHomeCSS();
injectSubscriptionsCSS();

chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === 'sync' &&
    (changes.hideShorts || changes.hideHome || changes.hideSubscriptions || changes.hideSubscriptionsSidebar || changes.hideMasthead || changes.hideSearchbar || changes.hideNotifications || changes.hideFold || changes.hideComments || changes.hideCategoryAndTopic || changes.hideRecommended || changes.hideSidebar || changes.hideDescription || changes.hideTitle || changes.hideCreator ||
      changes.hideDurationBadges || changes.hidePreviewDetails || changes.hidePreviewAvatars || changes.hideBadgesChips ||
      changes.hideExplore || changes.hideMoreFromYouTube || changes.hideYouSection || changes.hideHistory || changes.hidePlaylists || changes.hideYourVideos || changes.hideYourCourses || changes.hideWatchLater || changes.hideLikedVideos)
  ) {
    setTimeout(() => {
      run();
    }, 0);
  }
});

observeShorts();
observeHome();
observeSubscriptions();
observeSubscriptionsSidebar();
observeMasthead();
observeSearchbar();
observeNotifications();
observeFold();
observeComments();
observeCategoryAndTopic();
observeRecommended();
observeSidebar();
observeDescription();
observeTitle();
observeCreator();
observeLayout();
observeNavigation();

// Inject layout CSS last
injectLayoutCSS();

