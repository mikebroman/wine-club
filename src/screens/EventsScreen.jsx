export default function EventsScreen() {
  return (
    <>
      <section className="panel" aria-label="Next event">
        <h2>Events (The Spine)</h2>
        <p>Purpose: coordination + rotation truth</p>
        <ul className="wine-list">
          <li>
            <span>Date</span>
            <span>Thursday, March 7 · 7:00 PM</span>
          </li>
          <li>
            <span>Host</span>
            <span>Jamie & Priya</span>
          </li>
          <li>
            <span>Location</span>
            <span>Downtown Cellar Room</span>
          </li>
        </ul>
      </section>

      <section className="panel" aria-label="RSVP and assignments">
        <h2>RSVP + Assignments</h2>
        <ul className="wine-list">
          <li>
            <span>Host</span>
            <span>Jamie & Priya</span>
          </li>
          <li>
            <span>Apps</span>
            <span>Mike & Sarah · Next Up</span>
          </li>
          <li>
            <span>Dessert</span>
            <span>Alex & Drew</span>
          </li>
          <li>
            <span>Wine</span>
            <span>Jordan & Casey · Next Up</span>
          </li>
        </ul>
        <p>Rotation is per household.</p>
      </section>

      <section className="panel" aria-label="Rotation order">
        <h2>Rotation Order</h2>
        <ul className="wine-list">
          <li>
            <span>Host</span>
            <span>Jamie & Priya → Mike & Sarah</span>
          </li>
          <li>
            <span>Apps</span>
            <span>Mike & Sarah → Alex & Drew</span>
          </li>
          <li>
            <span>Dessert</span>
            <span>Alex & Drew → Jordan & Casey</span>
          </li>
          <li>
            <span>Wine</span>
            <span>Jordan & Casey → Jamie & Priya</span>
          </li>
        </ul>
        <p>Skip or swap if needed. Attendance-aware rotation later.</p>
      </section>
    </>
  )
}
