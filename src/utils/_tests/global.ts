// filepath: /Users/ljhastr/Projects/chrome-extensions/optube/src/utils/_tests/global.ts
import { vi } from 'vitest'
import type { MockChromeAPI } from '../../types/_tests/global'

export function setupMockChromeStorage(hideShorts = true) {
    const getMock = vi.fn((_keys: string[], cb: (items: Record<string, unknown>) => void) => cb({ hideShorts }))
    const addListenerMock = vi.fn()

        ; (globalThis as unknown as { chrome?: MockChromeAPI }).chrome = {
            storage: {
                sync: { get: getMock },
                onChanged: { addListener: addListenerMock }
            }
        }

    return {
        getMock,
        addListenerMock,
        restore: () => {
            ; (globalThis as unknown as { chrome?: MockChromeAPI }).chrome = undefined
        }
    }
}