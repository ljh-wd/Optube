import { observeMasthead, setMastheadVisibility, observeSearchbar, setSearchbarVisibility } from './utils/topBar';
import { observeCategoryAndTopic, observeComments, observeFold, observeRecommended, setCategoryAndTopicVisibility, setCommentsVisibility, setFoldVisibility, setRecommendedVisibility } from './utils/video';
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
  setCommentsVisibility(!!settings.hideComments);
  setFoldVisibility(!!settings.hideFold);
  setCategoryAndTopicVisibility(!!settings.hideCategoryAndTopic);
  setRecommendedVisibility(!!settings.hideRecommended);
  setSidebarVisibility(!!settings.hideSidebar);
}

function run(): void {
  chrome.storage.sync.get(['hideShorts', 'hideHome', 'hideSubscriptions', 'hideMasthead', 'hideSearchbar', 'hideFold', 'hideComments', 'hideCategoryAndTopic', 'hideRecommended', 'hideSidebar'], cleanYouTube);
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
    (changes.hideShorts || changes.hideHome || changes.hideSubscriptions || changes.hideMasthead || changes.hideSearchbar || changes.hideFold || changes.hideComments || changes.hideCategoryAndTopic || changes.hideRecommended || changes.hideSidebar)
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
observeFold();
observeComments();
observeCategoryAndTopic();
observeRecommended();
observeSidebar();

