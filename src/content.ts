const styleTag = document.createElement("style");
const styleContents = document.createTextNode(`
ytd-mini-guide-entry-renderer[aria-label="Shorts"],
ytd-rich-section-renderer,
ytd-reel-shelf-renderer,
ytd-item-section-renderer,
[title="Shorts"]  {
  display: none; 
    }
`);

// FIX: ytd-item-section-renderer, doesn't work for some reason.
styleTag.appendChild(styleContents);
document.body.prepend(styleTag);

function removeUIElements() {
  // Remove the Shorts button from the sidebar
  const shortsButton = document.querySelector(
    'ytd-mini-guide-entry-renderer[aria-label="Shorts"]'
  );


  if (shortsButton) {
    shortsButton.remove();
  }


  // Remove Shorts grid shelf sections (newer YouTube UI)
  const shortsGridShelves = document.querySelectorAll('grid-shelf-view-model');

  console.log(`[Optube] Found ${shortsGridShelves.length} Shorts grid shelf sections to check`);


  shortsGridShelves.forEach((shelf, idx) => {
    // Try to identify if this shelf is a Shorts section
    // Look for a <span> with text "Shorts" inside a h2.shelf-header-layout-wiz__title
    const headerSpan = shelf.querySelector('h2.shelf-header-layout-wiz__title span.yt-core-attributed-string');
    if (headerSpan && headerSpan.textContent?.trim() === 'Shorts') {
      console.log(`[Optube] Removing Shorts grid shelf #${idx + 1}`, shelf);
      shelf.remove();
      return;
    }
    // Fallback: check for any <span.yt-core-attributed-string> with text "Shorts"
    const fallbackSpan = shelf.querySelector('span.yt-core-attributed-string');
    if (fallbackSpan && fallbackSpan.textContent?.trim() === 'Shorts') {
      console.log(`[Optube] Removing Shorts grid shelf (fallback) #${idx + 1}`, shelf);
      shelf.remove();
    }
  });

  // Remove the Shorts carousel drawer
  const carousels = document.querySelectorAll(
    "ytd-rich-section-renderer, ytd-reel-shelf-renderer"
  );
  carousels.forEach((carousel) => {
    // Add specific condition to target Shorts carousel if needed
    carousel.remove();
  });

  const otherShortsButtons = document.querySelectorAll('[title="Shorts"]');
  otherShortsButtons.forEach((node) => node.remove());
}

// Remove the UI elements on initial page load
removeUIElements();

// Use a MutationObserver to handle dynamic content/AJAX
const observer = new MutationObserver((mutations) => {
  let shouldRemoveElements = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      shouldRemoveElements = true;
      break;
    }
  }

  if (shouldRemoveElements) {
    removeUIElements();
  }
});

// Start observing the target node for configured mutations


observer.observe(document.body, { childList: true, subtree: true });