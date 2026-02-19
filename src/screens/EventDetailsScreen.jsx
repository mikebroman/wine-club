import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEvent, putMyRsvp } from '../api/wineClubApi'

function normalizeEventDetails(payload, fallback) {
  const source = payload?.event ?? payload
  if (!source || typeof source !== 'object') return fallback

  const assignments = source.assignments
  const assignmentList = Array.isArray(source.assignments)
    ? source.assignments
    : (assignments && typeof assignments === 'object')
        ? [
            { label: 'Host', value: assignments.host ?? source.host ?? '' },
            { label: 'Apps', value: assignments.apps ?? '' },
            { label: 'Dessert', value: assignments.dessert ?? '' },
          ].filter((item) => item.value)
        : fallback.assignments

  return {
    ...fallback,
    ...source,
    id: String(source.id ?? source.eventId ?? fallback.id ?? ''),
    title: source.title ?? source.name ?? fallback.title ?? '',
    dateLine: source.dateLine ?? source.when ?? source.dateText ?? fallback.dateLine ?? '',
    location: source.location ?? fallback.location ?? '',
    address: source.address ?? fallback.address ?? '',
    theme: source.theme ?? fallback.theme ?? '',
    notes: source.notes ?? source.note ?? fallback.notes ?? '',
    assignments: assignmentList,
  }
}

export default function EventDetailsScreen() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [rsvpStatus, setRsvpStatus] = useState('none')
  const [showRsvpOptions, setShowRsvpOptions] = useState(false)
  const rsvpLabelByStatus = {
    none: 'RSVP',
    accepted: 'Going',
    tentative: 'Maybe',
    declined: 'Declined',
  }
  const rsvpButtonLabel = rsvpLabelByStatus[rsvpStatus] ?? 'RSVP'
  const directionsQuery = event?.address ?? event?.location
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionsQuery)}`

  useEffect(() => {
    if (!event?.title) {
      document.title = 'Event | Wine Club'
      return
    }

    document.title = `${event.title} | Wine Club`
  }, [event?.title])

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return
      setEvent({
        id: String(eventId ?? ''),
        title: 'Loading…',
        dateLine: '',
        location: '',
        address: '',
        theme: '',
        notes: '',
        assignments: [],
      })
      setRsvpStatus('none')
    })

    if (!eventId) {
      return () => {
        cancelled = true
      }
    }

    getEvent(eventId)
      .then((payload) => {
        if (cancelled) return
        setEvent((previous) => normalizeEventDetails(payload, previous ?? {}))

        // TODO: Map backend's "my RSVP" field into UI state.
        const status = payload?.myRsvpStatus ?? payload?.event?.myRsvpStatus
        if (typeof status === 'string') setRsvpStatus(status)
      })
      .catch(() => {
        // TODO: Show a proper error state once designs are defined.
      })

    return () => {
      cancelled = true
    }
  }, [eventId])

  const assignments = Array.isArray(event?.assignments) ? event.assignments : []

  return (
    <section className="panel event-details" aria-label="Event details">
      <div className="event-details-head">
        <p className="event-details-kicker">Event details</p>
        <h1 className="event-details-title">{event?.title ?? 'Loading…'}</h1>
        <p className="event-details-date">{event?.dateLine ?? ''}</p>
        <p className="event-details-location">{event?.location ?? ''}</p>
      </div>

    {event?.theme ? (
        <div className="event-details-block" aria-label="Theme">
            <h2>Theme</h2>
        <p>{event.theme}</p>
        </div>
    ) : null}
      

      <div className="event-details-block" aria-label="Assignments">
        <h2>Assignments</h2>
        <div className="event-details-assignments">
          {assignments.map((assignment) => (
            <div className="event-details-assignment" key={assignment.label}>
              <span className="event-details-label">{assignment.label}</span>
              <span className="event-details-value">{assignment.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="event-details-block" aria-label="Notes">
        <h2>Note</h2>
        <p>{event?.notes ?? ''}</p>
      </div>

      <div className="event-details-actions" aria-label="Event detail actions">
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
                if (event?.id) {
                  putMyRsvp(event.id, { status: 'accepted' }).catch(() => {
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
                if (event?.id) {
                  putMyRsvp(event.id, { status: 'tentative' }).catch(() => {
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
                if (event?.id) {
                  putMyRsvp(event.id, { status: 'declined' }).catch(() => {
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
        <a
          className="event-action event-action-link event-action-half"
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Directions
        </a>
        <Link className="event-action event-action-link event-action-back" to="/events">
          Back to Events
        </Link>
      </div>
    </section>
  )
}
