import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faHouse,
  faWineBottle,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons'
import './App.scss'

import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import TopBar from './components/TopBar'
import CellarScreen from './screens/CellarScreen'
import BottleDetailsScreen from './screens/BottleDetailsScreen'
import EventsScreen from './screens/EventsScreen'
import EventDetailsScreen from './screens/EventDetailsScreen'
import HomeScreen from './screens/HomeScreen'
import ProfileScreen from './screens/ProfileScreen'
import { getMe, postGoogleAuth } from './api/wineClubApi'

function setAccessToken(token) {
  if (!token) return
  sessionStorage.setItem('wineClubAccessToken', token)
}

function clearAccessToken() {
  sessionStorage.removeItem('wineClubAccessToken')
  localStorage.removeItem('wineClubAccessToken')
}

const tabs = [
  { to: '/home', label: 'Home', icon: faHouse },
  { to: '/cellar', label: 'Bottles', icon: faWineBottle },
  { to: '/events', label: 'Events', icon: faCalendarDays },
  { to: '/tbd', label: 'TBD', icon: faQuestion },
]

function App() {
  const [loadingPhase, setLoadingPhase] = useState('enter')
  const [logoutPhase, setLogoutPhase] = useState('idle')
  const [user, setUser] = useState(null)
  const [meLoading, setMeLoading] = useState(true)

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

  useEffect(() => {
    let cancelled = false

    getMe()
      .then((payload) => {
        if (cancelled) return
        setUser(payload && typeof payload === 'object' ? payload : null)
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
      })
      .finally(() => {
        if (cancelled) return
        setMeLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSignedIn = async (credential) => {
    const googleCredential = typeof credential === 'string' ? credential.trim() : ''
    if (!googleCredential) {
      return
    }

    setMeLoading(true)

    try {
      const exchange = await postGoogleAuth({ credential: googleCredential })
      const accessToken = exchange && typeof exchange === 'object' ? String(exchange.accessToken ?? '').trim() : ''

      if (!accessToken) {
        clearAccessToken()
        setUser(null)
        return
      }

      setAccessToken(accessToken)
      const payload = await getMe()
      setUser(payload && typeof payload === 'object' ? payload : null)
    } catch {
      clearAccessToken()
      setUser(null)
    } finally {
      setMeLoading(false)
    }
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
        clearAccessToken()
        setUser(null)
        setLogoutPhase('idle')

        // TODO: Call backend logout / token revocation when auth exists.
      }, 3000)

      return () => {
        clearTimeout(finishTimer)
      }
    }
  }, [logoutPhase])

  if (loadingPhase !== 'done' || meLoading) {
    return <LoadingScreen isExiting={loadingPhase === 'exit'} />
  }

  if (logoutPhase === 'loading') {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoginScreen onSignedIn={handleSignedIn} />
  }

  return (
    <div className={`app-container${logoutPhase === 'fading' ? ' is-logging-out' : ''}`}>
      <TopBar user={user} />

      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/cellar" element={<CellarScreen />} />
          <Route path="/cellar/:bottleId" element={<BottleDetailsScreen />} />
          <Route path="/events" element={<EventsScreen />} />
          <Route path="/events/:eventId" element={<EventDetailsScreen />} />
          <Route path="/profile" element={<ProfileScreen onLogout={handleLogout} />} />
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Primary">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}
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
