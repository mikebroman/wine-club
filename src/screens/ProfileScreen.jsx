import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useMemo, useState } from 'react'
import { getMe, getMyProfile } from '../api/wineClubApi'

export default function ProfileScreen({ onLogout }) {
  const [me, setMe] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    document.title = 'Profile | Wine Club'
  }, [])

  useEffect(() => {
    let cancelled = false

    getMe()
      .then((payload) => {
        if (cancelled) return
        if (payload && typeof payload === 'object') setMe(payload)
      })
      .catch(() => {
        // Ignore until auth is implemented.
      })

    getMyProfile()
      .then((payload) => {
        if (cancelled) return
        if (payload && typeof payload === 'object') setProfile(payload)
      })
      .catch(() => {
        // Ignore until auth is implemented.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const householdName = useMemo(() => {
    return profile?.householdName ?? profile?.name ?? me?.name ?? '—'
  }, [me?.name, profile?.householdName, profile?.name])

  const membersLabel = useMemo(() => {
    const members = profile?.members ?? profile?.householdMembers
    if (Array.isArray(members) && members.length) {
      return members.map((m) => (typeof m === 'string' ? m : (m?.name ?? ''))).filter(Boolean).join(', ')
    }

    return profile?.membersLabel ?? '—'
  }, [profile?.householdMembers, profile?.members, profile?.membersLabel])

  const rolesLabel = useMemo(() => {
    const roles = profile?.rotationRoles ?? profile?.roles
    if (Array.isArray(roles) && roles.length) return roles.join(' · ')
    return profile?.rolesLabel ?? '—'
  }, [profile?.roles, profile?.rolesLabel, profile?.rotationRoles])

  const tasteLeanings = useMemo(() => {
    // TODO: Define taste tendency fields in /api/v1/me/profile response.
    return profile?.taste?.leanings ?? profile?.tasteLeanings ?? '—'
  }, [profile?.taste?.leanings, profile?.tasteLeanings])

  const redsVsWhites = useMemo(() => {
    // TODO: Define taste tendency fields in /api/v1/me/profile response.
    return profile?.taste?.redsVsWhites ?? profile?.redsVsWhites ?? '—'
  }, [profile?.redsVsWhites, profile?.taste?.redsVsWhites])

  const averageRatingLabel = useMemo(() => {
    // TODO: Define taste tendency fields in /api/v1/me/profile response.
    return profile?.taste?.averageRatingLabel ?? profile?.averageRatingLabel ?? '—'
  }, [profile?.averageRatingLabel, profile?.taste?.averageRatingLabel])

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
            <span>{householdName}</span>
          </li>
          <li>
            <span>Members</span>
            <span>{membersLabel}</span>
          </li>
          <li>
            <span>Rotation Roles</span>
            <span>{rolesLabel}</span>
          </li>
        </ul>
      </section>

      <section className="panel" aria-label="Taste tendencies">
        <h2>Taste Tendencies</h2>
        <p>Derived from ratings, no manual setup.</p>
        <ul className="wine-list">
          <li>
            <span>Leanings</span>
            <span>{tasteLeanings}</span>
          </li>
          <li>
            <span>Reds vs Whites</span>
            <span>{redsVsWhites}</span>
          </li>
          <li>
            <span>Average Rating</span>
            <span>{averageRatingLabel}</span>
          </li>
        </ul>

        {/* TODO: Add additional profile-derived stats when backend provides them. */}
      </section>
    </>
  )
}
