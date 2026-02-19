function totalVotes(ratings) {
  return (ratings?.love ?? 0) + (ratings?.like ?? 0) + (ratings?.meh ?? 0)
}

export function averageRating(bottle) {
  const votes = totalVotes(bottle.ratings)
  if (!votes) return 0

  const weightedTotal = (bottle.ratings.love * 5) + (bottle.ratings.like * 4) + (bottle.ratings.meh * 2)
  return Number((weightedTotal / votes).toFixed(1))
}

export function lovesCount(bottle) {
  return bottle.ratings?.love ?? 0
}

export function votesCount(bottle) {
  return totalVotes(bottle.ratings)
}

export function ratingSummary(bottle) {
  const votes = votesCount(bottle)
  return `${votes} votes • ${averageRating(bottle).toFixed(1)}`
}
