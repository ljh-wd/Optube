
// Utility function for robust element removal
// Hide or show elements by selector, optionally filtered, optionally by parent


function setElementsVisibility(
  selector: string,
  hide: boolean,
  filterFn?: (el: Element) => boolean,
  parentSelector?: string
): void {
  document.querySelectorAll(selector).forEach((el: Element) => {
    if (!filterFn || filterFn(el)) {
      let target: Element = el;
      if (parentSelector) {
        const parent = el.closest(parentSelector);
        if (parent) target = parent;
      }
      if (hide) {
        target.setAttribute('data-optube-hidden', 'true');
        (target as HTMLElement).style.display = 'none';
      } else {
        if (target.getAttribute('data-optube-hidden') === 'true') {
          (target as HTMLElement).style.display = '';
          target.removeAttribute('data-optube-hidden');
        }
      }
    }
  });
}

// Shorts removal logic from previous repo


function setShortsVisibility(hide: boolean): void {
  // Homepage Shorts
  setElementsVisibility(
    'ytd-rich-section-renderer',
    hide,
    (section: Element) => {
      const title = section.querySelector('h2');
      return !!(title && title.innerText.toLowerCase().includes('shorts'));
    },
    undefined
  );
  // Sidebar Shorts
  setElementsVisibility(
    'ytd-guide-entry-renderer',
    hide,
    (entry: Element) => {
      const textContent = entry.textContent?.toLowerCase().trim();
      return !!(textContent && textContent.includes('shorts'));
    },
    undefined
  );
  // Mobile Shorts
  setElementsVisibility(
    'a',
    hide,
    (link: Element) => link.textContent?.toLowerCase().trim() === 'shorts',
    undefined
  );
  // Responsive Shorts
  setElementsVisibility(
    '*',
    hide,
    (el: Element) => el.textContent?.trim().toLowerCase() === 'shorts',
    'ytd-mini-guide-entry-renderer, ytd-guide-entry-renderer, tp-yt-paper-item, a'
  );
  // Search Shorts
  setElementsVisibility(
    'yt-section-header-view-model, yt-shelf-header-layout',
    hide,
    undefined,
    'ytd-item-section-renderer, ytd-shelf-renderer, .ytSectionHeaderViewModelHost, .shelf-header-layout-wiz'
  );
  setElementsVisibility(
    '.ytGridShelfViewModelGridShelfRow',
    hide,
    undefined,
    undefined
  );
  setElementsVisibility(
    'ytm-shorts-lockup-view-model-v2, ytm-shorts-lockup-view-model',
    hide,
    undefined,
    undefined
  );
  setElementsVisibility(
    'a[href^="/shorts/"]',
    hide,
    undefined,
    'ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, .ytGridShelfViewModelGridShelfItem, .shortsLockupViewModelHost'
  );
  setElementsVisibility(
    'h2, h3, span',
    hide,
    (el: Element) => el.textContent?.trim().toLowerCase() === 'shorts',
    'ytd-item-section-renderer, ytd-shelf-renderer, .ytGridShelfViewModelGridShelfRow, .ytSectionHeaderViewModelHost'
  );
  setElementsVisibility(
    'ytd-reel-shelf-renderer, ytd-reel-item-renderer',
    hide,
    undefined,
    undefined
  );
}

function hideLiveNow() {
  document.querySelectorAll('ytd-rich-section-renderer:has([aria-label*="Live Now"])').forEach(el => (el as HTMLElement).style.display = 'none');
}


// Removed filterByDuration function

function cleanYouTube(settings: { hideShorts?: boolean; hideLiveNow?: boolean; minDuration?: number }) {
  setShortsVisibility(!!settings.hideShorts);
  if (settings.hideLiveNow) hideLiveNow();
  // Removed minDuration filter
}

function run() {
  chrome.storage.sync.get(['hideShorts', 'hideLiveNow'], (settings) => {
    cleanYouTube(settings);
  });
}

// MutationObserver for robust SPA support


let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const observer = new MutationObserver(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(run, 100);
});

function startObserver() {
  if (!document.body) {
    return setTimeout(startObserver, 10);
  }
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initial run
run();
startObserver();

// Listen for settings changes
chrome.storage.onChanged.addListener((_, area) => {
  if (area === 'sync') {
    setTimeout(run, 100);
  }
});
function log() {
  console.log("Optube content script loaded.");
}

log();