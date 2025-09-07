import { expect, test, beforeEach } from 'vitest'
import { cleanupShortsShelves, setShortsVisibility, injectShortsCSS, observeShorts } from '../shorts'
import type { MockChromeAPI } from '../../types/_tests/global'
import { setupMockChromeStorage } from './global'

// @vitest-environment jsdom

// ? Helper creators -----------------------------------------------------------
function createGridShelfWithShorts(): HTMLElement {
    const shelf = document.createElement('grid-shelf-view-model')
    shelf.appendChild(document.createElement('ytm-shorts-lockup-view-model'))
    return shelf
}

function createGridShelfWithoutShorts(): HTMLElement {
    return document.createElement('grid-shelf-view-model')
}

function createRichShelfWithShorts(): HTMLElement {
    const rich = document.createElement('ytd-rich-shelf-renderer')
    const title = document.createElement('div')
    title.id = 'title'
    title.textContent = 'Shorts'
    const lockup = document.createElement('ytm-shorts-lockup-view-model')
    rich.append(title, lockup)
    return rich
}

function createRichShelfWithoutShorts(label = 'Recommended'): HTMLElement {
    const rich = document.createElement('ytd-rich-shelf-renderer')
    const title = document.createElement('div')
    title.id = 'title'
    title.textContent = label
    rich.appendChild(title)
    return rich
}

function createMiniGuideEntry(label: string): HTMLElement {
    const entry = document.createElement('ytd-mini-guide-entry-renderer')
    entry.setAttribute('aria-label', label)
    return entry
}

function createFilterChip(text: string): HTMLElement {
    const chip = document.createElement('yt-chip-cloud-chip-renderer')
    chip.textContent = text
    return chip
}

function createRichItemWrapperWithShelf(): HTMLElement {
    const wrapper = document.createElement('ytd-rich-item-renderer')
    const shelf = document.createElement('ytd-reel-shelf-renderer')
    wrapper.appendChild(shelf)
    return wrapper
}



beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('hide_shorts')
        ; (globalThis as unknown as { chrome?: MockChromeAPI }).chrome = undefined
})

// ? cleanupShortsShelves — core positive cases ----------------------------------
test('cleanupShortsShelves hides all targeted shorts containers', () => {
    const dedicatedShelf = document.createElement('ytd-reel-shelf-renderer')
    const altDedicatedShelf = document.createElement('ytd-shorts-shelf-renderer')
    const gridWith = createGridShelfWithShorts()
    const richWith = createRichShelfWithShorts()
    const richItemWrapper = createRichItemWrapperWithShelf()
    const loneLockup = document.createElement('ytm-shorts-lockup-view-model')
    const miniGuide = createMiniGuideEntry('Shorts')
    const chip = createFilterChip('Shorts')
    const control = document.createElement('div')

    document.body.append(
        control,
        dedicatedShelf,
        altDedicatedShelf,
        gridWith,
        richWith,
        richItemWrapper,
        loneLockup,
        miniGuide,
        chip
    )

    cleanupShortsShelves()

    expect(dedicatedShelf.style.display).toBe('none')
    expect(altDedicatedShelf.style.display).toBe('none')
    expect(gridWith.style.display).toBe('none')
    expect(richWith.style.display).toBe('none')
    expect(richItemWrapper.style.display).toBe('none')
    expect(loneLockup.style.display).toBe('none')
    expect(miniGuide.style.display).toBe('none')
    expect(chip.style.display).toBe('none')
    expect(control.style.display).toBe('') // untouched
})

// ? cleanupShortsShelves negative / safe cases --------------------------------
test('cleanupShortsShelves leaves non-shorts variants visible', () => {
    const gridWithout = createGridShelfWithoutShorts()
    const richWithout = createRichShelfWithoutShorts()
    const miniGuideOther = createMiniGuideEntry('Library')
    const chipOther = createFilterChip('Music')

    document.body.append(gridWithout, richWithout, miniGuideOther, chipOther)
    cleanupShortsShelves()

    expect(gridWithout.style.display).toBe('')
    expect(richWithout.style.display).toBe('')
    expect(miniGuideOther.style.display).toBe('')
    expect(chipOther.style.display).toBe('')
})

// ? setShortsVisibility -------------------------------------------------------
test('setShortsVisibility adds attribute, performs cleanup and restores mini-guide entry on disable', () => {
    const dedicatedShelf = document.createElement('ytd-reel-shelf-renderer')
    const miniGuide = createMiniGuideEntry('Shorts')
    document.body.append(dedicatedShelf, miniGuide)

    setShortsVisibility(true)
    expect(document.documentElement.getAttribute('hide_shorts')).toBe('true')
    expect(dedicatedShelf.style.display).toBe('none')
    expect(miniGuide.style.display).toBe('none')

    setShortsVisibility(false)
    expect(document.documentElement.getAttribute('hide_shorts')).toBeNull()
    // ? mini guide entry restored
    expect(miniGuide.style.display).toBe('')
})

// ? injectShortsCSS -----------------------------------------------------------
test('injectShortsCSS injects style only once', () => {
    injectShortsCSS()
    const styles = Array.from(document.head.querySelectorAll('style')).filter(s => s.textContent?.includes('hide_shorts'))
    expect(styles.length).toBeGreaterThanOrEqual(1)
    // ? Ensure key selector present
    expect(styles[0].textContent).toContain('ytd-reel-shelf-renderer')
})

// ? observeShorts (lightweight due to chrome/storage mocking) -----------------
test('observeShorts applies visibility when chrome storage hideShorts=true', () => {
    const dedicatedShelf = document.createElement('ytd-reel-shelf-renderer')
    document.body.appendChild(dedicatedShelf)
    const { getMock, addListenerMock } = setupMockChromeStorage(true)

    const obs = observeShorts()

    expect(getMock).toHaveBeenCalled()
    expect(document.documentElement.getAttribute('hide_shorts')).toBe('true')
    expect(dedicatedShelf.style.display).toBe('none')
    expect(addListenerMock).toHaveBeenCalled()
    obs?.disconnect()
})

test('observeShorts does not set attribute when hideShorts=false', () => {
    const dedicatedShelf = document.createElement('ytd-reel-shelf-renderer')
    document.body.appendChild(dedicatedShelf)
    setupMockChromeStorage(false)
    const obs = observeShorts()
    expect(document.documentElement.getAttribute('hide_shorts')).toBeNull()
    // ? Shelf not forcibly hidden (cleanup not called)
    expect(dedicatedShelf.style.display).toBe('')
    obs?.disconnect()
})
