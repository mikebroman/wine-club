import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const REMINDER_ID = 'home-reminder-v1'
const REMINDER_REACTIONS_KEY = 'wineClubReminderReactionsDraft'

const suggestedEmojis = ['❤️', '🥂', '🍇', '✨', '🔥', '🙌', '😂', '😮', '👍', '👀']

const mockOtherReactions = {
  'google-mock-user-2': ['❤️', '🥂'],
  'google-mock-user-3': ['🥂', '✨'],
  'google-mock-user-4': ['❤️'],
  'google-mock-user-5': ['🍇'],
}

function readAllReactions() {
  const raw = sessionStorage.getItem(REMINDER_REACTIONS_KEY)
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // ignore
  }

  return {}
}

function writeAllReactions(payload) {
  sessionStorage.setItem(REMINDER_REACTIONS_KEY, JSON.stringify(payload))
}

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

export default function HomeScreen({ user, nextEventRsvpStatus = 'none', onNextEventRsvpSet }) {
  const userId = useMemo(() => user?.id ?? 'anonymous', [user?.id])
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
  const rsvpButtonLabel = rsvpLabelByStatus[nextEventRsvpStatus] ?? 'RSVP'

  useEffect(() => {
    const payload = readAllReactions()
    const stored = payload?.[REMINDER_ID]?.[userId] ?? []
    
    setMyEmojis(Array.isArray(stored) ? uniqueEmojis(stored) : [])
  }, [userId])

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

  const persistMyEmojis = (nextList) => {
    const payload = readAllReactions()
    const reminderMap = payload[REMINDER_ID] ?? {}
    reminderMap[userId] = uniqueEmojis(nextList)
    payload[REMINDER_ID] = reminderMap
    writeAllReactions(payload)
  }

  const toggleReaction = (emoji) => {
    const normalized = normalizeEmoji(emoji)
    if (!normalized) return

    setMyEmojis((previous) => {
      const has = previous.includes(normalized)
      const next = has
        ? previous.filter((item) => item !== normalized)
        : [...previous, normalized]

      const uniqueNext = uniqueEmojis(next)
      persistMyEmojis(uniqueNext)
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
    const otherByUserId = { ...mockOtherReactions }
    delete otherByUserId[userId]
    return buildCounts({ myEmojis, otherByUserId })
  }, [myEmojis, userId])

  return (
    <>
      <header className="hero">
        <p className="kicker">
          <FontAwesomeIcon icon={faEnvelope} className="kicker-icon" />
          Message from the Sommelier
        </p>
        <h1 className="hero-title">Reminder</h1>
        <p className="hero-note">
          What's up this month: a quick note about the picks, tasting notes from last month, or a reminder about the next event.
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
            <span className="event-month">MAR</span>
            <span className="event-day">7</span>
          </div>
          <div className="event-meta">
            <h2>Next tasting</h2>
            <p className="event-when">Thu, Mar 7 · 7:00 PM</p>
            <p className="event-where">Downtown Cellar Room</p>
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
                  onNextEventRsvpSet?.('accepted')
                  setShowRsvpOptions(false)
                }}
                aria-pressed={nextEventRsvpStatus === 'accepted'}
              >
                Accept
              </button>
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  onNextEventRsvpSet?.('tentative')
                  setShowRsvpOptions(false)
                }}
                aria-pressed={nextEventRsvpStatus === 'tentative'}
              >
                Tentative
              </button>
              <button
                type="button"
                className="event-action"
                onClick={() => {
                  onNextEventRsvpSet?.('declined')
                  setShowRsvpOptions(false)
                }}
                aria-pressed={nextEventRsvpStatus === 'declined'}
              >
                Decline
              </button>
            </div>
          </div>
          <Link className="event-action event-action-link event-action-half" to="/events/2026-03-07">
            Details
          </Link>
        </div>
      </section>
    </>
  )
}
