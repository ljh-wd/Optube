import { beforeEach, expect, test, vi } from 'vitest'
import { applyLayout, injectLayoutCSS, observeLayout } from '../layout'
import { setupMockChromeStorage } from './global'

// @vitest-environment jsdom


// Helpers -------------------------------------------------------------------
function createDurationBadge(text = '12:34'): HTMLElement {
    const el = document.createElement('ytd-thumbnail-overlay-time-status-renderer')
    el.textContent = text
    return el
}

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('hide_duration_badges')
    document.documentElement.removeAttribute('hide_preview_details')
    document.documentElement.removeAttribute('hide_preview_avatars')
    document.documentElement.removeAttribute('hide_badges_chips')
    document.documentElement.removeAttribute('hide_watched_progress')
    document.documentElement.removeAttribute('hide_hover_preview')
    document.documentElement.removeAttribute('hide_live_videos')
    setupMockChromeStorage({}) // ensures chrome defined then cleared below
        ; (globalThis as unknown as { chrome?: unknown }).chrome = undefined
    vi.useRealTimers()
})

// applyLayout basic attribute toggling & duration hiding --------------------
test('applyLayout sets attributes & hides duration badges', () => {
    const badge = createDurationBadge()
    const nonBadge = createDurationBadge('LIVE') // not matching time regex
    document.body.append(badge, nonBadge)

    applyLayout({ hideDurationBadges: true, hidePreviewDetails: true, hidePreviewAvatars: true, hideLiveVideos: true })

    expect(document.documentElement.hasAttribute('hide_duration_badges')).toBe(true)
    expect(document.documentElement.hasAttribute('hide_preview_details')).toBe(true)
    expect(document.documentElement.hasAttribute('hide_preview_avatars')).toBe(true)
    expect(document.documentElement.hasAttribute('hide_live_videos')).toBe(true)
    expect(badge.style.display).toBe('none')
    expect(nonBadge.style.display).toBe('')
})

test('applyLayout unsets attribute & restores duration badges', () => {
    const badge = createDurationBadge()
    document.body.appendChild(badge)
    applyLayout({ hideDurationBadges: true })
    expect(badge.style.display).toBe('none')
    applyLayout({ hideDurationBadges: false })
    expect(document.documentElement.hasAttribute('hide_duration_badges')).toBe(false)
    expect(badge.style.display).toBe('')
})

// Duration observer dynamic hiding -----------------------------------------
test('duration observer hides newly added badge asynchronously', async () => {
    vi.useFakeTimers()
    applyLayout({ hideDurationBadges: true }) // starts observer and initial hide pass
    const badge = createDurationBadge()
    document.body.appendChild(badge) // triggers mutation observer
    // Await microtask queue so MutationObserver callback schedules timeout
    await Promise.resolve()
    // Fast-forward debounce (100ms)
    vi.advanceTimersByTime(110)
    expect(badge.style.display).toBe('none')
    vi.useRealTimers()
})

// injectLayoutCSS -----------------------------------------------------------
test('injectLayoutCSS injects style and replaces previous one', () => {
    injectLayoutCSS()
    const first = document.getElementById('optube-layout-css') as HTMLStyleElement | null
    expect(first).toBeTruthy()
    expect(first?.textContent).toContain('hide_duration_badges')
    injectLayoutCSS() // replace
    const second = document.getElementById('optube-layout-css')
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
})

// observeLayout -------------------------------------------------------------
test('observeLayout pulls from chrome storage and applies layout', () => {
    const { getMock, addListenerMock } = setupMockChromeStorage({ hideDurationBadges: true, hidePreviewDetails: true })
    const badge = createDurationBadge()
    document.body.appendChild(badge)
    observeLayout()
    expect(getMock).toHaveBeenCalled()
    expect(addListenerMock).toHaveBeenCalled()
    expect(document.documentElement.hasAttribute('hide_duration_badges')).toBe(true)
    expect(document.documentElement.hasAttribute('hide_preview_details')).toBe(true)
    // Badge hidden due to initial apply
    expect(badge.style.display).toBe('none')
})

test('observeLayout reacts to storage change events', () => {
    const { getMock, triggerChange } = setupMockChromeStorage({ hideDurationBadges: false, hidePreviewDetails: false })
    observeLayout()
    expect(getMock).toHaveBeenCalledTimes(1)
    triggerChange('hideDurationBadges', true)
    expect(getMock).toHaveBeenCalledTimes(2)
})

