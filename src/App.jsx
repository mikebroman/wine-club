import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faHouse,
  faRightFromBracket,
  faUser,
  faWineBottle,
} from '@fortawesome/free-solid-svg-icons'
import wineClubLogo from './assets/wine-club-logo-full-nobg.png'
import './App.scss'

const SESSION_USER_KEY = 'wineClubUser'

const tabs = [
  { to: '/home', label: 'Home', icon: faHouse },
  { to: '/cellar', label: 'Bottles', icon: faWineBottle },
  { to: '/events', label: 'Events', icon: faCalendarDays },
  { to: '/profile', label: 'Profile', icon: faUser },
]

function HomeScreen() {
  return (
    <>
      <header className="hero">
        <p className="kicker">MESSAGE FROM THE SOMMILIER</p>
        <h1>Reminder!</h1>
        <div className="">
          What's up this month: a quick note about the picks, tasting notes from last month, or a reminder about the next event.
        </div>
      </header>

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

function EventsScreen() {
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

function ProfileScreen() {
  return (
    <>
      <section className="panel" aria-label="Household profile">
        <h2>Household Profile</h2>
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

function LoginScreen({ onGoogleSignIn }) {
  return (
    <main className="login-shell">
      <div className="login-layout">
        <section className="login-brand" aria-label="Wine Club">
          <img className="brand-logo" src={wineClubLogo} alt="Wine Club" />
        </section>

        <section className="login-panel" aria-label="Login">
          <p className="panel-label">WELCOME</p>
          <h2 className="panel-title">Sign in</h2>
          <button type="button" className="google-btn" onClick={onGoogleSignIn}>
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M21.35 11.1H12v2.9h5.34c-.23 1.3-1.37 3.8-5.34 3.8-3.21 0-5.83-2.65-5.83-5.9S8.79 6 12 6c1.83 0 3.06.78 3.76 1.46l2.56-2.46C16.97 3.05 14.7 2 12 2 6.94 2 2.85 6.1 2.85 11.9S6.94 21.8 12 21.8c6.94 0 8.64-4.9 8.64-7.45 0-.5-.05-.87-.12-1.25z" />
            </svg>
            Continue with Google
          </button>
          <p className="panel-footnote">Invite-only club. Ask your host for access.</p>
        </section>
      </div>
    </main>
  )
}

function LoadingScreen({ isExiting }) {
  return (
    <div
      className={`loading-screen${isExiting ? ' is-exiting' : ''}`}
      role="status"
      aria-live="polite"
    >
      <img
        className="loading-logo"
        src={wineClubLogo}
        alt="Wine Club"
        loading="eager"
        decoding="async"
      />
    </div>
  )
}

function App() {
  const [clickPulseByTab, setClickPulseByTab] = useState({})
  const [loadingPhase, setLoadingPhase] = useState('enter')
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

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setLoadingPhase('exit')
    }, 5000)
    const doneTimer = setTimeout(() => {
      setLoadingPhase('done')
    }, 5600)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [])

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

  if (loadingPhase !== 'done') {
    return <LoadingScreen isExiting={loadingPhase === 'exit'} />
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
