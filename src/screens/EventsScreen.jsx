import { useState } from 'react'
import { Link } from 'react-router-dom'
import UpcomingResponsibilities from '../components/UpcomingResponsibilities'

const nextTasting = {
  title: 'Next Event',
  dateLine: 'Thu, Mar 7 · 7:00 PM',
  location: '117 Boardhouse Br',
  assignments: {
    host: 'Mike & Kaitlin',
    apps: 'Ryan & Kayla',
    dessert: 'Lee & Morganne',
  },
}

const upcomingEvents = [
  {
    id: '2026-03-07',
    dateShort: 'Mar 7',
    dateLong: 'Thu, Mar 7 · 7:00 PM',
    location: 'Downtown Cellar Room',
    host: 'Mike & Kaitlin',
  },
  {
    id: '2026-04-04',
    dateShort: 'Apr 4',
    dateLong: 'Sat, Apr 4 · 7:00 PM',
    location: 'Lee Home',
    host: 'Lee Family',
  },
  {
    id: '2026-05-09',
    dateShort: 'May 9',
    dateLong: 'Sat, May 9 · 7:00 PM',
    location: 'Patel Home',
    host: 'Patel',
  },
]

const pastEvents = [
  {
    id: '2026-02-03',
    dateShort: 'Feb 3',
    location: 'Patel Home',
    bottlesCount: 6,
    photosCount: 12,
    topRated: '2018 Rioja Reserva',
  },
  {
    id: '2026-01-12',
    dateShort: 'Jan 12',
    location: 'Gomez Home',
    bottlesCount: 5,
    photosCount: 8,
    topRated: 'Chenin Blanc (Loire)',
  },
  {
    id: '2025-12-07',
    dateShort: 'Dec 7',
    location: 'Johnsons Home',
    bottlesCount: 7,
    photosCount: 15,
    topRated: 'Barolo (Nebbiolo)',
  },
]

const responsibilityGatherings = [
  { id: '1', date: 'Mar 7', host: 'Johnsons', apps: 'Lee', dessert: 'Patel' },
  { id: '2', date: 'Apr 11', host: 'Lee', apps: 'Patel', dessert: 'You' },
  { id: '3', date: 'May 16', host: 'Patel', apps: 'You', dessert: 'Gomez' },
]

export default function EventsScreen({ nextEventRsvpStatus = 'none', onNextEventRsvpSet }) {
  const [listView, setListView] = useState('upcoming')
  const [showRsvpOptions, setShowRsvpOptions] = useState(false)
  const rsvpLabelByStatus = {
    none: 'RSVP',
    accepted: 'Going',
    tentative: 'Maybe',
    declined: 'Declined',
  }
  const rsvpButtonLabel = rsvpLabelByStatus[nextEventRsvpStatus] ?? 'RSVP'

  return (
    <>
      <section className="panel events-hero" aria-label="Next tasting">
        <div className="events-hero-head">
          <h2 className="events-hero-title">{nextTasting.title}</h2>
          <div className="events-hero-divider" aria-hidden="true" />
        </div>

        <p className="events-next-date">{nextTasting.dateLine}</p>
        <p className="events-next-location">{nextTasting.location}</p>

        <div className="events-assignments" aria-label="Assignments">
          <div className="events-assignment">
            <span className="events-assignment-label">Host</span>
            <span className="events-assignment-value">{nextTasting.assignments.host}</span>
          </div>
          <div className="events-assignment">
            <span className="events-assignment-label">Apps</span>
            <span className="events-assignment-value">{nextTasting.assignments.apps}</span>
          </div>
          <div className="events-assignment">
            <span className="events-assignment-label">Dessert</span>
            <span className="events-assignment-value">{nextTasting.assignments.dessert}</span>
          </div>
        </div>

        <div className="event-actions" aria-label="Event actions">
          <div className={`event-rsvp-pop event-action-half${showRsvpOptions ? ' is-open' : ''}`}>
            <button
              type="button"
              className="event-action"
              onClick={() => setShowRsvpOptions((previous) => !previous)}
              aria-expanded={showRsvpOptions}
              aria-label={`RSVP status: ${rsvpButtonLabel}`}
            >
              {rsvpButtonLabel}
            </button>
            <div className="event-rsvp-pop-menu" role="group" aria-label="Choose RSVP response">
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  onNextEventRsvpSet?.('accepted')
                  setShowRsvpOptions(false)
                }}
                aria-pressed={nextEventRsvpStatus === 'accepted'}
              >
                Accept
              </button>
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  onNextEventRsvpSet?.('tentative')
                  setShowRsvpOptions(false)
                }}
                aria-pressed={nextEventRsvpStatus === 'tentative'}
              >
                Tentative
              </button>
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  onNextEventRsvpSet?.('declined')
                  setShowRsvpOptions(false)
                }}
                aria-pressed={nextEventRsvpStatus === 'declined'}
              >
                Decline
              </button>
            </div>
          </div>
          <Link className="event-action event-action-link event-action-half" to="/events/2026-03-07">
            Details
          </Link>
        </div>
      </section>

      <UpcomingResponsibilities
        gatherings={responsibilityGatherings}
        currentHousehold="You"
      />

      <section className="events-list" aria-label="Events list">
        <div className="events-list-tabs" role="tablist" aria-label="Upcoming or past">
          <button
            type="button"
            className={`events-list-tab${listView === 'upcoming' ? ' is-active' : ''}`}
            onClick={() => setListView('upcoming')}
            role="tab"
            aria-selected={listView === 'upcoming'}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={`events-list-tab${listView === 'past' ? ' is-active' : ''}`}
            onClick={() => setListView('past')}
            role="tab"
            aria-selected={listView === 'past'}
          >
            Past
          </button>
        </div>

        <div className="events-cards" aria-label="Event cards">
          {listView === 'upcoming'
            ? upcomingEvents.slice(0, 3).map((event) => (
                <article key={event.id} className="panel events-compact" aria-label="Upcoming event">
                  <div className="events-compact-head">
                    <span className="events-compact-date">{event.dateShort}</span>
                    <span className="events-compact-meta">{event.location}</span>
                  </div>
                  <p className="events-compact-sub">{event.dateLong}</p>
                  <p className="events-compact-sub">Host: {event.host}</p>
                </article>
              ))
            : pastEvents.map((event) => (
                <article key={event.id} className="panel events-compact" aria-label="Past event">
                  <div className="events-compact-head">
                    <span className="events-compact-date">{event.dateShort}</span>
                    <span className="events-compact-meta">{event.location}</span>
                  </div>
                  <p className="events-compact-stats">
                    <span aria-hidden="true">🍇</span> {event.bottlesCount} bottles ·{' '}
                    <span aria-hidden="true">📷</span> {event.photosCount} photos
                  </p>
                  <p className="events-compact-sub">Top rated: {event.topRated}</p>
                </article>
              ))}
        </div>
      </section>
    </>
  )
}
