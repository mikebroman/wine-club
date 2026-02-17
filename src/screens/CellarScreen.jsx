import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWineGlassEmpty } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import {
  averageRating,
  bottleCatalog,
  lovesCount,
  ratingSummary,
  recentBottles,
  topRatedBottles,
} from '../data/bottles'

const filters = ['All', 'Loved ❤️', 'Recent', 'Reds', 'Whites', 'Sparkling', 'Dessert', 'Bangers only']

function matchesFilter(bottle, filter) {
  if (filter === 'All') return true
  if (filter === 'Loved ❤️') return lovesCount(bottle) >= 4
  if (filter === 'Recent') return Number(bottle.eventId.replaceAll('-', '')) >= 20260101
  if (filter === 'Bangers only') return bottle.tags.includes('banger')
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

  const filteredBottles = useMemo(() => {
    return recentBottles().filter((bottle) => matchesFilter(bottle, activeFilter) && matchesSearch(bottle, searchQuery))
  }, [activeFilter, searchQuery])

  const hallOfFameBottles = useMemo(() => {
    const shortlist = topRatedBottles(8).filter((bottle) => filteredBottles.some((item) => item.id === bottle.id))
    return shortlist.length ? shortlist : topRatedBottles(8)
  }, [filteredBottles])

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

        {usingSearch ? (
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
        ) : (
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
        )}

        {!filteredBottles.length ? (
          <div className="panel bottle-empty" aria-label="No matching bottles">
            <h3>No bottles match that search yet.</h3>
            <p>Try a broader search term or switch filter chips.</p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
