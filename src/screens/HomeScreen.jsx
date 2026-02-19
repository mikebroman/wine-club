import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentAnnouncements, getNextEvent, putMyAnnouncementReaction, putMyRsvp } from '../api/wineClubApi'

const suggestedEmojis = ['❤️', '🥂', '🍇', '✨', '🔥', '🙌', '😂', '😮', '👍', '👀']

function normalizeEmoji(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return null
  if (trimmed.length > 12) return null
  return trimmed
}

function uniqueEmojis(list) {
  const unique = []
  const seen = new Set()
  for (const item of list) {
    const emoji = normalizeEmoji(item)
    if (!emoji) continue
    if (seen.has(emoji)) continue
    seen.add(emoji)
    unique.push(emoji)
  }
  return unique
}

function buildCounts({ myEmojis, otherByUserId }) {
  const counts = new Map()
  const mine = new Set(myEmojis)

  for (const emoji of myEmojis) {
    counts.set(emoji, (counts.get(emoji) ?? 0) + 1)
  }

  for (const list of Object.values(otherByUserId ?? {})) {
    for (const emoji of uniqueEmojis(list)) {
      counts.set(emoji, (counts.get(emoji) ?? 0) + 1)
    }
  }

  const reactions = Array.from(counts.entries())
    .map(([emoji, count]) => ({ emoji, count, isMine: mine.has(emoji) }))
    .sort((a, b) => (b.count - a.count) || a.emoji.localeCompare(b.emoji))

  return reactions
}

