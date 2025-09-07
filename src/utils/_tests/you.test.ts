import { beforeEach, expect, test, vi } from 'vitest'
import { applyYouFeedAttributes, observeYouFeed, injectYouFeedCSS } from '../you'

// @vitest-environment jsdom

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('optube-you-page')
    window.history.pushState({}, '', '/feed/you')
})

test('applyYouFeedAttributes sets root attributes on /feed/you', () => {
    applyYouFeedAttributes({ hideYouSection: true, hideHistory: true })
    expect(document.documentElement.getAttribute('optube-you-page')).toBe('true')
    expect(document.documentElement.getAttribute('hide_you_section')).toBe('true')
    expect(document.documentElement.getAttribute('hide_you_history')).toBe('true')
})

test('applyYouFeedAttributes removes attributes when leaving page', () => {
    applyYouFeedAttributes({ hideYouSection: true })
    window.history.pushState({}, '', '/')
    applyYouFeedAttributes({ hideYouSection: false })
    expect(document.documentElement.getAttribute('optube-you-page')).toBeNull()
    expect(document.documentElement.getAttribute('hide_you_section')).toBeNull()
})

test('observeYouFeed annotates sections with data-optube-section after mutation', async () => {
    // Immediate rAF execution
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(fn => { fn(0); return 1 })
    const observer = observeYouFeed()
    const sec = document.createElement('ytd-rich-section-renderer')
    const heading = document.createElement('h2'); heading.textContent = 'History'
    sec.appendChild(heading)
    document.body.appendChild(sec)
    await Promise.resolve()
    expect(sec.getAttribute('data-optube-section')).toBe('History')
    observer.disconnect()
})

test('injectYouFeedCSS injects and replaces stylesheet', () => {
    injectYouFeedCSS()
    const first = document.getElementById('optube-you-feed-css')
    expect(first).toBeTruthy()
    injectYouFeedCSS()
    const second = document.getElementById('optube-you-feed-css')
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
})
