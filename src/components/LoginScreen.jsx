import wineClubLogo from '../assets/wine-club-logo-full-nobg.png'

export default function LoginScreen({ onGoogleSignIn }) {
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
