import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faHouse,
  faRightFromBracket,
  faUser,
  faWineBottle,
} from '@fortawesome/free-solid-svg-icons'
import './App.scss'

const SESSION_USER_KEY = 'wineClubUser'

const tabs = [
  { to: '/home', label: 'Home', icon: faHouse },
  { to: '/cellar', label: 'Cellar', icon: faWineBottle },
  { to: '/events', label: 'Events', icon: faCalendarDays },
  { to: '/profile', label: 'Profile', icon: faUser },
]

function HomeScreen() {
  return (
    <>
      <header className="hero">
        <p className="kicker">Mobile-First App</p>
        <h1>Wine Club</h1>
        <p className="subtitle">
          Discover bottles, track your monthly picks, and keep your tasting notes in one place.
        </p>
        <button type="button" className="primary-btn">
          Join the Club
        </button>
      </header>

      <section className="panel" aria-label="Monthly picks">
        <h2>February Picks</h2>
        <ul className="wine-list">
          <li>
            <span>Sonoma Chardonnay</span>
            <span>White</span>
          </li>
          <li>
            <span>Rioja Reserva</span>
            <span>Red</span>
          </li>
          <li>
            <span>Provence Rosé</span>
            <span>Rosé</span>
          </li>
        </ul>
      </section>

      <section className="panel" aria-label="Next event">
        <h2>Next Tasting</h2>
        <p>Thursday, March 7 · 7:00 PM</p>
        <p>Downtown Cellar Room</p>
      </section>
    </>
  )
}

function CellarScreen() {
  return (
    <section className="panel" aria-label="Cellar">
      <h2>Your Cellar</h2>
      <p>12 bottles tracked</p>
      <p>2 ready to drink now</p>
    </section>
  )
}

function EventsScreen() {
  return (
    <section className="panel" aria-label="Events">
      <h2>Upcoming Events</h2>
      <p>Mar 7 · Downtown Cellar Room</p>
      <p>Apr 4 · Rooftop Tasting Session</p>
    </section>
  )
}

function ProfileScreen() {
  return (
    <section className="panel" aria-label="Profile">
      <h2>Your Profile</h2>
      <p>Membership: Gold</p>
      <p>Preferences: Red, White, Sparkling</p>
    </section>
  )
}

function LoginScreen({ onGoogleSignIn }) {
  return (
    <main className="login-shell">
      <section className="login-card" aria-label="Login">
        <p className="kicker">Welcome</p>
        <h1>Wine Club</h1>
        <p className="subtitle">Sign in to continue with your club account.</p>
        <button type="button" className="google-btn" onClick={onGoogleSignIn}>
          Continue with Google
        </button>
      </section>
    </main>
  )
}

function App() {
  const [clickPulseByTab, setClickPulseByTab] = useState({})
  const [user, setUser] = useState(() => {
    const rawUser = sessionStorage.getItem(SESSION_USER_KEY)
    if (!rawUser) {
      return null
    }

    try {
      return JSON.parse(rawUser)
    } catch {
      sessionStorage.removeItem(SESSION_USER_KEY)
      return null
    }
  })

  const handleGoogleSignIn = () => {
    const mockUser = {
      id: 'google-mock-user-1',
      name: 'Wine Club Member',
      email: 'member@wineclub.dev',
      provider: 'google',
    }

    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(mockUser))
    setUser(mockUser)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_USER_KEY)
    setUser(null)
    setClickPulseByTab({})
  }

  const handleTabClick = (tabTo) => {
    setClickPulseByTab((previous) => ({
      ...previous,
      [tabTo]: (previous[tabTo] ?? 0) + 1,
    }))
  }

  if (!user) {
    return <LoginScreen onGoogleSignIn={handleGoogleSignIn} />
  }

  return (
    <div className="app-container">
      <header className="app-topbar" aria-label="Session">
        <span>{user.name}</span>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span>Log out</span>
        </button>
      </header>

      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/cellar" element={<CellarScreen />} />
          <Route path="/events" element={<EventsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Primary">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => {
              const pulse = clickPulseByTab[tab.to] ?? 0
              const sloshClass = pulse > 0 ? ` slosh-${pulse % 2}` : ''
              return `tab-link${isActive ? ' active' : ''}${sloshClass}`
            }}
            onClick={() => handleTabClick(tab.to)}
          >
            <span className="tab-liquid" aria-hidden="true" />
            <FontAwesomeIcon icon={tab.icon} className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default App
