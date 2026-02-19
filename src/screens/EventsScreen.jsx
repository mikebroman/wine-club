import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import UpcomingResponsibilities from '../components/UpcomingResponsibilities'
import { getNextEvent, getUpcomingResponsibilities, putMyRsvp } from '../api/wineClubApi'

function formatMonthDay(value) {
  if (!value) return ''
  if (typeof value === 'string' && /^[A-Z][a-z]{2}\s\d{1,2}$/.test(value.trim())) {
    return value.trim()
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return formatted.replace(',', '')
}

function normalizeResponsibilities(payload) {
  const list = Array.isArray(payload) ? payload : (payload?.items ?? payload?.responsibilities ?? payload?.data ?? [])
  if (!Array.isArray(list)) return null

  return list
    .map((item, index) => {
      const source = item && typeof item === 'object' ? item : {}
      return {
        id: String(source.id ?? source.responsibilityId ?? index),
        date: formatMonthDay(source.date ?? source.eventDate ?? source.when ?? source.startsAt ?? ''),
        host: source.host ?? source.roles?.host ?? source.assignments?.host ?? '',
        apps: source.apps ?? source.roles?.apps ?? source.assignments?.apps ?? '',
        dessert: source.dessert ?? source.roles?.dessert ?? source.assignments?.dessert ?? '',
      }
    })
    .filter((entry) => entry.date)
}

function normalizeNextEvent(payload) {
  const source = payload?.event ?? payload
  if (!source || typeof source !== 'object') return null

  const assignments = source.assignments && typeof source.assignments === 'object' ? source.assignments : {}

  return {
    id: String(source.id ?? source.eventId ?? ''),
    title: source.title ?? source.name ?? '',
    dateLine: source.dateLine ?? source.when ?? source.dateText ?? '',
    location: source.location ?? source.address ?? '',
    assignments: {
      host: assignments.host ?? source.host ?? '',
      apps: assignments.apps ?? '',
      dessert: assignments.dessert ?? '',
    },
  }
}

export default function EventsScreen() {
  const [showRsvpOptions, setShowRsvpOptions] = useState(false)
  const [nextEvent, setNextEvent] = useState(null)
  const [gatherings, setGatherings] = useState([])
  const [rsvpStatus, setRsvpStatus] = useState('none')
  const rsvpLabelByStatus = {
    none: 'RSVP',
    accepted: 'Going',
    tentative: 'Maybe',
    declined: 'Declined',
  }
  const rsvpButtonLabel = rsvpLabelByStatus[rsvpStatus] ?? 'RSVP'

  useEffect(() => {
    document.title = 'Events | Wine Club'
  }, [])

  useEffect(() => {
    let cancelled = false

    getNextEvent()
      .then((payload) => {
        if (cancelled) return
        const normalized = normalizeNextEvent(payload)
        if (normalized) {
          setNextEvent(normalized)

          // TODO: Map backend's "my RSVP" field into UI state.
          const status = payload?.myRsvpStatus ?? payload?.event?.myRsvpStatus
          if (typeof status === 'string') setRsvpStatus(status)
        }
      })
      .catch(() => {
        setNextEvent(null)
      })

    // TODO: Provide HouseholdId once we have it from /api/v1/me/profile.
    getUpcomingResponsibilities({ limit: 10 })
      .then((payload) => {
        if (cancelled) return
        const normalized = normalizeResponsibilities(payload)
        if (normalized?.length) setGatherings(normalized)
      })
      .catch(() => {
        setGatherings([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  const displayEvent = nextEvent ?? {
    id: null,
    title: 'Loading…',
    dateLine: '',
    location: '',
    assignments: { host: '', apps: '', dessert: '' },
  }

  return (
    <>
      <section className="panel events-hero" aria-label="Next tasting">
        <div className="events-hero-head">
          <h2 className="events-hero-title">{displayEvent.title}</h2>
          <div className="events-hero-divider" aria-hidden="true" />
        </div>

        <p className="events-next-date">{displayEvent.dateLine}</p>
        <p className="events-next-location">{displayEvent.location}</p>

        <div className="events-assignments" aria-label="Assignments">
          <div className="events-assignment">
            <span className="events-assignment-label">Host</span>
            <span className="events-assignment-value">{displayEvent.assignments.host}</span>
          </div>
          <div className="events-assignment">
            <span className="events-assignment-label">Apps</span>
            <span className="events-assignment-value">{displayEvent.assignments.apps}</span>
          </div>
          <div className="events-assignment">
            <span className="events-assignment-label">Dessert</span>
            <span className="events-assignment-value">{displayEvent.assignments.dessert}</span>
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
                  setRsvpStatus('accepted')
                  if (displayEvent.id) {
                    putMyRsvp(displayEvent.id, { status: 'accepted' }).catch(() => {
                      // TODO: Handle auth failures once auth exists.
                    })
                  }
                  setShowRsvpOptions(false)
                }}
                aria-pressed={rsvpStatus === 'accepted'}
              >
                Accept
              </button>
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  setRsvpStatus('tentative')
                  if (displayEvent.id) {
                    putMyRsvp(displayEvent.id, { status: 'tentative' }).catch(() => {
                      // TODO: Handle auth failures once auth exists.
                    })
                  }
                  setShowRsvpOptions(false)
                }}
                aria-pressed={rsvpStatus === 'tentative'}
              >
                Tentative
              </button>
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  setRsvpStatus('declined')
                  if (displayEvent.id) {
                    putMyRsvp(displayEvent.id, { status: 'declined' }).catch(() => {
                      // TODO: Handle auth failures once auth exists.
                    })
                  }
                  setShowRsvpOptions(false)
                }}
                aria-pressed={rsvpStatus === 'declined'}
              >
                Decline
              </button>
            </div>
          </div>
          <Link
            className="event-action event-action-link event-action-half"
            to={displayEvent.id ? `/events/${displayEvent.id}` : '/events'}
          >
            Details
          </Link>
        </div>
      </section>

      <UpcomingResponsibilities
        gatherings={gatherings}
        currentHousehold="You"
      />
    </>
  )
}
