import { Link, useParams } from 'react-router-dom'

const eventDetailsById = {
  '2026-03-07': {
    id: '2026-03-07',
    title: 'Next Tasting Night',
    dateLine: 'Thu, Mar 7 @ 7:00 PM',
    location: 'Downtown Cellar Room',
    address: '117 Boardhouse Br',
    host: 'Mike & Kaitlin',
    theme: 'Old World vs New World Reds',
    notes:
      'Bring one red wine and a short tasting note card. We will do a blind comparison and vote for crowd favorite.',
    assignments: [
      { label: 'Host', value: 'Mike & Kaitlin' },
      { label: 'Apps', value: 'Ryan & Kayla' },
      { label: 'Dessert', value: 'Lee & Morganne' },
    ],
  },
}

export default function EventDetailsScreen() {
  const { eventId } = useParams()
  const event = eventDetailsById[eventId] ?? eventDetailsById['2026-03-07']
  const directionsQuery = event.address ?? event.location
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionsQuery)}`

  return (
    <section className="panel event-details" aria-label="Event details">
      <div className="event-details-head">
        <p className="event-details-kicker">Event details</p>
        <h1 className="event-details-title">{event.title}</h1>
        <p className="event-details-date">{event.dateLine}</p>
        <p className="event-details-location">{event.location}</p>
      </div>

    {event.theme ? (
        <div className="event-details-block" aria-label="Theme">
            <h2>Theme</h2>
            <p>{event.theme}</p>
        </div>
    ) : null}
      

      <div className="event-details-block" aria-label="Assignments">
        <h2>Assignments</h2>
        <div className="event-details-assignments">
          {event.assignments.map((assignment) => (
            <div className="event-details-assignment" key={assignment.label}>
              <span className="event-details-label">{assignment.label}</span>
              <span className="event-details-value">{assignment.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="event-details-block" aria-label="Notes">
        <h2>Note</h2>
        <p>{event.notes}</p>
      </div>

      <div className="event-details-actions" aria-label="Event detail actions">
        <button type="button" className="event-action">
          RSVP
        </button>
        <a
          className="event-action event-action-link"
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
