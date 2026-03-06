import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAccessToken, getAccessToken, setAccessToken } from '../api/http'
import { getMe, postGoogleAuth } from '../api/wineClubApi'
import { onUnauthorized } from '../api/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const navigate = useNavigate()
    const [token, setTokenState] = useState(() => getAccessToken())
    const [user, setUser] = useState(null)
    const [isReady, setIsReady] = useState(false)

    const setToken = useCallback((nextToken) => {
        const value = typeof nextToken === 'string' ? nextToken.trim() : ''
        if (!value) return
        setAccessToken(value)
        setTokenState(value)
    }, [])

    const logout = useCallback(() => {
        clearAccessToken()
        setTokenState(null)
        setUser(null)
        navigate('/', { replace: true })
    }, [navigate])

    useEffect(() => {
        const dispose = onUnauthorized(() => {
            logout()
        })

        return () => dispose()
    }, [logout])

    useEffect(() => {
        let cancelled = false

        const existing = getAccessToken()
        if (!existing) {
            setIsReady(true)
            return
        }

        setTokenState(existing)

        getMe()
            .then((payload) => {
                if (cancelled) return
                if (payload && typeof payload === 'object') {
                    setUser(payload)
                }
            })
            .catch(() => {
                if (cancelled) return
                // if token is invalid, apiClient will emit unauthorized and we will logout
            })
            .finally(() => {
                if (!cancelled) setIsReady(true)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const signInWithGoogle = useCallback(async (credential) => {
        const googleCredential = typeof credential === 'string' ? credential.trim() : ''
        if (!googleCredential) return null

        const exchange = await postGoogleAuth({ credential: googleCredential })
        const accessToken = exchange && typeof exchange === 'object' ? String(exchange.accessToken ?? '').trim() : ''
        const nextUser = exchange && typeof exchange === 'object' ? (exchange.user ?? null) : null

        if (!accessToken) {
            logout()
            return null
        }

        setToken(accessToken)

        if (nextUser && typeof nextUser === 'object') {
            setUser(nextUser)
            return nextUser
        }

        const me = await getMe()
        if (me && typeof me === 'object') {
            setUser(me)
            return me
        }

        return null
    }, [logout, setToken])

    const value = useMemo(() => {
        return {
            token,
            user,
            isReady,
            setToken,
            setUser,
            signInWithGoogle,
            logout,
        }
    }, [isReady, logout, setToken, signInWithGoogle, token, user])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return ctx
}
