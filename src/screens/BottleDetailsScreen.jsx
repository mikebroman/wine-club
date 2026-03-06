import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWineGlassEmpty } from '@fortawesome/free-solid-svg-icons'
import { Link, useParams } from 'react-router-dom'
import { averageRating, lovesCount, ratingSummary } from '../data/bottles'
import { buildUploadUrl, getBottle, listBottles, putMyBottleNote, putMyBottleRating, uploadBottlePhoto } from '../api/wineClubApi'
import { normalizeBottle, normalizeBottlesResponse } from '../api/normalize'

const ratingLabels = [
  { key: 'love', icon: '❤️', label: 'Love' },
  { key: 'like', icon: '👍', label: 'Like' },
  { key: 'meh', icon: '😐', label: 'Meh' },
]

function buildSimilarHitsFromList(targetBottle, list) {
  const targetTags = Array.isArray(targetBottle?.tags) ? targetBottle.tags : []
  return (Array.isArray(list) ? list : [])
    .filter((bottle) => bottle?.id && bottle.id !== targetBottle?.id)
    .map((bottle) => {
      const tags = Array.isArray(bottle.tags) ? bottle.tags : []
      const sharedTags = tags.filter((tag) => targetTags.includes(tag)).length
      const typeBonus = bottle.type && targetBottle?.type && bottle.type === targetBottle.type ? 1 : 0
      return {
        bottle,
        score: sharedTags + typeBonus,
      }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.bottle)
}

function extractPhotoUrl(payload) {
  if (!payload) return null
  if (typeof payload === 'string') return payload
  if (payload.url) return String(payload.url)
  if (payload.photoUrl) return String(payload.photoUrl)
  if (payload.path) return buildUploadUrl(payload.path)
  if (payload.photoPath) return buildUploadUrl(payload.photoPath)
  return null
}

export default function BottleDetailsScreen({ clubScopeKey } = {}) {
  const { bottleId } = useParams()
  const [bottle, setBottle] = useState(null)
  const [allBottles, setAllBottles] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasPhoto = Boolean(bottle?.image)
  const [selectedRating, setSelectedRating] = useState('')
  const [notes, setNotes] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const producer = bottle?.producer
    const name = bottle?.name
    const vintage = bottle?.vintage
    const label = [producer, name, vintage].filter(Boolean).join(' ')
    document.title = label ? `${label} | Wine Club` : 'Bottle | Wine Club'
  }, [bottle?.name, bottle?.producer, bottle?.vintage])

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setLoadError(null)
    setBottle(null)
    setSelectedRating('')
    setNotes('')

    if (!bottleId) {
      return () => {
        cancelled = true
      }
    }

    getBottle(bottleId)
      .then((payload) => {
        if (cancelled) return
        const normalized = normalizeBottle(payload)
        if (normalized?.id) {
          setBottle(normalized)

          // TODO: Initialize these from backend fields once contract is known.
          // e.g. `normalized.myRating` / `normalized.myNote`.
        } else {
          setBottle(null)
        }
      })
      .catch((error) => {
        if (cancelled) return
        setLoadError(error)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    // Used only for the "Similar hits" section.
    listBottles({ pageSize: 250 })
      .then((payload) => {
        if (cancelled) return
        setAllBottles(normalizeBottlesResponse(payload))
      })
      .catch(() => {
        // TODO: Decide if similar hits should hide or show an error.
        setAllBottles([])
      })

    return () => {
      cancelled = true
    }
  }, [bottleId, clubScopeKey])

  const similarHits = useMemo(() => {
    if (!bottle?.id) return []
    return buildSimilarHitsFromList(bottle, allBottles)
  }, [allBottles, bottle])

  return (
    <section className="panel bottle-detail" aria-label="Bottle details">
      {loading ? (
        <div className="empty-panel" aria-label="Loading bottle">
          <h3>Loading bottle…</h3>
          <p>Fetching tasting details.</p>
        </div>
      ) : null}

      {!loading && loadError ? (
        <div className="empty-panel" aria-label="Failed to load bottle">
          <h3>Unable to load bottle.</h3>
          <p>Please try again in a moment.</p>
        </div>
      ) : null}

      {!loading && !loadError && !bottle ? (
        <div className="empty-panel" aria-label="Bottle not found">
          <h3>Bottle not found.</h3>
          <p>It may have been removed or the link is incorrect.</p>
        </div>
      ) : null}

      {!loading && !loadError && bottle ? (
        <>
          {hasPhoto ? (
            <img className="bottle-detail-image" src={bottle.image} alt={`${bottle.producer} ${bottle.name}`} />
          ) : (
            <div className="bottle-detail-image is-placeholder" aria-hidden="true">
              <div className="bottle-photo-placeholder">
                <FontAwesomeIcon icon={faWineGlassEmpty} />
                <span>No photo yet</span>
              </div>
            </div>
          )}

          <div className="bottle-detail-head">
            <h1>{bottle.producer} {bottle.name}</h1>
            {bottle.vintage ? <p className="bottle-detail-vintage">Vintage: {bottle.vintage}</p> : null}
            {bottle.eventDate || bottle.eventTitle ? (
              <p className="bottle-detail-meta">From: {bottle.eventDate ?? ''}{bottle.eventTitle ? ` at ${bottle.eventTitle}` : ''}</p>
            ) : null}
            {bottle.broughtBy ? <p className="bottle-detail-meta">Brought by: {bottle.broughtBy}</p> : null}
            <p className="bottle-detail-rating-summary">
              {ratingSummary(bottle)} · ❤️ {lovesCount(bottle)} · {averageRating(bottle).toFixed(1)}
            </p>
          </div>

          <div className="bottle-detail-ratings" aria-label="Rate this bottle">
            {ratingLabels.map((rating) => (
              <button
                key={rating.key}
                type="button"
                className={`bottle-rate-btn${selectedRating === rating.key ? ' is-active' : ''}`}
                onClick={() => {
                  setSelectedRating(rating.key)
                  if (bottle.id) {
                    putMyBottleRating(bottle.id, { rating: rating.key }).catch(() => {
                      // TODO: Handle auth failures once auth exists.
                    })
                  }
                }}
                aria-pressed={selectedRating === rating.key}
              >
                <span aria-hidden="true">{rating.icon}</span> {rating.label}
              </button>
            ))}
          </div>

          <div className="bottle-detail-notes" aria-label="Bottle notes">
            <label htmlFor="bottle-note">Notes</label>
            <textarea
              id="bottle-note"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => {
                if (bottle.id) {
                  putMyBottleNote(bottle.id, { note: notes }).catch(() => {
                    // TODO: Handle auth failures once auth exists.
                  })
                }
              }}
              placeholder="Add your tasting note"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return

                if (!bottle.id) return

                uploadBottlePhoto(bottle.id, file)
                  .then((payload) => {
                    const url = extractPhotoUrl(payload)
                    if (!url) return
                    setBottle((previous) => ({ ...previous, image: url }))
                  })
                  .catch(() => {
                    // TODO: Handle auth failures once auth exists.
                  })
                  .finally(() => {
                    // Allow selecting the same file again.
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  })
              }}
            />
            <button
              type="button"
              className="bottle-photo-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {hasPhoto ? 'Change photo' : 'Add photo'}
            </button>
          </div>

          {similarHits.length ? (
            <div className="bottle-similar" aria-label="Similar hits">
              <h2>Similar hits</h2>
              <div className="bottle-similar-list">
                {similarHits.map((similarBottle) => (
                  <Link key={similarBottle.id} to={`/cellar/${similarBottle.id}`} className="bottle-similar-item">
                    {similarBottle.image ? (
                      <img src={similarBottle.image} alt={`${similarBottle.producer} ${similarBottle.name}`} />
                    ) : (
                      <div className="bottle-similar-image is-placeholder" aria-hidden="true">
                        <div className="bottle-photo-placeholder is-compact">
                          <FontAwesomeIcon icon={faWineGlassEmpty} />
                        </div>
                      </div>
                    )}
                    <div>
                      <p>{similarBottle.name}</p>
                      <small>{similarBottle.type} • {similarBottle.region}</small>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <Link className="event-action event-action-link bottle-detail-back" to="/cellar">
        Back to Bottles
      </Link>
    </section>
  )
}
