
// Utility function for robust element removal
// Hide or show elements by selector, optionally filtered, optionally by parent
function setElementsVisibility(selector, filterFn, parentSelector, hide) {
  document.querySelectorAll(selector).forEach(el => {
    if (!filterFn || filterFn(el)) {
      let target = el;
      if (parentSelector) {
        const parent = el.closest(parentSelector);
        if (parent) target = parent;
      }
      if (hide) {
        target.setAttribute('data-optube-hidden', 'true');
        target.style.display = 'none';
      } else {
        if (target.getAttribute('data-optube-hidden') === 'true') {
          target.style.display = '';
          target.removeAttribute('data-optube-hidden');
        }
      }
    }
  });
}

// Shorts removal logic from previous repo
function setShortsVisibility(hide) {
  // Homepage Shorts
  setElementsVisibility('ytd-rich-section-renderer', section => {
    const title = section.querySelector('h2');
    return !!(title && title.innerText.toLowerCase().includes('shorts'));
  }, undefined, hide);
  // Sidebar Shorts
  setElementsVisibility('ytd-guide-entry-renderer', entry => {
    const textContent = entry.textContent?.toLowerCase().trim();
    return !!(textContent && textContent.includes('shorts'));
  }, undefined, hide);
  // Mobile Shorts
  setElementsVisibility('a', link => link.textContent?.toLowerCase().trim() === 'shorts', undefined, hide);
  // Responsive Shorts
  setElementsVisibility('*', el => el.textContent?.trim().toLowerCase() === 'shorts',
    'ytd-mini-guide-entry-renderer, ytd-guide-entry-renderer, tp-yt-paper-item, a', hide);
  // Search Shorts
  setElementsVisibility('yt-section-header-view-model, yt-shelf-header-layout', undefined,
    'ytd-item-section-renderer, ytd-shelf-renderer, .ytSectionHeaderViewModelHost, .shelf-header-layout-wiz', hide);
  setElementsVisibility('.ytGridShelfViewModelGridShelfRow', undefined, undefined, hide);
  setElementsVisibility('ytm-shorts-lockup-view-model-v2, ytm-shorts-lockup-view-model', undefined, undefined, hide);
  setElementsVisibility('a[href^="/shorts/"]', undefined,
    'ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, .ytGridShelfViewModelGridShelfItem, .shortsLockupViewModelHost', hide);
  setElementsVisibility('h2, h3, span', el => el.textContent?.trim().toLowerCase() === 'shorts',
    'ytd-item-section-renderer, ytd-shelf-renderer, .ytGridShelfViewModelGridShelfRow, .ytSectionHeaderViewModelHost', hide);
  setElementsVisibility('ytd-reel-shelf-renderer, ytd-reel-item-renderer', undefined, undefined, hide);
}

function hideLiveNow() {
  document.querySelectorAll('ytd-rich-section-renderer:has([aria-label*="Live Now"])').forEach(el => el.style.display = 'none');
}

function filterByDuration(minMinutes) {
  const videoRenderers = [
    ...document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer')
  ];
  videoRenderers.forEach(el => {
    // Always reset display before filtering
    el.style.display = '';
    const timeBadge = el.querySelector('ytd-thumbnail-overlay-time-status-renderer');
    if (timeBadge) {
      const timeText = timeBadge.innerText.trim();
      // Match HH:MM:SS, H:MM:SS, MM:SS, M:SS
      const match = timeText.match(/^(?:(\d+):)?(\d+):(\d+)$/);
      if (match) {
        let hours = 0, mins = 0, secs = 0;
        if (match.length === 4) {
          hours = parseInt(match[1] || '0', 10);
          mins = parseInt(match[2], 10);
          secs = parseInt(match[3], 10);
        } else if (match.length === 3) {
          mins = parseInt(match[1], 10);
          secs = parseInt(match[2], 10);
        }
        const totalMins = hours * 60 + mins + secs / 60;
        if (totalMins < minMinutes) {
          el.style.display = 'none';
        }
      }
    }
  });
}

function cleanYouTube(settings) {
  setShortsVisibility(!!settings.hideShorts);
  if (settings.hideLiveNow) hideLiveNow();
  if (settings.minDuration) filterByDuration(settings.minDuration);
}

function run() {
  chrome.storage.sync.get(['hideShorts', 'minDuration', 'hideLiveNow'], (settings) => {
    cleanYouTube(settings);
  });
}

// MutationObserver for robust SPA support


let debounceTimeout = null;
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
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    setTimeout(run, 100);
  }
});
function log() {
    console.log("Optube content script loaded.");
}

log();