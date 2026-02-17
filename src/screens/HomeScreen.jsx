import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

export default function HomeScreen() {
  return (
    <>
      <header className="hero">
        <p className="kicker">
          <FontAwesomeIcon icon={faEnvelope} className="kicker-icon" />
          Message from the Sommelier
        </p>
        <h1 className="hero-title">Reminder</h1>
        <p className="hero-note">
          What's up this month: a quick note about the picks, tasting notes from last month, or a reminder about the next event.
        </p>
      </header>

      <section className="panel event-card" aria-label="Next event">
        <div className="event-head">
          <div className="event-chip" aria-hidden="true">
            <span className="event-month">MAR</span>
            <span className="event-day">7</span>
          </div>
          <div className="event-meta">
            <h2>Next tasting</h2>
            <p className="event-when">Thu, Mar 7 · 7:00 PM</p>
            <p className="event-where">Downtown Cellar Room</p>
          </div>
        </div>
        <div className="event-actions" aria-label="Event actions">
          <button type="button" className="event-action">
            RSVP
          </button>
          <button type="button" className="event-action">
            Directions
          </button>
          <button type="button" className="event-action">
            Details
          </button>
        </div>
      </section>
    </>
  )
}
