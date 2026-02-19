import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWineGlassEmpty } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import {
  averageRating,
  lovesCount,
  ratingSummary,
} from '../data/bottles'
import { listBottles } from '../api/wineClubApi'
import { normalizeBottlesResponse } from '../api/normalize'

const filters = ['All', 'Loved ❤️', 'Recent', 'Reds', 'Whites', 'Sparkling', 'Dessert', 'Bangers only']

function sortRecent(list) {
  return [...list].sort((a, b) => {
    const aKey = Number(String(a.eventId ?? '').replaceAll('-', ''))
    const bKey = Number(String(b.eventId ?? '').replaceAll('-', ''))
    return bKey - aKey
  })
}

function topRatedFromList(list, limit = 5) {
  return [...list]
    .sort((a, b) => {
      const byAverage = averageRating(b) - averageRating(a)
      if (byAverage !== 0) return byAverage

      const byLoves = lovesCount(b) - lovesCount(a)
      if (byLoves !== 0) return byLoves

      const aVotes = (a.ratings?.love ?? 0) + (a.ratings?.like ?? 0) + (a.ratings?.meh ?? 0)
      const bVotes = (b.ratings?.love ?? 0) + (b.ratings?.like ?? 0) + (b.ratings?.meh ?? 0)
      return bVotes - aVotes
    })
    .slice(0, limit)
}

function matchesFilter(bottle, filter) {
  if (filter === 'All') return true
  if (filter === 'Loved ❤️') return lovesCount(bottle) >= 4
  if (filter === 'Recent') return Number(String(bottle.eventId ?? '').replaceAll('-', '')) >= 20260101
  if (filter === 'Bangers only') return Boolean(bottle.tags?.includes?.('banger'))
  return bottle.type === filter
}

function matchesSearch(bottle, query) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const haystack = [
    bottle.producer,
    bottle.name,
    bottle.vintage,
    bottle.type,
    bottle.region,
    bottle.eventTitle,
    bottle.eventDate,
    bottle.host,
    bottle.broughtBy,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

export default function CellarScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [bottles, setBottles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    document.title = 'Bottles | Wine Club'
  }, [])

  useEffect(() => {
    let cancelled = false

    listBottles({ pageSize: 250 })
      .then((payload) => {
        if (cancelled) return
        const normalized = normalizeBottlesResponse(payload)
        setBottles(sortRecent(normalized))
      })
      .catch((error) => {
        if (cancelled) return
        setLoadError(error)
        setBottles([])
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredBottles = useMemo(() => {
    return bottles.filter((bottle) => matchesFilter(bottle, activeFilter) && matchesSearch(bottle, searchQuery))
  }, [activeFilter, bottles, searchQuery])

  const hallOfFameBottles = useMemo(() => {
    const shortlist = topRatedFromList(bottles, 8).filter((bottle) => filteredBottles.some((item) => item.id === bottle.id))
    return shortlist.length ? shortlist : topRatedFromList(bottles, 8)
  }, [bottles, filteredBottles])

  const usingSearch = searchQuery.trim().length > 0

  return (
    <div className="cellar-layout">
      <section className="panel bottle-search-panel" aria-label="Bottle search">
        <input
          className="bottle-search-input"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="What was that bottle?"
          aria-label="Search bottles"
        />

        <div className="bottle-filter-row" role="tablist" aria-label="Bottle filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              role="tab"
              className={`bottle-filter-chip${filter === activeFilter ? ' is-active' : ''}`}
              aria-selected={filter === activeFilter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="bottle-section" aria-label="Hall of Fame">
        <div className="bottle-section-head">
          <h2>Hall of Fame</h2>
        </div>

        <div className="hall-carousel">
          {hallOfFameBottles.map((bottle) => (
            <Link
              key={bottle.id}
              to={`/cellar/${bottle.id}`}
              className="hall-card"
              aria-label={`Open ${bottle.producer} ${bottle.name}`}
            >
              {bottle.image ? (
                <img className="hall-card-image" src={bottle.image} alt={`${bottle.producer} ${bottle.name}`} />
              ) : (
                <div className="hall-card-image is-placeholder" aria-hidden="true">
                  <div className="bottle-photo-placeholder">
                    <FontAwesomeIcon icon={faWineGlassEmpty} />
                    <span>No photo yet</span>
                  </div>
                </div>
              )}
              <div className="hall-card-body">
                <p className="hall-card-name">{bottle.name}</p>
                <p className="hall-card-meta">{bottle.eventDate} • {bottle.broughtBy}</p>
                <p className="hall-card-rating">❤️ {lovesCount(bottle)} · {averageRating(bottle).toFixed(1)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bottle-section" aria-label="Recent bottles">
        <div className="bottle-section-head">
          <h2>Recent Bottles</h2>
          <p>{usingSearch ? 'Search results' : 'Memory mode'}</p>
        </div>

        {loading ? (
          <div className="panel bottle-empty" aria-label="Loading bottles">
            <h3>Loading…</h3>
            <p />
          </div>
        ) : null}

        {!loading && loadError ? (
          <div className="panel bottle-empty" aria-label="Failed to load bottles">
            <h3>Unable to load bottles.</h3>
            <p />
          </div>
        ) : null}

        {!loading && !loadError && usingSearch ? (
          <div className="bottle-list-view" aria-label="Bottle list view">
            {filteredBottles.map((bottle) => (
              <Link key={bottle.id} to={`/cellar/${bottle.id}`} className="bottle-list-item">
                {bottle.image ? (
                  <img className="bottle-list-thumb" src={bottle.image} alt={`${bottle.producer} ${bottle.name}`} />
                ) : (
                  <div className="bottle-list-thumb is-placeholder" aria-hidden="true">
                    <div className="bottle-photo-placeholder is-compact">
                      <FontAwesomeIcon icon={faWineGlassEmpty} />
                    </div>
                  </div>
                )}
                <div className="bottle-list-copy">
                  <p className="bottle-list-title">
                    {bottle.producer} · {bottle.name}
                  </p>
                  <p className="bottle-list-meta">{bottle.eventDate} • {bottle.host}</p>
                  <p className="bottle-list-meta">Brought by {bottle.broughtBy}</p>
                  <p className="bottle-list-rating">{ratingSummary(bottle)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (!loading && !loadError ? (
          <div className="bottle-grid-view" aria-label="Bottle grid view">
            {filteredBottles.map((bottle) => (
              <Link key={bottle.id} to={`/cellar/${bottle.id}`} className="bottle-grid-card">
                {bottle.image ? (
                  <img className="bottle-grid-image" src={bottle.image} alt={`${bottle.producer} ${bottle.name}`} />
                ) : (
                  <div className="bottle-grid-image is-placeholder" aria-hidden="true">
                    <div className="bottle-photo-placeholder">
                      <FontAwesomeIcon icon={faWineGlassEmpty} />
                      <span>No photo yet</span>
                    </div>
                  </div>
                )}
                <div className="bottle-grid-copy">
                  <p className="bottle-grid-title">
                    <span>{bottle.producer}</span>
                    <span>{bottle.name}</span>
                  </p>
                  <p className="bottle-grid-meta">{bottle.eventDate} • {bottle.host}</p>
                  <p className="bottle-grid-meta">Brought by {bottle.broughtBy}</p>
                  <p className="bottle-grid-rating">{ratingSummary(bottle)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null)}

        {!loading && !loadError && !filteredBottles.length ? (
          <div className="panel bottle-empty" aria-label="No matching bottles">
            <h3>No bottles match that search yet.</h3>
            <p>Try a broader search term or switch filter chips.</p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
