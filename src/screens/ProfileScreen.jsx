import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

export default function ProfileScreen({ onLogout }) {
  return (
    <>
      <section className="panel" aria-label="Household profile">
        <div className="panel-head">
          <h2>Household Profile</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onLogout}
            aria-label="Log out"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
        <ul className="wine-list">
          <li>
            <span>Name</span>
            <span>Mike & Sarah</span>
          </li>
          <li>
            <span>Members</span>
            <span>Mike, Sarah</span>
          </li>
          <li>
            <span>Rotation Roles</span>
            <span>Apps · Wine · Host</span>
          </li>
        </ul>
      </section>

      <section className="panel" aria-label="Taste tendencies">
        <h2>Taste Tendencies</h2>
        <p>Derived from ratings, no manual setup.</p>
        <ul className="wine-list">
          <li>
            <span>Leanings</span>
            <span>Bold reds, Rhone, dry whites</span>
          </li>
          <li>
            <span>Reds vs Whites</span>
            <span>70% Reds · 30% Whites</span>
          </li>
          <li>
            <span>Average Rating</span>
            <span>👍 Like</span>
          </li>
        </ul>
      </section>
    </>
  )
}
