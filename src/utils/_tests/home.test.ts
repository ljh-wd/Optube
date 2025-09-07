import { expect, test, beforeEach } from 'vitest'
import { setHomeVisibility, observeHome, injectHomeCSS } from '../home'

// @vitest-environment jsdom

// Helpers -------------------------------------------------------------------
function createHomeElements() {
    const browse = document.createElement('ytd-browse')
    browse.setAttribute('page-subtype', 'home')
    const miniGuide = document.createElement('ytd-mini-guide-entry-renderer')
    miniGuide.setAttribute('aria-label', 'Home')
    const richGrid = document.createElement('ytd-rich-grid-renderer')
    const richItem = document.createElement('ytd-rich-item-renderer')
    const richSection = document.createElement('ytd-rich-section-renderer')
    const control = document.createElement('div')
    document.body.append(browse, miniGuide, richGrid, richItem, richSection, control)
    return { browse, miniGuide, richGrid, richItem, richSection, control }
}

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('hide_home')
    // Ensure path root
    window.history.pushState({}, '', '/')
})

// setHomeVisibility root path ------------------------------------------------
test('setHomeVisibility(true) hides all targeted home elements on root path', () => {
    const { browse, miniGuide, richGrid, richItem, richSection, control } = createHomeElements()
    setHomeVisibility(true)
    expect(document.documentElement.getAttribute('hide_home')).toBe('true')
    expect(browse.style.display).toBe('none')
    expect(miniGuide.style.display).toBe('none')
    expect(richGrid.style.display).toBe('none')
    expect(richItem.style.display).toBe('none')
    expect(richSection.style.display).toBe('none')
    expect(control.style.display).toBe('')
})

test('setHomeVisibility(false) restores previously hidden elements', () => {
    const { browse, miniGuide, richGrid, richItem, richSection } = createHomeElements()
    setHomeVisibility(true)
    setHomeVisibility(false)
    expect(document.documentElement.getAttribute('hide_home')).toBeNull()
    expect(browse.style.display).toBe('')
    expect(miniGuide.style.display).toBe('')
    expect(richGrid.style.display).toBe('')
    expect(richItem.style.display).toBe('')
    expect(richSection.style.display).toBe('')
})

// Non-home path conditional hiding ------------------------------------------
test('setHomeVisibility(true) on non-root path hides only browse + mini guide', () => {
    window.history.pushState({}, '', '/feed/subscriptions')
    const { browse, miniGuide, richGrid, richItem, richSection } = createHomeElements()
    setHomeVisibility(true)
    expect(browse.style.display).toBe('none')
    expect(miniGuide.style.display).toBe('none')
    // Path check should prevent others from hiding
    expect(richGrid.style.display).toBe('')
    expect(richItem.style.display).toBe('')
    expect(richSection.style.display).toBe('')
})

// observeHome ---------------------------------------------------------------
test('observeHome hides dynamically inserted home rich item when hide_home attribute set', async () => {
    const observer = observeHome()
    const { richItem } = createHomeElements()
    setHomeVisibility(true)
    expect(richItem.style.display).toBe('none')
    const newItem = document.createElement('ytd-rich-item-renderer')
    document.body.appendChild(newItem)
    // Allow MutationObserver callback to run
    await Promise.resolve()
    expect(newItem.style.display).toBe('none')
    observer?.disconnect()
})

test('observeHome does not hide rich items on non-root path', () => {
    window.history.pushState({}, '', '/watch')
    const observer = observeHome()
    setHomeVisibility(true) // attribute set but path not root
    const newItem = document.createElement('ytd-rich-item-renderer')
    document.body.appendChild(newItem)
    expect(newItem.style.display).toBe('')
    observer?.disconnect()
})

// injectHomeCSS -------------------------------------------------------------
test('injectHomeCSS injects and replaces style element', () => {
    injectHomeCSS()
    const first = document.getElementById('optube-home-css')
    expect(first).toBeTruthy()
    expect(first?.textContent).toContain('hide_home')
    injectHomeCSS()
    const second = document.getElementById('optube-home-css')
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
})
