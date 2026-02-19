export const bottleCatalog = [
  {
    id: 'ridge-three-valleys-2022',
    producer: 'Ridge Vineyards',
    name: 'Three Valleys',
    vintage: '2022',
    type: 'Reds',
    region: 'Sonoma County',
    eventId: '2026-03-07',
    eventDate: 'Mar 7',
    eventTitle: 'Downtown Cellar Room',
    host: 'Mike & Kaitlin',
    broughtBy: 'Johnsons',
    image:
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1200&q=80',
    ratings: { love: 4, like: 2, meh: 0 },
    tags: ['red', 'sonoma', 'blend', 'banger'],
  },
  {
    id: 'tempier-bandol-2020',
    producer: 'Domaine Tempier',
    name: 'Bandol Rouge',
    vintage: '2020',
    type: 'Reds',
    region: 'Bandol',
    eventId: '2026-02-03',
    eventDate: 'Feb 3',
    eventTitle: 'Patel Home Tasting',
    host: 'Patel',
    broughtBy: 'Lee',
    image:
      'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=1200&q=80',
    ratings: { love: 5, like: 1, meh: 0 },
    tags: ['red', 'france', 'mourvedre', 'banger'],
  },
  {
    id: 'sancerre-blanc-2023',
    producer: 'Henri Bourgeois',
    name: 'Sancerre Les Baronnes',
    vintage: '2023',
    type: 'Whites',
    region: 'Loire Valley',
    eventId: '2026-01-12',
    eventDate: 'Jan 12',
    eventTitle: 'Gomez Home Tasting',
    host: 'Gomez',
    broughtBy: 'Patel',
    image:
      'https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1200&q=80',
    ratings: { love: 3, like: 3, meh: 1 },
    tags: ['white', 'france', 'sauvignon blanc'],
  },
  {
    id: 'franciacorta-brut-nv',
    producer: 'Ca del Bosco',
    name: 'Cuvée Prestige Brut',
    vintage: 'NV',
    type: 'Sparkling',
    region: 'Franciacorta',
    eventId: '2025-12-07',
    eventDate: 'Dec 7',
    eventTitle: 'Johnsons Holiday Night',
    host: 'Johnsons',
    broughtBy: 'Mike & Kaitlin',
    image:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    ratings: { love: 4, like: 2, meh: 0 },
    tags: ['sparkling', 'italy', 'celebration'],
  },
  {
    id: 'dautel-riesling-auslese-2021',
    producer: 'Weingut Dautel',
    name: 'Riesling Auslese',
    vintage: '2021',
    type: 'Dessert',
    region: 'Württemberg',
    eventId: '2026-02-03',
    eventDate: 'Feb 3',
    eventTitle: 'Patel Home Tasting',
    host: 'Patel',
    broughtBy: 'Gomez',
    image:
      'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?auto=format&fit=crop&w=1200&q=80',
    ratings: { love: 2, like: 2, meh: 1 },
    tags: ['dessert', 'germany', 'riesling'],
  },
  {
    id: 'txakoli-getariako-2023',
    producer: 'Ameztoi',
    name: 'Getariako Txakolina',
    vintage: '2023',
    type: 'Whites',
    region: 'Basque Country',
    eventId: '2026-03-07',
    eventDate: 'Mar 7',
    eventTitle: 'Downtown Cellar Room',
    host: 'Mike & Kaitlin',
    broughtBy: 'Ryan & Kayla',
    image: null,
    ratings: { love: 1, like: 3, meh: 2 },
    tags: ['white', 'spain', 'fresh'],
  },
  {
    id: 'barolo-nebbiolo-2019',
    producer: 'Vietti',
    name: 'Castiglione Barolo',
    vintage: '2019',
    type: 'Reds',
    region: 'Piedmont',
    eventId: '2025-12-07',
    eventDate: 'Dec 7',
    eventTitle: 'Johnsons Holiday Night',
    host: 'Johnsons',
    broughtBy: 'Lee & Morganne',
    image:
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=1200&q=80',
    ratings: { love: 6, like: 1, meh: 0 },
    tags: ['red', 'italy', 'nebbiolo', 'banger'],
  },
  {
    id: 'chenin-blanc-loire-2022',
    producer: 'Domaine Huet',
    name: 'Le Haut-Lieu Sec',
    vintage: '2022',
    type: 'Whites',
    region: 'Vouvray',
    eventId: '2026-01-12',
    eventDate: 'Jan 12',
    eventTitle: 'Gomez Home Tasting',
    host: 'Gomez',
    broughtBy: 'Patel',
    image: null,
    ratings: { love: 4, like: 2, meh: 0 },
    tags: ['white', 'france', 'chenin blanc', 'banger'],
  },
]

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

export function topRatedBottles(limit = 5) {
  return [...bottleCatalog]
    .sort((a, b) => {
      const byAverage = averageRating(b) - averageRating(a)
      if (byAverage !== 0) return byAverage

      const byLoves = lovesCount(b) - lovesCount(a)
      if (byLoves !== 0) return byLoves

      return votesCount(b) - votesCount(a)
    })
    .slice(0, limit)
}

export function recentBottles() {
  return [...bottleCatalog].sort((a, b) => {
    return Number(b.eventId.replaceAll('-', '')) - Number(a.eventId.replaceAll('-', ''))
  })
}
