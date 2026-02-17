import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCakeCandles,
  faHouse,
  faShrimp,
} from '@fortawesome/free-solid-svg-icons'

const roleConfig = [
  { key: 'host', label: 'Host', icon: faHouse },
  { key: 'apps', label: 'Apps', icon: faShrimp },
  { key: 'dessert', label: 'Dessert', icon: faCakeCandles },
]

export default function UpcomingResponsibilities({ gatherings, currentHousehold }) {
  return (
    <section className="panel upcoming-resp" aria-label="Upcoming responsibilities">
      <h2 className="upcoming-resp-title">Upcoming</h2>

      <div className="upcoming-resp-scroll" aria-label="Upcoming gatherings timeline">
        {gatherings.map((gathering) => {
          const [month = '', day = ''] = gathering.date.split(' ')
          const isInAnyRole =
            gathering.host === currentHousehold ||
            gathering.apps === currentHousehold ||
            gathering.dessert === currentHousehold

          return (
            <article
              key={gathering.id}
              className={`upcoming-resp-item${isInAnyRole ? ' is-mine' : ''}`}
              aria-label={`Responsibilities for ${gathering.date}`}
            >
              <div className="upcoming-resp-marker" aria-label={gathering.date}>
                <span className="upcoming-resp-month">{month}</span>
                <span className="upcoming-resp-day">{day}</span>
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
                      <span className="upcoming-resp-label">{role.label}</span>
                    </div>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
