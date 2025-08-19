import { observeMasthead, setMastheadVisibility, observeSearchbar, setSearchbarVisibility, observeNotifications, setNotificationsVisibility } from './utils/topBar';
import { observeCategoryAndTopic, observeComments, observeFold, observeRecommended, observeDescription, observeTitle, observeCreator, setCategoryAndTopicVisibility, setCommentsVisibility, setFoldVisibility, setRecommendedVisibility, setDescriptionVisibility, setTitleVisibility, setCreatorVisibility } from './utils/video';
import { observeSidebar, setSidebarVisibility } from './utils/sidebar';
import type { Settings } from './types/global';
import { observeShorts, setShortsVisibility, injectShortsCSS } from './utils/shorts';
import { observeHome, setHomeVisibility, injectHomeCSS } from './utils/home';
import { observeSubscriptions, setSubscriptionsVisibility, injectSubscriptionsCSS } from './utils/subscriptions';

function cleanYouTube(settings: Settings): void {
  setShortsVisibility(!!settings.hideShorts);
  setHomeVisibility(!!settings.hideHome);
  setSubscriptionsVisibility(!!settings.hideSubscriptions);
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
}

function run(): void {
  chrome.storage.sync.get(['hideShorts', 'hideHome', 'hideSubscriptions', 'hideMasthead', 'hideSearchbar', 'hideNotifications', 'hideFold', 'hideComments', 'hideCategoryAndTopic', 'hideRecommended', 'hideSidebar', 'hideDescription', 'hideTitle', 'hideCreator'], cleanYouTube);
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
    (changes.hideShorts || changes.hideHome || changes.hideSubscriptions || changes.hideMasthead || changes.hideSearchbar || changes.hideNotifications || changes.hideFold || changes.hideComments || changes.hideCategoryAndTopic || changes.hideRecommended || changes.hideSidebar || changes.hideDescription || changes.hideTitle || changes.hideCreator)
  ) {
    setTimeout(() => {
      run();
    }, 0);
  }
});

observeShorts();
observeHome();
observeSubscriptions();
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

