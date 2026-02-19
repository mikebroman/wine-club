import wineClubLogo from '../assets/wine-club-logo-full-nobg.png'
import { useEffect, useRef, useState } from 'react'

let gsiInitializedClientId = null
let gsiScriptPromise = null

function getGoogleClientId() {
  const raw = import.meta.env?.VITE_GOOGLE_CLIENT_ID
  if (!raw) return null
  return String(raw).trim() || null
}

function getGoogleAccounts() {
  return window?.google?.accounts?.id ?? null
}

function isEmbeddedWebView() {
  const ua = String(window?.navigator?.userAgent ?? '')
  if (ua.includes('VSCode')) return true
  if (ua.includes('Electron')) return true
  if (window?.chrome?.webview) return true
  return false
}

function loadGoogleIdentityScript() {
  if (gsiScriptPromise) return gsiScriptPromise

  gsiScriptPromise = new Promise((resolve, reject) => {
    if (getGoogleAccounts()) {
      resolve(true)
      return
    }

    const existing = document.querySelector('script[data-gsi-client="true"]')
    if (existing) {
      if (getGoogleAccounts()) {
        resolve(true)
        return
      }

      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google sign-in')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.gsiClient = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Google sign-in'))
    document.head.appendChild(script)
  })

  return gsiScriptPromise
}

export default function LoginScreen({ onSignedIn }) {
  useEffect(() => {
    document.title = 'Sign in | Wine Club'
  }, [])

  const clientId = getGoogleClientId()
  const googleButtonRef = useRef(null)
  const onSignedInRef = useRef(onSignedIn)
  const [googleReady, setGoogleReady] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const googleErrorRef = useRef('')

  useEffect(() => {
    onSignedInRef.current = onSignedIn
  }, [onSignedIn])

  useEffect(() => {
    if (!clientId) return

    setGoogleReady(false)
    setGoogleError('')
    googleErrorRef.current = ''

    if (isEmbeddedWebView()) {
      const message =
        'Google sign-in is not supported in embedded previews. Open this app in a regular browser tab.'
      setGoogleError(message)
      googleErrorRef.current = message
      return
    }

    let cancelled = false
    let rafId = null

    loadGoogleIdentityScript().catch((error) => {
      if (cancelled) return
      const message = error?.message || 'Google sign-in failed to load.'
      setGoogleError(message)
      googleErrorRef.current = message
    })

    const tick = () => {
      if (cancelled) return

      if (googleErrorRef.current) return

      const accounts = getGoogleAccounts()
      if (!accounts || !googleButtonRef.current) {
        rafId = window.requestAnimationFrame(tick)
        return
      }

      const availableWidth = Math.floor(
        googleButtonRef.current.getBoundingClientRect()?.width ?? 0,
      )
      if (!availableWidth) {
        rafId = window.requestAnimationFrame(tick)
        return
      }

      try {
        if (gsiInitializedClientId !== clientId) {
          accounts.initialize({
            client_id: clientId,
            callback: (response) => {
              const credential = response?.credential
              if (!credential) return
              const handler = onSignedInRef.current
              if (typeof handler === 'function') {
                handler(credential)
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          })
          gsiInitializedClientId = clientId
        }

        googleButtonRef.current.innerHTML = ''
        accounts.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: Math.min(320, availableWidth),
        })
        setGoogleReady(true)
      } catch {
        // Ignore: will retry next animation frame.
        rafId = window.requestAnimationFrame(tick)
      }
    }

    tick()

    return () => {
      cancelled = true
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [clientId])

  return (
    <main className="login-shell">
      <div className="login-layout">
        <section className="login-brand" aria-label="Wine Club">
          <img className="brand-logo" src={wineClubLogo} alt="Wine Club" />
        </section>

        <section className="login-panel" aria-label="Login">
          <p className="panel-label">WELCOME</p>
          <h2 className="panel-title">Sign in</h2>
          {clientId ? (
            <div>
              <div className="google-signin">
                <div ref={googleButtonRef} className="google-signin-target" />
              </div>
              {googleError ? (
                <p className="panel-footnote">{googleError}</p>
              ) : !googleReady ? (
                <p className="panel-footnote">Loading Google sign-in…</p>
              ) : null}
            </div>
          ) : (
            <p className="panel-footnote">
              TODO: Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
            </p>
          )}
          <p className="panel-footnote">Invite-only club. Ask your host for access.</p>
        </section>
      </div>
    </main>
  )
}
