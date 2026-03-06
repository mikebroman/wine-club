function padBase64(base64) {
    const padLength = (4 - (base64.length % 4)) % 4
    if (!padLength) return base64
    return `${base64}${'='.repeat(padLength)}`
}

export function decodeJwtPayload(token) {
    const raw = typeof token === 'string' ? token.trim() : ''
    if (!raw) return null

    const parts = raw.split('.')
    if (parts.length < 2) return null

    const base64Url = parts[1]
    if (!base64Url) return null

    try {
        const base64 = padBase64(base64Url.replace(/-/g, '+').replace(/_/g, '/'))
        const binary = window.atob(base64)
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
        const json = new TextDecoder().decode(bytes)
        const payload = JSON.parse(json)
        return payload && typeof payload === 'object' ? payload : null
    } catch {
        return null
    }
}

export function getJwtClaim(token, claimName) {
    const payload = decodeJwtPayload(token)
    if (!payload) return null
    return payload[claimName]
}

export function getClubIdFromToken(token) {
    const value = getJwtClaim(token, 'ClubId') ?? getJwtClaim(token, 'clubId')
    if (value === undefined || value === null) return null

    const asNumber = typeof value === 'number' ? value : Number(String(value))
    if (!Number.isFinite(asNumber)) return null
    return asNumber
}

export function getUserAccountIdFromToken(token) {
    const value = getJwtClaim(token, 'sub')
    if (value === undefined || value === null) return null

    const asNumber = typeof value === 'number' ? value : Number(String(value))
    if (!Number.isFinite(asNumber)) return null
    return asNumber
}
