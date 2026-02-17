import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faHouse,
  faUser,
  faWineBottle,
  faQuestion
} from '@fortawesome/free-solid-svg-icons'
import './App.scss'

import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import TopBar from './components/TopBar'
import CellarScreen from './screens/CellarScreen'
import EventsScreen from './screens/EventsScreen'
import HomeScreen from './screens/HomeScreen'
import ProfileScreen from './screens/ProfileScreen'

const SESSION_USER_KEY = 'wineClubUser'

const tabs = [
  { to: '/home', label: 'Home', icon: faHouse },
  { to: '/cellar', label: 'Bottles', icon: faWineBottle },
  { to: '/events', label: 'Events', icon: faCalendarDays },
  { to: '/tbd', label: 'TBD', icon: faQuestion },
]

function App() {
  const [clickPulseByTab, setClickPulseByTab] = useState({})
  const [loadingPhase, setLoadingPhase] = useState('enter')
  const [logoutPhase, setLogoutPhase] = useState('idle')
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
      name: 'Mike Broman',
      email: 'mikebroman2@google.com',
      provider: 'google',
    }

    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(mockUser))
    setUser(mockUser)
  }

  const handleLogout = () => {
    setLogoutPhase((previous) => {
      if (previous !== 'idle') {
        return previous
      }

      return 'fading'
    })
  }

  useEffect(() => {
    if (logoutPhase === 'idle') {
      return
    }

    if (logoutPhase === 'fading') {
      const showLoadingTimer = setTimeout(() => {
        setLogoutPhase('loading')
      }, 300)

      return () => {
        clearTimeout(showLoadingTimer)
      }
    }

    if (logoutPhase === 'loading') {
      const finishTimer = setTimeout(() => {
        sessionStorage.removeItem(SESSION_USER_KEY)
        setUser(null)
        setClickPulseByTab({})
        setLogoutPhase('idle')
      }, 3000)

      return () => {
        clearTimeout(finishTimer)
      }
    }
  }, [logoutPhase])

  const handleTabClick = (tabTo) => {
    setClickPulseByTab((previous) => ({
      ...previous,
      [tabTo]: (previous[tabTo] ?? 0) + 1,
    }))
  }

  if (loadingPhase !== 'done') {
    return <LoadingScreen isExiting={loadingPhase === 'exit'} />
  }

  if (logoutPhase === 'loading') {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoginScreen onGoogleSignIn={handleGoogleSignIn} />
  }

  return (
    <div className={`app-container${logoutPhase === 'fading' ? ' is-logging-out' : ''}`}>
      <TopBar user={user} />

      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeScreen user={user} />} />
          <Route path="/cellar" element={<CellarScreen />} />
          <Route path="/events" element={<EventsScreen user={user} />} />
          <Route path="/profile" element={<ProfileScreen onLogout={handleLogout} />} />
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