export default function HomeScreen() {
  const [announcement, setAnnouncement] = useState(null)
  const [nextEvent, setNextEvent] = useState(null)
  const [myEmojis, setMyEmojis] = useState([])
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerValue, setPickerValue] = useState('')
  const [showRsvpOptions, setShowRsvpOptions] = useState(false)
  const pickerInputRef = useRef(null)
  const rsvpLabelByStatus = {
    none: 'RSVP',
    accepted: 'Going',
    tentative: 'Maybe',
    declined: 'Declined',
  }
  const [rsvpStatus, setRsvpStatus] = useState('none')
  const rsvpButtonLabel = rsvpLabelByStatus[rsvpStatus] ?? 'RSVP'

  useEffect(() => {
    document.title = 'Home | Wine Club'
  }, [])

  useEffect(() => {
    let cancelled = false

    getCurrentAnnouncements()
      .then((payload) => {
        if (cancelled) return
        if (!payload) return

        // TODO: Confirm announcements payload shape from backend (list vs wrapper).
        const item = Array.isArray(payload) ? payload[0] : (payload.announcement ?? payload)
        if (item && typeof item === 'object') {
          setAnnouncement(item)
        }
      })
      .catch(() => {
        setAnnouncement(null)
      })

    getNextEvent()
      .then((payload) => {
        if (cancelled) return
        const item = payload?.event ?? payload
        if (item && typeof item === 'object') {
          setNextEvent(item)

          // TODO: Map backend's "my RSVP" field into UI state.
          const status = item.myRsvpStatus ?? item.myRsvp ?? item.rsvpStatus
          if (typeof status === 'string') {
            setRsvpStatus(status)
          }
        }
      })
      .catch(() => {
        setNextEvent(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const announcementId = useMemo(() => {
    const id = announcement?.id ?? announcement?.announcementId
    return id ? String(id) : null
  }, [announcement?.announcementId, announcement?.id])

  useEffect(() => {
    if (!isPickerOpen) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPickerOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPickerOpen])

  useEffect(() => {
    if (isPickerOpen) {
      requestAnimationFrame(() => pickerInputRef.current?.focus())
    }
  }, [isPickerOpen])

  const toggleReaction = (emoji) => {
    const normalized = normalizeEmoji(emoji)
    if (!normalized) return

    setMyEmojis((previous) => {
      const has = previous.includes(normalized)
      const next = has
        ? previous.filter((item) => item !== normalized)
        : [...previous, normalized]

      const uniqueNext = uniqueEmojis(next)

      if (announcementId) {
        putMyAnnouncementReaction(announcementId, normalized).catch(() => {
          // TODO: Handle auth failures once auth exists.
        })
      }

      return uniqueNext
    })
  }

  const addFromPicker = () => {
    const emoji = normalizeEmoji(pickerValue)
    if (!emoji) return
    toggleReaction(emoji)
    setPickerValue('')
    setIsPickerOpen(false)
  }

  const reactions = useMemo(() => {
    // TODO: Prefer backend-provided reaction counts once available.
    // If backend includes something like `announcement.reactions`, we will use it.
    const apiReactions = announcement?.reactions
    if (Array.isArray(apiReactions)) {
      return apiReactions
        .map((entry) => ({
          emoji: normalizeEmoji(entry?.emoji),
          count: Number(entry?.count ?? 0),
          isMine: Boolean(entry?.isMine),
        }))
        .filter((r) => r.emoji && r.count > 0)
    }

    return buildCounts({ myEmojis, otherByUserId: {} })
  }, [announcement?.reactions, myEmojis])

  const chipParts = useMemo(() => {
    // TODO: Standardize event date shape (string vs ISO) once backend contract is known.
    const raw = nextEvent?.date ?? nextEvent?.startsAt ?? nextEvent?.when
    if (!raw) return { month: '—', day: '—' }

    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return { month: '—', day: '—' }
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: String(date.getDate()),
    }
  }, [nextEvent?.date, nextEvent?.startsAt, nextEvent?.when])

  return (
    <>
      <header className="hero">
        <p className="kicker">
          <FontAwesomeIcon icon={faEnvelope} className="kicker-icon" />
          Message from the Sommelier
        </p>
        <h1 className="hero-title">{announcement?.title ?? announcement?.subject ?? 'Loading…'}</h1>
        <p className="hero-note">
          {announcement?.body ?? announcement?.message ?? ''}
        </p>

        <div className="reactions-row" aria-label="Reactions">
          <div className="reactions-list" aria-label="Reaction list">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                className={`reaction-pill${reaction.isMine ? ' is-selected' : ''}`}
                onClick={() => toggleReaction(reaction.emoji)}
                aria-pressed={reaction.isMine}
                aria-label={`Reaction ${reaction.emoji}, ${reaction.count}`}
                title={reaction.isMine ? 'Remove your reaction' : 'Add your reaction'}
              >
                <span className="reaction-pill-emoji" aria-hidden="true">
                  {reaction.emoji}
                </span>
                <span className="reaction-pill-count" aria-hidden="true">
                  {reaction.count}
                </span>
              </button>
            ))}

            <div className="reaction-add">
              <button
                type="button"
                className="reaction-add-btn"
                onClick={() => setIsPickerOpen((previous) => !previous)}
                aria-expanded={isPickerOpen}
                aria-label="Add reaction"
                title="Add reaction"
              >
                +
              </button>

              {isPickerOpen ? (
                <div className="reaction-popover" role="dialog" aria-label="Add reaction">
                  <div className="reaction-suggestions" aria-label="Suggested emojis">
                    {suggestedEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="reaction-suggestion"
                        onClick={() => toggleReaction(emoji)}
                        aria-label={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <form
                    className="reaction-form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      addFromPicker()
                    }}
                  >
                    <input
                      ref={pickerInputRef}
                      className="reaction-input"
                      value={pickerValue}
                      onChange={(event) => setPickerValue(event.target.value)}
                      placeholder="Paste an emoji"
                      inputMode="text"
                      aria-label="Emoji"
                    />
                    <button type="submit" className="reaction-submit">
                      Add
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <section className="panel event-card" aria-label="Next event">
        <div className="event-head">
          <div className="event-chip" aria-hidden="true">
            <span className="event-month">{chipParts.month}</span>
            <span className="event-day">{chipParts.day}</span>
          </div>
          <div className="event-meta">
            <h2>Next tasting</h2>
            <p className="event-when">{nextEvent?.dateLine ?? nextEvent?.when ?? 'Loading…'}</p>
            <p className="event-where">{nextEvent?.location ?? nextEvent?.address ?? ''}</p>
          </div>
        </div>
        <div className="event-actions" aria-label="Event actions">
          <div className={`event-rsvp-pop event-action-half${showRsvpOptions ? ' is-open' : ''}`}>
            <button
              type="button"
              className="event-action"
              onClick={() => setShowRsvpOptions((previous) => !previous)}
              aria-expanded={showRsvpOptions}
              aria-label={`RSVP status: ${rsvpButtonLabel}`}
            >
              {rsvpButtonLabel}
            </button>
            <div className="event-rsvp-pop-menu" role="group" aria-label="Choose RSVP response">
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  setRsvpStatus('accepted')
                  if (nextEvent?.id) {
                    putMyRsvp(String(nextEvent.id), { status: 'accepted' }).catch(() => {
                      // TODO: Handle auth failures once auth exists.
                    })
                  }
                  setShowRsvpOptions(false)
                }}
                aria-pressed={rsvpStatus === 'accepted'}
              >
                Accept
              </button>
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  setRsvpStatus('tentative')
                  if (nextEvent?.id) {
                    putMyRsvp(String(nextEvent.id), { status: 'tentative' }).catch(() => {
                      // TODO: Handle auth failures once auth exists.
                    })
                  }
                  setShowRsvpOptions(false)
                }}
                aria-pressed={rsvpStatus === 'tentative'}
              >
                Tentative
              </button>
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  setRsvpStatus('declined')
                  if (nextEvent?.id) {
                    putMyRsvp(String(nextEvent.id), { status: 'declined' }).catch(() => {
                      // TODO: Handle auth failures once auth exists.
                    })
                  }
                  setShowRsvpOptions(false)
                }}
                aria-pressed={rsvpStatus === 'declined'}
              >
                Decline
              </button>
            </div>
          </div>
          <Link
            className="event-action event-action-link event-action-half"
            to={nextEvent?.id ? `/events/${String(nextEvent.id)}` : '/events'}
          >
            Details
          </Link>
        </div>
      </section>
    </>
  )
}
