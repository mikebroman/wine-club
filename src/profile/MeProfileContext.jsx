import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { postSwitchClub, getMyProfile } from '../api/wineClubApi'
import { useAuth } from '../auth/AuthContext'

const MeProfileContext = createContext(null)

export function MeProfileProvider({ children }) {
    const { token, setToken, setUser } = useAuth()
    const [profile, setProfile] = useState(null)
    const [status, setStatus] = useState('idle') // idle | loading | loaded | error
    const [clubScopeKey, setClubScopeKey] = useState(0)

    const refresh = useCallback(async () => {
        if (!token) {
            setProfile(null)
            setStatus('idle')
            return null
        }

        setStatus('loading')

        try {
            const payload = await getMyProfile()
            const next = payload && typeof payload === 'object' ? payload : null
            setProfile(next)
            setStatus('loaded')
            return next
        } catch (error) {
            setProfile(null)
            setStatus('error')
            throw error
        }
    }, [token])

    useEffect(() => {
        let cancelled = false

        if (!token) {
            setProfile(null)
            setStatus('idle')
            return () => {
                cancelled = true
            }
        }

        setStatus('loading')

        getMyProfile()
            .then((payload) => {
                if (cancelled) return
                const next = payload && typeof payload === 'object' ? payload : null
                setProfile(next)
                setStatus('loaded')
            })
            .catch(() => {
                if (cancelled) return
                setProfile(null)
                setStatus('error')
            })

        return () => {
            cancelled = true
        }
    }, [token])

    const switchClub = useCallback(async (clubId) => {
        if (!token) return null

        const requested = Number(clubId)
        if (!Number.isFinite(requested) || requested <= 0) {
            throw new Error('Invalid club id')
        }

        const exchange = await postSwitchClub({ clubId: requested })
        const accessToken = exchange && typeof exchange === 'object' ? String(exchange.accessToken ?? '').trim() : ''
        const nextUser = exchange && typeof exchange === 'object' ? (exchange.user ?? null) : null

        if (!accessToken) {
            throw new Error('Switch club failed: missing access token')
        }

        setToken(accessToken)
        if (nextUser && typeof nextUser === 'object') {
            setUser(nextUser)
        }

        const nextProfile = await refresh()
        setClubScopeKey((prev) => prev + 1)

        return nextProfile
    }, [refresh, setToken, setUser, token])

    const value = useMemo(() => {
        return {
            profile,
            status,
            clubScopeKey,
            refresh,
            switchClub,
        }
    }, [clubScopeKey, profile, refresh, status, switchClub])

    return <MeProfileContext.Provider value={value}>{children}</MeProfileContext.Provider>
}

export function useMeProfile() {
    const ctx = useContext(MeProfileContext)
    if (!ctx) {
        throw new Error('useMeProfile must be used within MeProfileProvider')
    }
    return ctx
}
