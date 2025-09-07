import { beforeEach, expect, test } from 'vitest'
import { setSubscriptionsVisibility, setSubscriptionsSidebarVisibility, observeSubscriptions, observeSubscriptionsSidebar, injectSubscriptionsCSS } from '../subscriptions'
import { setupMockChromeStorage } from './global'

// @vitest-environment jsdom

function createSubscriptionsFeedDom() {
    const browse = document.createElement('ytd-browse')
    browse.setAttribute('page-subtype', 'subscriptions')
    const richGrid = document.createElement('ytd-rich-grid-renderer')
    const richItem = document.createElement('ytd-rich-item-renderer')
    const richSection = document.createElement('ytd-rich-section-renderer')
    const miniGuide = document.createElement('ytd-mini-guide-entry-renderer')
    miniGuide.setAttribute('aria-label', 'Subscriptions')
    document.body.append(browse, richGrid, richItem, richSection, miniGuide)
    return { browse, richGrid, richItem, richSection, miniGuide }
}

function createSubscriptionsSidebarDom() {
    const section = document.createElement('ytd-guide-section-renderer')
    const collapsible = document.createElement('ytd-guide-collapsible-section-entry-renderer')
    const header = document.createElement('div')
    header.id = 'header-entry'
    const title = document.createElement('span')
    title.className = 'title'
    title.textContent = 'Subscriptions'
    header.appendChild(title)
    collapsible.appendChild(header)
    section.appendChild(collapsible)
    document.body.appendChild(section)
    return { section }
}

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('hide_subscriptions')
    document.documentElement.removeAttribute('hide_subscriptions_sidebar')
    window.history.pushState({}, '', '/feed/subscriptions')
})

test('setSubscriptionsVisibility(true) hides feed elements and sets attribute', () => {
    const els = createSubscriptionsFeedDom()
    setSubscriptionsVisibility(true)
    expect(document.documentElement.getAttribute('hide_subscriptions')).toBe('true')
    expect(els.browse.style.display).toBe('none')
    expect(els.richGrid.style.display).toBe('none')
    expect(els.richItem.style.display).toBe('none')
    expect(els.richSection.style.display).toBe('none')
    expect(els.miniGuide.style.display).toBe('none')
})

test('setSubscriptionsVisibility(false) restores feed elements', () => {
    const els = createSubscriptionsFeedDom()
    setSubscriptionsVisibility(true)
    setSubscriptionsVisibility(false)
    expect(document.documentElement.getAttribute('hide_subscriptions')).toBeNull()
    expect(els.browse.style.display).toBe('')
})

test('setSubscriptionsSidebarVisibility(true) hides sidebar section and mini guide', () => {
    const { section } = createSubscriptionsSidebarDom()
    const mini = document.createElement('ytd-mini-guide-entry-renderer')
    mini.setAttribute('aria-label', 'Subscriptions')
    document.body.appendChild(mini)
    setSubscriptionsSidebarVisibility(true)
    expect(document.documentElement.getAttribute('hide_subscriptions_sidebar')).toBe('true')
    expect(section.style.display).toBe('none')
    expect(mini.style.display).toBe('none')
})

test('observeSubscriptions hides dynamically added rich item when attribute present on subscriptions page', async () => {
    const observer = observeSubscriptions()
    createSubscriptionsFeedDom()
    setSubscriptionsVisibility(true)
    const extra = document.createElement('ytd-rich-item-renderer')
    document.body.appendChild(extra)
    await Promise.resolve()
    expect(extra.style.display).toBe('none')
    observer?.disconnect?.()
})

test('observeSubscriptionsSidebar reacts to storage and DOM mutations', async () => {
    const { triggerChange } = setupMockChromeStorage({ hideSubscriptionsSidebar: true })
    const observer = observeSubscriptionsSidebar()
    const { section } = createSubscriptionsSidebarDom()
    await Promise.resolve()
    expect(section.style.display).toBe('none')
    // simulate storage change turning off
    triggerChange('hideSubscriptionsSidebar', false)
    await Promise.resolve()
    expect(section.style.display).toBe('')
    observer?.disconnect?.()
})

test('injectSubscriptionsCSS injects and replaces style element', () => {
    injectSubscriptionsCSS()
    const first = document.getElementById('optube-subscriptions-css')
    expect(first).toBeTruthy()
    expect(first?.textContent).toContain('hide_subscriptions')
    injectSubscriptionsCSS()
    const second = document.getElementById('optube-subscriptions-css')
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
})
