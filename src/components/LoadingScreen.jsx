import wineClubLogo from '../assets/wine-club-logo-full-nobg.png'
import { useEffect } from 'react'

export default function LoadingScreen({ isExiting }) {
  useEffect(() => {
    document.title = 'Loading… | Wine Club'
  }, [])

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
