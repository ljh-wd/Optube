import { expect, test, beforeEach, vi } from 'vitest'
import { setPostsVisibility, observePosts, injectPostsCSS } from '../posts'

// @vitest-environment jsdom

// Helpers -------------------------------------------------------------------
function createPostShelf(): HTMLElement {
    const shelf = document.createElement('ytd-rich-shelf-renderer')
    const post = document.createElement('ytd-post-renderer')
    shelf.appendChild(post)
    return shelf
}

function createStandalonePost(): HTMLElement {
    return document.createElement('ytd-post-renderer')
}

function createPostWrapper(): HTMLElement {
    const wrapper = document.createElement('ytd-rich-item-renderer')
    const content = document.createElement('div')
    content.id = 'content'
    const post = document.createElement('ytd-post-renderer')
    content.appendChild(post)
    wrapper.appendChild(content)
    return wrapper
}

function createNonPostShelf(): HTMLElement {
    const shelf = document.createElement('ytd-rich-shelf-renderer')
    // no post descendants
    shelf.appendChild(document.createElement('div'))
    return shelf
}

function createNonPostWrapper(): HTMLElement {
    const wrapper = document.createElement('ytd-rich-item-renderer')
    const content = document.createElement('div')
    content.id = 'content'
    content.appendChild(document.createElement('span'))
    wrapper.appendChild(content)
    return wrapper
}

beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('hide_posts')
})

// setPostsVisibility + cleanup ----------------------------------------------
test('setPostsVisibility(true) hides shelves, standalone posts and wrappers', () => {
    const shelf = createPostShelf()
    const post = createStandalonePost()
    const wrapper = createPostWrapper()
    const control = document.createElement('div')
    document.body.append(shelf, post, wrapper, control)

    setPostsVisibility(true)

    expect(document.documentElement.getAttribute('hide_posts')).toBe('true')
    expect(shelf.style.display).toBe('none')
    expect(post.style.display).toBe('none')
    expect(wrapper.style.display).toBe('none')
    expect(control.style.display).toBe('')
})

test('setPostsVisibility(false) restores previously hidden elements', () => {
    const shelf = createPostShelf()
    const post = createStandalonePost()
    const wrapper = createPostWrapper()
    document.body.append(shelf, post, wrapper)
    setPostsVisibility(true)
    setPostsVisibility(false)

    expect(document.documentElement.getAttribute('hide_posts')).toBeNull()
    expect(shelf.style.display).toBe('')
    expect(post.style.display).toBe('')
    expect(wrapper.style.display).toBe('')
})

test('non-post variants remain visible after enabling hide', () => {
    const nonShelf = createNonPostShelf()
    const nonWrapper = createNonPostWrapper()
    document.body.append(nonShelf, nonWrapper)
    setPostsVisibility(true)
    expect(nonShelf.style.display).toBe('')
    expect(nonWrapper.style.display).toBe('')
})

// observePosts ---------------------------------------------------------------
test('observePosts hides dynamically added post nodes when attribute present', async () => {
    setPostsVisibility(true) // sets attribute + initial cleanup
    const observer = observePosts()

    // Force requestAnimationFrame to run synchronously
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { cb(0); return 1 })

    const newShelf = createPostShelf()
    document.body.appendChild(newShelf)
    // Allow microtask -> RAF chain to complete
    await Promise.resolve()
    expect(newShelf.style.display).toBe('none')

    rafSpy.mockRestore()
    observer?.disconnect()
})

test('observePosts does not hide when attribute absent', () => {
    const observer = observePosts()
    const shelf = createPostShelf()
    document.body.appendChild(shelf)
    // attribute not set, should stay visible
    expect(shelf.style.display).toBe('')
    observer?.disconnect()
})

// injectPostsCSS -------------------------------------------------------------
test('injectPostsCSS injects / replaces style element with id', () => {
    injectPostsCSS()
    const first = document.getElementById('optube-posts-css')
    expect(first).toBeTruthy()
    expect(first?.textContent).toContain('ytd-post-renderer')

    // Re-inject should replace (function removes existing before append)
    injectPostsCSS()
    const second = document.getElementById('optube-posts-css')
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
})
