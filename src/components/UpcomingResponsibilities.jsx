import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCakeCandles,
  faHouse,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons'

const roleConfig = [
  { key: 'host', label: 'Host', icon: faHouse },
  { key: 'apps', label: 'Apps', icon: faUtensils },
  { key: 'dessert', label: 'Dessert', icon: faCakeCandles },
]

export default function UpcomingResponsibilities({ gatherings, currentHousehold }) {
  return (
    <section className="panel upcoming-resp" aria-label="Upcoming responsibilities">
      <h2 className="upcoming-resp-title">Who’s Up Next</h2>

      <div className="upcoming-resp-scroll" aria-label="Upcoming gatherings">
        {gatherings.map((gathering) => {
          const isInAnyRole =
            gathering.host === currentHousehold ||
            gathering.apps === currentHousehold ||
            gathering.dessert === currentHousehold

          return (
            <button
              key={gathering.id}
              type="button"
              className={`upcoming-resp-item${isInAnyRole ? ' is-mine' : ''}`}
              onClick={() => console.log(gathering.id)}
              aria-label={`Open gathering ${gathering.date}`}
            >
              <div className="upcoming-resp-date">
                <span className="upcoming-resp-date-text">{gathering.date}</span>
                {isInAnyRole ? <span className="upcoming-resp-you">You</span> : null}
              </div>

              <div className="upcoming-resp-roles" aria-label="Roles">
                {roleConfig.map((role) => {
                  const household = gathering[role.key]
                  const isYou = household === currentHousehold

                  return (
                    <div
                      key={role.key}
                      className={`upcoming-resp-row${isYou ? ' is-you' : ''}`}
                    >
                      <span className="upcoming-resp-role" aria-hidden="true">
                        <FontAwesomeIcon icon={role.icon} />
                      </span>
                      <span className="upcoming-resp-name">{household}</span>
                    </div>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
