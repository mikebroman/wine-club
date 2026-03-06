import { ApiError, apiFetch } from './http'

const UNAUTHORIZED_EVENT = 'wineClub:unauthorized'

function notifyUnauthorized() {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
}

export function onUnauthorized(handler) {
    if (typeof handler !== 'function') return () => { }
    const listener = () => handler()
    window.addEventListener(UNAUTHORIZED_EVENT, listener)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, listener)
}

export async function apiClientFetch(path, options) {
    try {
        return await apiFetch(path, options)
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            notifyUnauthorized()
        }

        throw error
    }
}
