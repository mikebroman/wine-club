import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useMeProfile } from '../profile/MeProfileContext'

export default function ProfileScreen({ onLogout }) {
  const { user } = useAuth()
  const { profile, status } = useMeProfile()

  useEffect(() => {
    document.title = 'Profile | Wine Club'
  }, [])

  const householdName = useMemo(() => {
    const membership = Array.isArray(profile?.householdMemberships) ? profile.householdMemberships[0] : null
    return membership?.householdName ?? ''
  }, [profile?.householdMemberships])

  const memberships = useMemo(() => {
    const list = profile?.householdMemberships
    return Array.isArray(list) ? list : []
  }, [profile?.householdMemberships])

  const activeClubName = useMemo(() => {
    const activeId = Number(profile?.activeClubId)
    if (!Number.isFinite(activeId)) return ''
    const clubs = Array.isArray(profile?.clubs) ? profile.clubs : []
    const match = clubs.find((c) => Number(c?.clubId) === activeId)
    return String(match?.clubName ?? '').trim()
  }, [profile?.activeClubId, profile?.clubs])

  const isLoading = status === 'loading' || status === 'idle'
  const hasProfile = Boolean(profile)

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

        {isLoading ? (
          <div className="empty-panel" aria-label="Loading profile">
            <h3>Loading profile…</h3>
            <p>Fetching your household details.</p>
          </div>
        ) : !hasProfile ? (
          <div className="empty-panel" aria-label="Profile unavailable">
            <h3>Profile unavailable.</h3>
            <p>If you just signed in, try again in a moment.</p>
          </div>
        ) : memberships.length ? (
          <ul className="wine-list">
            {String(householdName).trim() ? (
              <li>
                <span>Name</span>
                <span>{householdName}</span>
              </li>
            ) : null}
            {activeClubName ? (
              <li>
                <span>Club</span>
                <span>{activeClubName}</span>
              </li>
            ) : null}
            <li>
              <span>Active Club Id</span>
              <span>{profile?.activeClubId}</span>
            </li>
            {user?.email ? (
              <li>
                <span>Email</span>
                <span>{user.email}</span>
              </li>
            ) : null}
          </ul>
        ) : (
          <div className="empty-panel" aria-label="No household details">
            <h3>No household details yet.</h3>
            <p>Once your profile is set up, it’ll appear here.</p>
          </div>
        )}
      </section>
    </>
  )
}
