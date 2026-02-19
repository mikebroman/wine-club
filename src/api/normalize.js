import { buildUploadUrl } from './wineClubApi'

export function normalizeBottle(apiBottle) {
  const source = apiBottle && typeof apiBottle === 'object' ? apiBottle : {}
  const id = source.id ?? source.bottleId ?? ''

  const tags = Array.isArray(source.tags) ? source.tags : []
  const ratings = source.ratings && typeof source.ratings === 'object'
    ? {
        love: Number(source.ratings.love ?? 0),
        like: Number(source.ratings.like ?? 0),
        meh: Number(source.ratings.meh ?? 0),
      }
    : { love: 0, like: 0, meh: 0 }

  const event = source.event && typeof source.event === 'object' ? source.event : null

  const photoUrl = source.image ?? source.photoUrl ?? (source.photoPath ? buildUploadUrl(source.photoPath) : null)

  return {
    ...source,
    id: String(id),
    producer: source.producer ?? source.winery ?? '',
    name: source.name ?? source.label ?? '',
    vintage: source.vintage ?? source.year ?? '',
    type: source.type ?? '',
    region: source.region ?? '',
    eventId: source.eventId ?? event?.id ?? '',
    eventDate: source.eventDate ?? event?.date ?? '',
    eventTitle: source.eventTitle ?? event?.title ?? '',
    host: source.host ?? event?.host ?? '',
    broughtBy: source.broughtBy ?? source.broughtByHousehold ?? '',
    image: photoUrl,
    tags,
    ratings,
  }
}

export function normalizeBottlesResponse(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload.map(normalizeBottle)

  const candidates =
    payload.items ??
    payload.bottles ??
    payload.data ??
    payload.results ??
    []

  return Array.isArray(candidates) ? candidates.map(normalizeBottle) : []
}
