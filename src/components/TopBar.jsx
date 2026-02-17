import { NavLink } from 'react-router-dom'
import wineClubLogo from '../assets/wine-club-logo-wconly-nobg.png'

export default function TopBar({ user }) {
  return (
    <header className="app-topbar" aria-label="Session">
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
          <span className="topbar-title">{user.name}</span>
          <span className="topbar-subtitle">Club Member</span>
        </div>
      </div>

      <NavLink to="/profile" className="topbar-avatar" aria-label="Open profile">
        {String(user.name ?? 'Member')
          .trim()
          .slice(0, 1)
          .toUpperCase()}
      </NavLink>
    </header>
  )
}
