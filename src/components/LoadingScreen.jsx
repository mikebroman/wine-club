import wineClubLogo from '../assets/wine-club-logo-full-nobg.png'

export default function LoadingScreen({ isExiting }) {
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
