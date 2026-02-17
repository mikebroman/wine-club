export default function CellarScreen() {
  return (
    <>
      <section className="panel" aria-label="Bottle memory">
        <h2>Bottle Memory</h2>
        <p>Find the bottle everyone keeps asking about.</p>
        <ul className="wine-list">
          <li>
            <span>Search</span>
            <span>Name, event, or household</span>
          </li>
          <li>
            <span>Top Rated</span>
            <span>❤️ Love · 14 bottles</span>
          </li>
          <li>
            <span>Recent Event</span>
            <span>January Harvest Night</span>
          </li>
        </ul>
      </section>

      <section className="panel" aria-label="Event to bottles">
        <h2>Event → Bottles</h2>
        <p>January Harvest Night</p>
        <ul className="wine-list">
          <li>
            <span>Domaine Tempier Bandol</span>
            <span>❤️ Love</span>
          </li>
          <li>
            <span>Ridge Three Valleys</span>
            <span>👍 Like</span>
          </li>
          <li>
            <span>Txakoli Getariako</span>
            <span>😐 Meh</span>
          </li>
        </ul>
      </section>

      <section className="panel" aria-label="Bottle to ratings">
        <h2>Bottle → Ratings</h2>
        <p>Ridge Three Valleys</p>
        <ul className="wine-list">
          <li>
            <span>Mike & Sarah</span>
            <span>👍 Like</span>
          </li>
          <li>
            <span>Jamie & Priya</span>
            <span>❤️ Love</span>
          </li>
          <li>
            <span>Alex & Drew</span>
            <span>👍 Like</span>
          </li>
        </ul>
      </section>
    </>
  )
}
