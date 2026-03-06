import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faHouse,
  faWineBottle,
} from '@fortawesome/free-solid-svg-icons'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
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
import { useAuth } from './auth/AuthContext'
import { useMeProfile } from './profile/MeProfileContext'

const tabs = [
  { to: '/home', label: 'Home', icon: faHouse },
  { to: '/cellar', label: 'Bottles', icon: faWineBottle },
  { to: '/events', label: 'Events', icon: faCalendarDays },
]

function App() {
  const navigate = useNavigate()
  const { token, user, isReady: authReady, signInWithGoogle, logout } = useAuth()
  const { status: profileStatus, clubScopeKey } = useMeProfile()
  const [loadingPhase, setLoadingPhase] = useState('enter')
  const [logoutPhase, setLogoutPhase] = useState('idle')
  const meLoading = !authReady || (token && profileStatus === 'loading')

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

  const handleSignedIn = async (credential) => {
    try {
      await signInWithGoogle(credential)
    } catch {
      // apiClient will handle unauthorized; login UI will remain visible.
    }
  }

  const handleLogout = () => {
    if (logoutPhase !== 'idle') {
      return
    }

    logout()
    setLogoutPhase('fading')
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
        setUser(null)
        navigate('/', { replace: true })
        setLogoutPhase('idle')

        // TODO: Call backend logout / token revocation when auth exists.
      }, 3000)

      return () => {
        clearTimeout(finishTimer)
      }
    }
  }, [logoutPhase, navigate])

  if (loadingPhase !== 'done' || meLoading) {
    return <LoadingScreen isExiting={loadingPhase === 'exit'} />
  }

  if (logoutPhase === 'loading') {
    return <LoadingScreen />
  }

  if (!token) {
    return <LoginScreen onSignedIn={handleSignedIn} />
  }

  return (
    <div className={`app-container${logoutPhase === 'fading' ? ' is-logging-out' : ''}`}>
      <TopBar user={user} />

      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeScreen clubScopeKey={clubScopeKey} />} />
          <Route path="/cellar" element={<CellarScreen clubScopeKey={clubScopeKey} />} />
          <Route path="/cellar/:bottleId" element={<BottleDetailsScreen clubScopeKey={clubScopeKey} />} />
          <Route path="/events" element={<EventsScreen clubScopeKey={clubScopeKey} />} />
          <Route path="/events/:eventId" element={<EventDetailsScreen clubScopeKey={clubScopeKey} />} />
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
