import { vi } from 'vitest'
import type { MockChromeAPI } from '../../types/_tests/global'

type ChromeStore = Record<string, unknown>

export function setupMockChromeStorage(initialState: boolean | ChromeStore = true) {
    const state: ChromeStore = typeof initialState === 'boolean' ? { hideShorts: initialState } : { ...initialState }

    const listeners: Array<(changes: Record<string, { newValue?: unknown; oldValue?: unknown }>) => void> = []

    const getMock = vi.fn((_keys: string[], cb: (items: ChromeStore) => void) => cb({ ...state }))
    const addListenerMock = vi.fn((fn: (changes: Record<string, { newValue?: unknown; oldValue?: unknown }>) => void) => {
        listeners.push(fn)
    })

        ; (globalThis as unknown as { chrome?: MockChromeAPI }).chrome = {
            storage: {
                sync: { get: getMock },
                onChanged: { addListener: addListenerMock }
            }
        }

    function triggerChange(key: string, newValue: unknown) {
        const oldValue = state[key]
        state[key] = newValue
        const change = { [key]: { newValue, oldValue } }
        listeners.forEach(l => l(change))
    }

    function set(key: string, value: unknown) {
        state[key] = value
    }

    function restore() {
        ; (globalThis as unknown as { chrome?: MockChromeAPI }).chrome = undefined
    }

    return { getMock, addListenerMock, triggerChange, set, restore }
}