import { removeElementsByText } from './utils/global';
import { observeMasthead, setMastheadVisibility } from './utils/topBar';
import { observeCategoryAndTopic, observeComments, observeFold, observeRecommended, setCategoryAndTopicVisibility, setCommentsVisibility, setFoldVisibility, setRecommendedVisibility } from './utils/video';
import { observeSidebar, setSidebarVisibility } from './utils/sidebar';

function cleanYouTube(settings: { hideHomeNav?: boolean; hideMasthead?: boolean, hideFold?: boolean, hideComments?: boolean, hideCategoryAndTopic?: boolean, hideRecommended?: boolean, hideSidebar?: boolean }): void {
  setMastheadVisibility(!!settings.hideMasthead);
  setCommentsVisibility(!!settings.hideComments);
  setFoldVisibility(!!settings.hideFold);
  setCategoryAndTopicVisibility(!!settings.hideCategoryAndTopic);
  setRecommendedVisibility(!!settings.hideRecommended);
  setSidebarVisibility(!!settings.hideSidebar);
}

function run(): void {
  chrome.storage.sync.get(['hideHomeNav', 'hideMasthead', 'hideFold', 'hideComments', 'hideCategoryAndTopic', 'hideRecommended', 'hideSidebar'], cleanYouTube);
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

chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === 'sync' &&
    (changes.hideHomeNav || changes.hideMasthead || changes.hideFold || changes.hideComments || changes.hideCategoryAndTopic || changes.hideRecommended || changes.hideSidebar)
  ) {
    setTimeout(() => {
      run();
    }, 0);
  }
});

// Remove from any anchor links with text "Home"
removeElementsByText('a', 'home');
// Remove from mini guide and sidebar
removeElementsByText('ytd-guide-entry-renderer', 'home');
removeElementsByText('ytd-mini-guide-entry-renderer', 'home');

observeMasthead();
observeFold();
observeComments();
observeCategoryAndTopic();
observeRecommended();
observeSidebar();
