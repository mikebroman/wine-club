import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import wineClubLogo from '../assets/wine-club-logo-wconly-nobg.png'
import ClubSwitcher from './ClubSwitcher'

export default function TopBar({ user }) {
  const [isClubMenuOpen, setIsClubMenuOpen] = useState(false)
  const displayName = String(user?.displayName ?? user?.name ?? 'Member').trim() || 'Member'
  const avatarLetter = displayName.slice(0, 1).toUpperCase()

  return (
    <header className={isClubMenuOpen ? 'app-topbar is-club-menu-open' : 'app-topbar'} aria-label="Session">
      <div className="topbar-brand" aria-label="Wine Club">
        <img
          className="topbar-mark"
          src={wineClubLogo}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
        />
        <div className="topbar-text">
          <span className="topbar-title">{displayName}</span>
          <span className="topbar-subtitle">Club Member</span>
        </div>
      </div>

      <ClubSwitcher onOpenChange={setIsClubMenuOpen} />

      <NavLink to="/profile" className="topbar-avatar" aria-label="Open profile">
        {avatarLetter}
      </NavLink>
    </header>
  )
}
