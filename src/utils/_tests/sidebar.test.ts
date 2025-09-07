import { beforeEach, expect, test } from 'vitest'
import { setSidebarVisibility, observeSidebar } from '../sidebar'
import { setupMockChromeStorage } from './global'

// @vitest-environment jsdom

function createSidebarDom() {
    const guideDrawer = document.createElement('tp-yt-app-drawer')
    guideDrawer.id = 'guide'
    const guideRenderer = document.createElement('ytd-guide-renderer')
    const miniGuide = document.createElement('ytd-mini-guide-renderer')
    const guideWrapper = document.createElement('div')
    guideWrapper.id = 'guide-wrapper'
    const guideContent = document.createElement('div')
    guideContent.id = 'guide-content'
    const guideButton = document.createElement('button')
    guideButton.id = 'guide-button'
    const content = document.createElement('div')
    content.id = 'content'
    const app = document.createElement('ytd-app')
    document.body.append(guideDrawer, guideRenderer, miniGuide, guideWrapper, guideContent, guideButton, content, app)
    return { guideDrawer, guideRenderer, miniGuide, guideWrapper, guideContent, guideButton, content, app }
}

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('optube_hide_sidebar')
})

test('setSidebarVisibility(true) hides sidebar related elements and sets attribute', () => {
    const els = createSidebarDom()
    setSidebarVisibility(true)
    expect(document.documentElement.getAttribute('optube_hide_sidebar')).toBe('true')
    expect(els.guideDrawer.style.display).toBe('none')
    expect(els.miniGuide.style.display).toBe('none')
    expect(els.guideButton.style.display).toBe('none')
    // Inline fallback sets marginLeft to '0' (string) but some browsers normalise to '0px'; accept either
    expect(['0', '0px']).toContain(els.content.style.marginLeft)
})

test('setSidebarVisibility(false) restores styles and removes attribute', () => {
    const els = createSidebarDom()
    setSidebarVisibility(true)
    setSidebarVisibility(false)
    expect(document.documentElement.getAttribute('optube_hide_sidebar')).toBeNull()
    expect(els.guideDrawer.style.display).toBe('')
    expect(els.miniGuide.style.display).toBe('')
    expect(els.guideButton.style.display).toBe('')
    expect(els.content.style.marginLeft).toBe('')
})

test('observeSidebar applies visibility based on chrome storage and hides dynamically added nodes', async () => {
    setupMockChromeStorage({ hideSidebar: true })
    const observer = observeSidebar() as MutationObserver | undefined
    // initial
    const { miniGuide } = createSidebarDom()
    await Promise.resolve() // allow initial get callback
    expect(miniGuide.style.display).toBe('none')
    // dynamic
    const newMini = document.createElement('ytd-mini-guide-renderer')
    document.body.appendChild(newMini)
    await Promise.resolve()
    expect(newMini.style.display).toBe('none')
    observer?.disconnect()
})
