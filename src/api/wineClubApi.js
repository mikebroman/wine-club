import { apiFetch, buildUrl } from './http'

export function postGoogleAuth({ credential } = {}) {
  return apiFetch('/api/v1/auth/google', {
    method: 'POST',
    body: { credential },
  })
}

export function getMe() {
  return apiFetch('/api/v1/me')
}

export function getMyProfile() {
  return apiFetch('/api/v1/me/profile')
}

export function getNextEvent({ include } = {}) {
  return apiFetch('/api/v1/events/next', {
    query: include ? { include } : undefined,
  })
}

export function getEvent(eventId, { include } = {}) {
  return apiFetch(`/api/v1/events/${encodeURIComponent(eventId)}`, {
    query: include ? { include } : undefined,
  })
}

export function putMyRsvp(eventId, { status } = {}) {
  return apiFetch(`/api/v1/events/${encodeURIComponent(eventId)}/my-rsvp`, {
    method: 'PUT',
    body: status ? { status } : {},
  })
}

export function getCurrentAnnouncements({ include } = {}) {
  return apiFetch('/api/v1/announcements/current', {
    query: include ? { include } : undefined,
  })
}

export function putMyAnnouncementReaction(announcementId, emoji) {
  return apiFetch(
    `/api/v1/announcements/${encodeURIComponent(announcementId)}/my-reactions/${encodeURIComponent(emoji)}`,
    { method: 'PUT' },
  )
}

export function listBottles({ sort, limit, filter, q, page, pageSize } = {}) {
  return apiFetch('/api/v1/bottles', {
    query: { sort, limit, filter, q, page, pageSize },
  })
}

export function getBottle(bottleId, { include } = {}) {
  return apiFetch(`/api/v1/bottles/${encodeURIComponent(bottleId)}`, {
    query: include ? { include } : undefined,
  })
}

export function putMyBottleRating(bottleId, { rating } = {}) {
  return apiFetch(`/api/v1/bottles/${encodeURIComponent(bottleId)}/my-rating`, {
    method: 'PUT',
    body: rating ? { rating } : {},
  })
}

export function putMyBottleNote(bottleId, { note } = {}) {
  return apiFetch(`/api/v1/bottles/${encodeURIComponent(bottleId)}/my-note`, {
    method: 'PUT',
    body: { note: String(note ?? '') },
  })
}

export async function uploadBottlePhoto(bottleId, file) {
  const form = new FormData()
  form.append('file', file)

  return apiFetch(`/api/v1/bottles/${encodeURIComponent(bottleId)}/photo`, {
    method: 'POST',
    body: form,
  })
}

export function getUpcomingResponsibilities({ householdId, limit } = {}) {
  return apiFetch('/api/v1/responsibilities/upcoming', {
    query: { HouseholdId: householdId, limit },
  })
}

export function getOpenApiSpec() {
  return apiFetch('/openapi/v1.json')
}

export function buildUploadUrl(path) {
  if (!path) return null
  const raw = String(path)
  if (/^https?:\/\//i.test(raw)) return raw
  const normalized = raw.startsWith('/') ? raw : `/uploads/${raw}`
  return buildUrl(normalized)
}
