import { beforeEach, expect, test } from 'vitest'
import { setMastheadVisibility, setSearchbarVisibility, setNotificationsVisibility, setCreateButtonVisibility, observeCreateButton, injectCreateButtonCSS } from '../topBar'
import { setupMockChromeStorage } from './global'

// @vitest-environment jsdom

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('hide_create_button')
})

test('setMastheadVisibility toggles display', () => {
    const masthead = document.createElement('div')
    masthead.id = 'container'
    document.body.appendChild(masthead)
    setMastheadVisibility(true)
    expect(masthead.style.display).toBe('none')
    setMastheadVisibility(false)
    expect(masthead.style.display).toBe('')
})

test('setSearchbarVisibility toggles #center elements', () => {
    const c1 = document.createElement('div'); c1.id = 'center'
    const c2 = document.createElement('div'); c2.id = 'center'
    document.body.append(c1, c2)
    setSearchbarVisibility(true)
    expect(c1.style.display).toBe('none')
    expect(c2.style.display).toBe('none')
    setSearchbarVisibility(false)
    expect(c1.style.display).toBe('')
})

test('setNotificationsVisibility hides notifications renderer', () => {
    const n = document.createElement('ytd-notification-topbar-button-renderer')
    document.body.appendChild(n)
    setNotificationsVisibility(true)
    expect(n.style.display).toBe('none')
    setNotificationsVisibility(false)
    expect(n.style.display).toBe('')
})

test('setCreateButtonVisibility sets root attribute and inline fallback', () => {
    const btn = document.createElement('button')
    btn.setAttribute('aria-label', 'Create')
    document.body.appendChild(btn)
    setCreateButtonVisibility(true)
    expect(document.documentElement.getAttribute('hide_create_button')).toBe('true')
    expect(btn.style.display).toBe('none')
    setCreateButtonVisibility(false)
    expect(document.documentElement.getAttribute('hide_create_button')).toBeNull()
    expect(btn.style.display).toBe('')
})

test('observeCreateButton hides dynamically added create button based on storage', async () => {
    setupMockChromeStorage({ hideCreateButton: true })
    const observer = observeCreateButton() as MutationObserver | undefined
    const btn = document.createElement('button'); btn.setAttribute('aria-label', 'Create')
    document.body.appendChild(btn)
    await Promise.resolve()
    expect(btn.style.display).toBe('none')
    observer?.disconnect()
})

test('injectCreateButtonCSS injects only once', () => {
    injectCreateButtonCSS()
    const first = document.getElementById('optube-create-button-css')
    expect(first).toBeTruthy()
    injectCreateButtonCSS() // second call should not replace
    const second = document.getElementById('optube-create-button-css')
    expect(second).toBe(first)
})
