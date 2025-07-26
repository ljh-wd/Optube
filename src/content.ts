
import { config } from "./utils/global";
import { setShortsVisibility } from "./utils/shorts";
import type { DetachableElement } from "./types/dom";

const removedGridShelves: DetachableElement[] = [];

function cleanYouTube(settings: { hideShorts?: boolean }): void {
    setShortsVisibility(!!settings.hideShorts, removedGridShelves);
}

function run(): void {
    chrome.storage.sync.get(config, cleanYouTube);
}

let debounceId: number | null = null;

const observer = new MutationObserver((mutations) => {
    const hasShortsRelatedMutation = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
            (node) =>
                node.nodeType === Node.ELEMENT_NODE &&
                ((node as Element).matches?.('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i]') ||
                    (node as Element).querySelector?.('.ytGridShelfViewModelHost, [class*="shelf"][class*="shorts" i]'))
        )
    );

    if (hasShortsRelatedMutation) {
        chrome.storage.sync.get(['hideShorts'], cleanYouTube);
    } else if (debounceId) {
        clearTimeout(debounceId);
        debounceId = window.setTimeout(run, 50);
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
    if (area === 'sync' && changes.hideShorts) {
        setTimeout(run, 100);
    }
});

console.log('Optube content script loaded.');
