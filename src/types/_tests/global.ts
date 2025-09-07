interface MockChromeStorageChange<T = unknown> { newValue?: T, oldValue?: T }

export interface MockChromeAPI {
    storage: {
        sync: { get: (keys: string[], cb: (items: Record<string, unknown>) => void) => void }
        onChanged: { addListener: (cb: (changes: Record<string, MockChromeStorageChange>) => void) => void }
    }
}