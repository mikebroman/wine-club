import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWineGlassEmpty } from '@fortawesome/free-solid-svg-icons'
import { Link, useParams } from 'react-router-dom'
import { averageRating, bottleCatalog, lovesCount, ratingSummary } from '../data/bottles'

const ratingLabels = [
  { key: 'love', icon: '❤️', label: 'Love' },
  { key: 'like', icon: '👍', label: 'Like' },
  { key: 'meh', icon: '😐', label: 'Meh' },
]

function buildSimilarHits(targetBottle) {
  return bottleCatalog
    .filter((bottle) => bottle.id !== targetBottle.id)
    .map((bottle) => {
      const sharedTags = bottle.tags.filter((tag) => targetBottle.tags.includes(tag)).length
      const typeBonus = bottle.type === targetBottle.type ? 1 : 0
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

export default function BottleDetailsScreen() {
  const { bottleId } = useParams()
  const bottle = bottleCatalog.find((item) => item.id === bottleId) ?? bottleCatalog[0]
  const hasPhoto = Boolean(bottle.image)
  const [selectedRating, setSelectedRating] = useState('')
  const [notes, setNotes] = useState('')

  const similarHits = useMemo(() => buildSimilarHits(bottle), [bottle])

  return (
    <section className="panel bottle-detail" aria-label="Bottle details">
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
        <p className="bottle-detail-vintage">Vintage: {bottle.vintage}</p>
        <p className="bottle-detail-meta">From: {bottle.eventDate} at {bottle.eventTitle}</p>
        <p className="bottle-detail-meta">Brought by: {bottle.broughtBy}</p>
        <p className="bottle-detail-rating-summary">{ratingSummary(bottle)} · ❤️ {lovesCount(bottle)} · {averageRating(bottle).toFixed(1)}</p>
      </div>

      <div className="bottle-detail-ratings" aria-label="Rate this bottle">
        {ratingLabels.map((rating) => (
          <button
            key={rating.key}
            type="button"
            className={`bottle-rate-btn${selectedRating === rating.key ? ' is-active' : ''}`}
            onClick={() => setSelectedRating(rating.key)}
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
          placeholder="Add your tasting note"
        />
        <button type="button" className="bottle-photo-btn">{hasPhoto ? 'Change photo' : 'Add photo'}</button>
      </div>

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

      <Link className="event-action event-action-link bottle-detail-back" to="/cellar">
        Back to Bottles
      </Link>
    </section>
  )
}
