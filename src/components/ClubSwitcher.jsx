import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useMeProfile } from '../profile/MeProfileContext'

export default function ClubSwitcher({ onOpenChange }) {
    const { profile, status, switchClub } = useMeProfile()
    const [switchState, setSwitchState] = useState({ status: 'idle', message: '' })
    const [isOpen, setIsOpen] = useState(false)
    const [isClosing, setIsClosing] = useState(false)
    const rootRef = useRef(null)
    const closeTimerRef = useRef(null)

    const openMenu = useCallback(() => {
        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current)
            closeTimerRef.current = null
        }

        setIsClosing(false)
        setIsOpen(true)
        if (typeof onOpenChange === 'function') onOpenChange(true)
    }, [onOpenChange])

    const closeMenu = useCallback(() => {
        if (!isOpen || isClosing) return

        setIsClosing(true)

        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current)
        }

        closeTimerRef.current = window.setTimeout(() => {
            closeTimerRef.current = null
            setIsClosing(false)
            setIsOpen(false)
            if (typeof onOpenChange === 'function') onOpenChange(false)
        }, 140)
    }, [isClosing, isOpen, onOpenChange])

    const toggleMenu = useCallback(() => {
        if (isOpen) closeMenu()
        else openMenu()
    }, [closeMenu, isOpen, openMenu])

    const clubs = useMemo(() => {
        const list = profile?.clubs
        if (!Array.isArray(list)) return []
        return list
            .map((club) => ({
                clubId: Number(club?.clubId),
                clubName: String(club?.clubName ?? '').trim(),
            }))
            .filter((club) => Number.isFinite(club.clubId) && club.clubId > 0)
    }, [profile?.clubs])

    const activeClubId = Number(profile?.activeClubId)
    const isLoaded = status === 'loaded'
    const isBusy = switchState.status === 'loading'

    const activeClub = useMemo(() => {
        if (!Number.isFinite(activeClubId)) return null
        return clubs.find((club) => club.clubId === activeClubId) ?? null
    }, [activeClubId, clubs])

    useEffect(() => {
        if (!isOpen) return

        const onPointerDown = (event) => {
            const root = rootRef.current
            if (!root) return
            if (root.contains(event.target)) return
            closeMenu()
        }

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                closeMenu()
            }
        }

        window.addEventListener('pointerdown', onPointerDown)
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('pointerdown', onPointerDown)
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [closeMenu, isOpen])

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) {
                window.clearTimeout(closeTimerRef.current)
                closeTimerRef.current = null
            }
        }
    }, [])

    if (!isLoaded || clubs.length < 2 || !Number.isFinite(activeClubId)) {
        return null
    }

    const activeLabel = activeClub?.clubName ? activeClub.clubName : `Club ${activeClubId}`
    const menuId = 'club-switcher-menu'
    const triggerLabel = isOpen ? activeLabel : ''
    const showMenu = isOpen || isClosing

    return (
        <div className="club-switcher" aria-label="Club switcher" ref={rootRef}>
            <button
                type="button"
                className={isOpen ? 'club-switcher-trigger is-open' : 'club-switcher-trigger is-collapsed'}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={menuId}
                disabled={isBusy}
                title={activeLabel}
                aria-label={isOpen ? 'Select club' : `Active club: ${activeLabel}`}
                onClick={toggleMenu}
            >
                <span className="club-switcher-trigger-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faBuilding} />
                </span>
                {triggerLabel ? (
                    <span className="club-switcher-trigger-text">{triggerLabel}</span>
                ) : null}
                <span className="club-switcher-trigger-caret" aria-hidden="true">
                    <FontAwesomeIcon icon={faChevronDown} />
                </span>
            </button>

            {showMenu ? (
                <div
                    id={menuId}
                    className={isClosing ? 'club-switcher-menu is-closing' : 'club-switcher-menu is-open'}
                    role="listbox"
                    aria-label="Available clubs"
                >
                    {clubs.map((club) => {
                        const isActive = club.clubId === activeClubId
                        const label = club.clubName ? club.clubName : `Club ${club.clubId}`

                        return (
                            <button
                                key={club.clubId}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                className={isActive ? 'club-switcher-option is-active' : 'club-switcher-option'}
                                disabled={isBusy}
                                onClick={async () => {
                                    if (club.clubId === activeClubId) {
                                        closeMenu()
                                        return
                                    }

                                    setSwitchState({ status: 'loading', message: '' })
                                    try {
                                        await switchClub(club.clubId)
                                        setSwitchState({ status: 'idle', message: '' })
                                        closeMenu()
                                    } catch (error) {
                                        setSwitchState({ status: 'error', message: error?.message || 'Unable to switch clubs.' })
                                    }
                                }}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            ) : null}

            {switchState.status === 'error' ? (
                <span className="club-switcher-error" role="status">{switchState.message}</span>
            ) : null}
        </div>
    )
}
