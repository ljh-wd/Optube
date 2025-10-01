import { beforeEach, expect, test } from 'vitest'
import { setFoldVisibility, setCommentsVisibility, setAiSummaryVisibility, setCommentAvatarsVisibility, injectVideoPlayerCSS, setRecommendedVisibility, injectCommentAvatarCSS, setDescriptionVisibility, setTitleVisibility, setCreatorVisibility, injectActionsCSS, applyActions } from '../video'

// @vitest-environment jsdom

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('optube_hide_recommended')
    document.documentElement.removeAttribute('hide_actions')
    document.documentElement.removeAttribute('hide_action_like_dislike')
    document.documentElement.removeAttribute('hide_action_share')
    document.documentElement.removeAttribute('hide_action_save')
    document.documentElement.removeAttribute('hide_action_ellipsis')
    document.documentElement.removeAttribute('hide_action_join')
    document.documentElement.removeAttribute('hide_action_subscribe')
    document.documentElement.removeAttribute('hide_action_clip')
})

test('setFoldVisibility toggles #above-the-fold', () => {
    const fold = document.createElement('div'); fold.id = 'above-the-fold'; document.body.appendChild(fold)
    setFoldVisibility(true)
    expect(fold.style.display).toBe('none')
    setFoldVisibility(false)
    expect(fold.style.display).toBe('')
})

test('setCommentsVisibility toggles ytd-comments', () => {
    const c = document.createElement('ytd-comments'); document.body.appendChild(c)
    setCommentsVisibility(true)
    expect((c as HTMLElement).style.display).toBe('none')
    setCommentsVisibility(false)
    expect((c as HTMLElement).style.display).toBe('')
})

test('setAiSummaryVisibility hides #expandable-metadata', () => {
    const ai = document.createElement('div'); ai.id = 'expandable-metadata'; document.body.appendChild(ai)
    setAiSummaryVisibility(true)
    expect(ai.style.display).toBe('none')
    setAiSummaryVisibility(false)
    expect(ai.style.display).toBe('')
})

test('setCommentAvatarsVisibility sets attribute and inline styles', () => {
    const thumb = document.createElement('div'); thumb.id = 'author-thumbnail'; document.body.appendChild(thumb)
    setCommentAvatarsVisibility(true)
    expect(document.documentElement.getAttribute('hide_comment_avatars')).toBe('true')
    expect(thumb.style.display).toBe('none')
    setCommentAvatarsVisibility(false)
    expect(document.documentElement.getAttribute('hide_comment_avatars')).toBeNull()
    expect(thumb.style.display).toBe('')
})

test('injectVideoPlayerCSS injects only once', () => {
    injectVideoPlayerCSS()
    const first = document.getElementById('optube-video-player-css')
    expect(first).toBeTruthy()
    injectVideoPlayerCSS()
    const second = document.getElementById('optube-video-player-css')
    expect(second).toBe(first)
})

test('injectActionsCSS injects only once', () => {
    injectActionsCSS()
    const first = document.getElementById('optube-actions-css')
    expect(first).toBeTruthy()
    injectActionsCSS()
    const second = document.getElementById('optube-actions-css')
    expect(second).toBe(first)
})

test('applyActions toggles root attributes', () => {
    applyActions({ hideActionShare: true })
    expect(document.documentElement.getAttribute('hide_action_share')).toBe('true')
    applyActions({ hideActionShare: false })
    expect(document.documentElement.getAttribute('hide_action_share')).toBeNull()
    // Parent should cascade to children
    applyActions({ hideActions: true })
    expect(document.documentElement.getAttribute('hide_actions')).toBe('true')
    expect(document.documentElement.getAttribute('hide_action_like_dislike')).toBe('true')
    expect(document.documentElement.getAttribute('hide_action_share')).toBe('true')
    expect(document.documentElement.getAttribute('hide_action_save')).toBe('true')
    expect(document.documentElement.getAttribute('hide_action_ellipsis')).toBe('true')
    expect(document.documentElement.getAttribute('hide_action_join')).toBe('true')
    expect(document.documentElement.getAttribute('hide_action_subscribe')).toBe('true')
    expect(document.documentElement.getAttribute('hide_action_clip')).toBe('true')
    applyActions({ hideActions: false })
    expect(document.documentElement.getAttribute('hide_actions')).toBeNull()
})

test('injectCommentAvatarCSS injects only once', () => {
    injectCommentAvatarCSS()
    const first = document.getElementById('optube-comment-avatars-css')
    expect(first).toBeTruthy()
    injectCommentAvatarCSS()
    const second = document.getElementById('optube-comment-avatars-css')
    expect(second).toBe(first)
})

function buildRecommendedDom() {
    const columns = document.createElement('div'); columns.id = 'columns'
    const primary = document.createElement('div'); primary.id = 'primary'
    columns.appendChild(primary)
    const secondary = document.createElement('div'); secondary.id = 'secondary'
    const inner = document.createElement('div'); inner.id = 'secondary-inner'
    const related = document.createElement('div'); related.id = 'related'
    inner.appendChild(related)
    secondary.appendChild(inner)
    document.body.append(columns, secondary)
    return { columns, primary, secondary, inner, related }
}

test('setRecommendedVisibility(true) on watch page hides #secondary and related elements', () => {
    window.history.pushState({}, '', '/watch?v=abc123')
    const els = buildRecommendedDom()
    setRecommendedVisibility(true)
    expect(document.documentElement.getAttribute('optube_hide_recommended')).toBe('true')
    expect(els.secondary.style.visibility).toBe('hidden')
    expect(els.inner.style.display).toBe('none')
    expect(els.related.style.display).toBe('none')
    setRecommendedVisibility(false)
    expect(document.documentElement.getAttribute('optube_hide_recommended')).toBeNull()
    expect(els.secondary.style.visibility).toBe('')
})

test('setRecommendedVisibility on non-watch page does nothing', () => {
    window.history.pushState({}, '', '/watch') // missing ?v param
    const els = buildRecommendedDom()
    setRecommendedVisibility(true)
    expect(document.documentElement.getAttribute('optube_hide_recommended')).toBeNull()
    expect(els.secondary.style.visibility).toBe('')
})

test('setDescriptionVisibility / setTitleVisibility / setCreatorVisibility toggle elements', () => {
    const desc = document.createElement('div'); desc.id = 'bottom-row'; desc.className = 'style-scope ytd-watch-metadata'
    const title = document.createElement('div'); title.id = 'title'; title.className = 'style-scope ytd-watch-metadata'
    const creator = document.createElement('div'); creator.id = 'top-row'; creator.className = 'style-scope ytd-watch-metadata'
    document.body.append(desc, title, creator)
    setDescriptionVisibility(true); setTitleVisibility(true); setCreatorVisibility(true)
    expect(desc.style.display).toBe('none')
    expect(title.style.display).toBe('none')
    expect(creator.style.display).toBe('none')
    setDescriptionVisibility(false); setTitleVisibility(false); setCreatorVisibility(false)
    expect(desc.style.display).toBe('')
})
