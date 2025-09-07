import { beforeEach, expect, test } from 'vitest'
import { applyNavigation, injectNavigationCSS, observeNavigation } from '../navigation'
import { setupMockChromeStorage } from './global'

// @vitest-environment jsdom

// Helpers -------------------------------------------------------------------
function createSection(title: string, entryTitles: string[] = []) {
    const section = document.createElement('ytd-guide-section-renderer')
    const header = document.createElement('div')
    header.id = 'guide-section-title'
    header.textContent = title
    section.appendChild(header)
    entryTitles.forEach(t => section.appendChild(createEntry(t)))
    document.body.appendChild(section)
    return section
}

function createCollapsibleYouSection(entryTitles: string[] = []) {
    const sec = document.createElement('ytd-guide-collapsible-section-entry-renderer')
    const headerEntry = document.createElement('div')
    headerEntry.id = 'header-entry'
    const titleEl = document.createElement('span')
    titleEl.className = 'title'
    titleEl.textContent = 'You'
    headerEntry.appendChild(titleEl)
    sec.appendChild(headerEntry)
    entryTitles.forEach(t => sec.appendChild(createEntry(t)))
    document.body.appendChild(sec)
    return sec
}

function createEntry(label: string) {
    const entry = document.createElement('ytd-guide-entry-renderer')
    const span = document.createElement('span')
    span.className = 'title'
    span.textContent = label
    entry.appendChild(span)
    return entry
}

function createMini(label: string) {
    const mini = document.createElement('ytd-mini-guide-entry-renderer')
    mini.setAttribute('aria-label', label)
    document.body.appendChild(mini)
    return mini
}

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
})

// injectNavigationCSS -------------------------------------------------------
test('injectNavigationCSS injects style only once', () => {
    injectNavigationCSS()
    const first = document.getElementById('optube-navigation-css')
    expect(first).toBeTruthy()
    injectNavigationCSS()
    const second = document.getElementById('optube-navigation-css')
    expect(second).toBe(first) // second call is no-op
})

// applyNavigation basic section hiding -------------------------------------
test('applyNavigation hides Explore section when hideExplore=true', () => {
    const explore = createSection('Explore', ['Music', 'News'])
    applyNavigation({ hideExplore: true })
    expect(explore.getAttribute('data-optube-hidden')).toBe('true')
})

test('applyNavigation hides Explore section when all sub-items hidden (implicit)', () => {
    const explore = createSection('Explore', ['Music', 'Live'])
    applyNavigation({
        hideExploreMusic: true,
        hideExploreMovies: true,
        hideExploreLive: true,
        hideExploreGaming: true,
        hideExploreNews: true,
        hideExploreSport: true,
        hideExploreLearning: true,
        hideExploreFashion: true,
        hideExplorePodcasts: true,
        hideExplorePlayables: true
    })
    expect(explore.getAttribute('data-optube-hidden')).toBe('true')
})

test('applyNavigation hides only specific Explore sub-items when section not fully hidden', () => {
    const explore = createSection('Explore', ['Music', 'News', 'Gaming'])
    applyNavigation({ hideExploreMusic: true, hideExploreNews: true })
    // Section should remain visible
    expect(explore.getAttribute('data-optube-hidden')).toBeNull()
    const entries = Array.from(explore.querySelectorAll('ytd-guide-entry-renderer'))
    const byLabel = (l: string) => entries.find(e => e.textContent?.trim() === l)!
    expect(byLabel('Music').getAttribute('data-optube-hidden')).toBe('true')
    expect(byLabel('News').getAttribute('data-optube-hidden')).toBe('true')
    expect(byLabel('Gaming').getAttribute('data-optube-hidden')).toBeNull()
})

// You section logic --------------------------------------------------------
test('applyNavigation hides You section when hideYouSection=true and hides mini guide', () => {
    const youCollapsible = createCollapsibleYouSection(['History', 'Playlists'])
    const mini = createMini('You')
    applyNavigation({ hideYouSection: true })
    expect(youCollapsible.getAttribute('data-optube-hidden')).toBe('true')
    expect(mini.getAttribute('data-optube-hidden')).toBe('true')
})

test('applyNavigation hides You section implicitly when all children hidden', () => {
    const youCollapsible = createCollapsibleYouSection(['History', 'Playlists', 'Your videos', 'Your courses', 'Watch Later', 'Liked videos'])
    applyNavigation({
        hideHistory: true,
        hidePlaylists: true,
        hideYourVideos: true,
        hideYourCourses: true,
        hideWatchLater: true,
        hideLikedVideos: true
    })
    expect(youCollapsible.getAttribute('data-optube-hidden')).toBe('true')
})

test('applyNavigation hides individual You entries when section kept visible', () => {
    const youCollapsible = createCollapsibleYouSection(['History', 'Playlists', 'Watch Later'])
    applyNavigation({ hideHistory: true, hidePlaylists: true })
    expect(youCollapsible.getAttribute('data-optube-hidden')).toBeNull()
    const entries = Array.from(youCollapsible.querySelectorAll('ytd-guide-entry-renderer'))
    const byLabel = (l: string) => entries.find(e => e.textContent?.trim() === l)!
    expect(byLabel('History').getAttribute('data-optube-hidden')).toBe('true')
    expect(byLabel('Playlists').getAttribute('data-optube-hidden')).toBe('true')
    expect(byLabel('Watch Later').getAttribute('data-optube-hidden')).toBeNull()
})

// observeNavigation --------------------------------------------------------
test('observeNavigation applies settings from chrome storage on added DOM', async () => {
    const { getMock } = setupMockChromeStorage({ hideExplore: true, hideYouSection: true })
    const observer = observeNavigation() as MutationObserver | undefined
    // DOM created after observeNavigation starts (should trigger mutation re-apply)
    const explore = createSection('Explore', ['Music'])
    const youCollapsible = createCollapsibleYouSection(['History'])
    const mini = createMini('You')
    await Promise.resolve()
    expect(getMock).toHaveBeenCalled()
    expect(explore.getAttribute('data-optube-hidden')).toBe('true')
    expect(youCollapsible.getAttribute('data-optube-hidden')).toBe('true')
    expect(mini.getAttribute('data-optube-hidden')).toBe('true')
    observer?.disconnect()
})
