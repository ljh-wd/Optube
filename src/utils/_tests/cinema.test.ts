import { beforeEach, expect, test, vi } from 'vitest'
import { setCinemaMode, injectCinemaCSS } from '../cinema'

// @vitest-environment jsdom

function buildHomeDom() {
    const browse = document.createElement('ytd-browse')
    browse.setAttribute('page-subtype', 'home')
    const richGrid = document.createElement('ytd-rich-grid-renderer')
    const contents = document.createElement('div')
    contents.id = 'contents'
    contents.className = 'ytd-rich-grid-renderer'
    const item = document.createElement('ytd-rich-item-renderer')
    richGrid.appendChild(contents)
    contents.appendChild(item)
    browse.appendChild(richGrid)
    document.body.appendChild(browse)
}

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('cinematic_mode')
    window.history.pushState({}, '', '/')
    buildHomeDom()
    vi.useFakeTimers()
})

test('setCinemaMode(true) sets attribute and body classes; disabling cleans up', () => {
    setCinemaMode(true)
    expect(document.documentElement.getAttribute('cinematic_mode')).toBe('true')
    // Allow intro timeout
    vi.runAllTimers()
    expect(document.body.classList.contains('cinematic-home')).toBe(true)
    setCinemaMode(false)
    expect(document.documentElement.getAttribute('cinematic_mode')).toBeNull()
    expect(document.body.classList.contains('cinematic-home')).toBe(false)
})

test('injectCinemaCSS injects and replaces style', () => {
    injectCinemaCSS()
    const first = document.getElementById('optube-cinema-css')
    expect(first).toBeTruthy()
    injectCinemaCSS()
    const second = document.getElementById('optube-cinema-css')
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
})
