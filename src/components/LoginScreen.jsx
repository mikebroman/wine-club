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
  if (typeof window?.acquireVsCodeApi === 'function') return true
  const protocol = String(window?.location?.protocol ?? '')
  if (protocol.startsWith('vscode')) return true
  if (ua.includes('VSCode')) return true
  if (ua.includes('Electron')) return true
  if (window?.chrome?.webview) return true
  return false
}

function loadGoogleIdentityScript({ timeoutMs = 45000 } = {}) {
  if (getGoogleAccounts()) return Promise.resolve(true)

  if (gsiScriptPromise) return gsiScriptPromise

  const fail = (error) => {
    // Important: do not cache a rejected promise forever.
    gsiScriptPromise = null
    throw error
  }

  gsiScriptPromise = new Promise((resolve, reject) => {
    const message =
      'Failed to load Google sign-in. This is often caused by ad/tracker blockers, corporate network filtering, or embedded browsers. Try opening in a regular browser tab.'

    if (getGoogleAccounts()) {
      resolve(true)
      return
    }

    const existing = document.querySelector('script[data-gsi-client="true"]')
    if (existing?.dataset?.gsiLoadState === 'error') {
      existing.remove()
    }

    const script =
      existing && existing.isConnected
        ? existing
        : document.createElement('script')

    let timeoutId = null
    const cleanup = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const onLoad = () => {
      cleanup()
      script.dataset.gsiLoadState = 'loaded'
      resolve(true)
    }

    const onError = () => {
      cleanup()
      script.dataset.gsiLoadState = 'error'
      reject(new Error(message))
    }

    const onTimeout = () => {
      cleanup()
      script.dataset.gsiLoadState = 'timeout'
      reject(new Error(message))
    }

    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })

    timeoutId = window.setTimeout(() => {
      // If the script never loads nor errors (common with devtools throttling),
      // surface a message but keep the script element so it can still load later.
      onTimeout()
    }, timeoutMs)

    if (!existing || !existing.isConnected) {
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.dataset.gsiClient = 'true'
      document.head.appendChild(script)
    }
  }).catch(fail)

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

    let cancelled = false

    // Reset UI state asynchronously to avoid triggering cascading renders
    // directly from within the effect body.
    queueMicrotask(() => {
      if (cancelled) return
      setGoogleReady(false)
      setGoogleError('')
    })
    googleErrorRef.current = ''

    if (isEmbeddedWebView()) {
      const message =
        'Google sign-in is not supported in embedded previews. Open this app in a regular browser tab.'
      googleErrorRef.current = message
      queueMicrotask(() => {
        if (cancelled) return
        setGoogleError(message)
      })
      return () => {
        cancelled = true
      }
    }

    let rafId = null
    let timeoutTickId = null

    loadGoogleIdentityScript().catch((error) => {
      if (cancelled) return
      const message = error?.message || 'Google sign-in failed to load.'
      setGoogleError(message)
      googleErrorRef.current = message
    })

    const scheduleNextTick = () => {
      if (cancelled) return

      if (googleErrorRef.current) {
        timeoutTickId = window.setTimeout(tick, 1000)
        return
      }

      rafId = window.requestAnimationFrame(tick)
    }

    const tick = () => {
      if (cancelled) return

      const accounts = getGoogleAccounts()
      if (!accounts || !googleButtonRef.current) {
        scheduleNextTick()
        return
      }

      const availableWidth = Math.floor(
        googleButtonRef.current.getBoundingClientRect()?.width ?? 0,
      )
      if (!availableWidth) {
        scheduleNextTick()
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

        if (googleErrorRef.current) {
          googleErrorRef.current = ''
          setGoogleError('')
        }
        setGoogleReady(true)
      } catch {
        // Ignore: will retry next animation frame.
        scheduleNextTick()
      }
    }

    tick()

    return () => {
      cancelled = true
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      if (timeoutTickId) {
        window.clearTimeout(timeoutTickId)
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
