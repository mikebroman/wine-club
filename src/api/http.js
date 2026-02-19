const DEFAULT_TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(message, { status, url, payload } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.url = url
    this.payload = payload
  }
}

function getBaseUrl() {
  const raw = import.meta.env?.VITE_API_BASE_URL
  if (!raw) return ''
  return String(raw).replace(/\/$/, '')
}

export function buildUrl(path, query) {
  const base = getBaseUrl()
  const normalizedPath = String(path ?? '')

  const url = new URL(`${base}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`, window.location.origin)

  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item === undefined || item === null) continue
          url.searchParams.append(key, String(item))
        }
        continue
      }

      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function getAccessToken() {
  const fromSession = sessionStorage.getItem('wineClubAccessToken')
  if (fromSession) return fromSession
  const fromLocal = localStorage.getItem('wineClubAccessToken')
  if (fromLocal) return fromLocal
  return null
}

function buildAuthHeaders() {
  const token = getAccessToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

export async function apiFetch(path, { method = 'GET', query, body, headers, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const url = buildUrl(path, query)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const finalHeaders = {
    ...buildAuthHeaders(),
    ...(headers ?? {}),
  }

  const init = {
    method,
    headers: finalHeaders,
    credentials: 'include',
    signal: controller.signal,
  }

  if (body !== undefined) {
    if (isFormData(body)) {
      init.body = body
    } else if (typeof body === 'string') {
      init.body = body
    } else {
      init.body = JSON.stringify(body)
      if (!finalHeaders['Content-Type']) {
        init.headers = {
          ...finalHeaders,
          'Content-Type': 'application/json',
        }
      }
    }
  }

  try {
    const res = await fetch(url, init)
    const contentType = res.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json') || contentType.includes('+json')

    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

    if (!res.ok) {
      const message =
        (payload && typeof payload === 'object' && (payload.message || payload.error))
          ? String(payload.message || payload.error)
          : `Request failed (${res.status})`

      throw new ApiError(message, { status: res.status, url, payload })
    }

    return payload
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError('Request timed out', { status: 0, url })
    }

    if (error instanceof ApiError) throw error
    throw new ApiError(error?.message || 'Request failed', { status: 0, url })
  } finally {
    clearTimeout(timeout)
  }
}
