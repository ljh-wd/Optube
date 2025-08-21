/**
 * Utilities to hide community posts (rich shelves & post renderers) on feeds like Home & Subscriptions.
 * Approach: attribute on <html> + injected CSS covering known component variants + light DOM cleanup for already inserted nodes.
 */

const ATTR = 'hide_posts';

export function setPostsVisibility(hide: boolean) {
    if (hide) {
        document.documentElement.setAttribute(ATTR, 'true');
        cleanupPosts();
    } else {
        document.documentElement.removeAttribute(ATTR);
        restorePosts();
    }
}

function matchesPostShelf(el: Element): boolean {
    // ytd-rich-shelf-renderer containing posts; title may include 'posts' but we rely on structure
    if (el.tagName === 'YTD-RICH-SHELF-RENDERER') {
        // Heuristic: contains a ytd-post-renderer descendant
        return !!el.querySelector('ytd-post-renderer');
    }
    return false;
}

function matchesPostItem(el: Element): boolean {
    return el.tagName === 'YTD-POST-RENDERER';
}

function cleanupPosts() {
    // Hide shelves that are purely posts
    document.querySelectorAll('ytd-rich-shelf-renderer').forEach(el => {
        if (matchesPostShelf(el)) {
            (el as HTMLElement).style.display = 'none';
        }
    });
    // Hide standalone post items (some appear as rich items within rich-item-renderer)
    document.querySelectorAll('ytd-post-renderer').forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });
    // Hide rich-item-renderer wrappers whose immediate child is a post
    document.querySelectorAll('ytd-rich-item-renderer').forEach(richItem => {
        if (richItem.querySelector(':scope > #content > ytd-post-renderer')) {
            (richItem as HTMLElement).style.display = 'none';
        }
    });
}

function restorePosts() {
    document.querySelectorAll('ytd-rich-shelf-renderer').forEach(el => {
        if ((el as HTMLElement).style.display === 'none' && matchesPostShelf(el)) {
            (el as HTMLElement).style.display = '';
        }
    });
    document.querySelectorAll('ytd-post-renderer').forEach(el => {
        if ((el as HTMLElement).style.display === 'none') {
            (el as HTMLElement).style.display = '';
        }
    });
    document.querySelectorAll('ytd-rich-item-renderer').forEach(richItem => {
        if ((richItem as HTMLElement).style.display === 'none' && richItem.querySelector(':scope > #content > ytd-post-renderer')) {
            (richItem as HTMLElement).style.display = '';
        }
    });
}

export function observePosts() {
    const observer = new MutationObserver(muts => {
        if (!document.documentElement.hasAttribute(ATTR)) return;
        let needsCleanup = false;
        for (const m of muts) {
            for (const node of Array.from(m.addedNodes)) {
                if (!(node instanceof HTMLElement)) continue;
                if (matchesPostShelf(node) || matchesPostItem(node) || node.querySelector?.('ytd-post-renderer')) {
                    needsCleanup = true;
                    break;
                }
            }
            if (needsCleanup) break;
        }
        if (needsCleanup) {
            // microtask batching
            requestAnimationFrame(() => cleanupPosts());
        }
    });
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
    return observer;
}

export function injectPostsCSS() {
    const id = 'optube-posts-css';
    document.getElementById(id)?.remove();
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
    /* Hide community post shelves and items when attribute present */
    html[${ATTR}] ytd-rich-shelf-renderer:has(ytd-post-renderer) {
      display: none !important;
    }
    html[${ATTR}] ytd-post-renderer {
      display: none !important;
    }
    html[${ATTR}] ytd-rich-item-renderer:has(> #content > ytd-post-renderer) {
      display: none !important;
    }
    /* Fallback: hide rich section renderer variants that contain only post shelves */
    html[${ATTR}] ytd-rich-section-renderer:has(ytd-post-renderer):not(:has(ytd-rich-grid-row-renderer, ytd-rich-item-renderer ytd-thumbnail)) {
      display: none !important;
    }
  `;
    document.head.appendChild(style);
}
