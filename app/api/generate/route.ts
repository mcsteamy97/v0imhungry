// Tab 1 — Discover
fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ type: 'discover', mood: 'Romantic & Intimate', customText: 'cozy Sunday' })
})

// Tab 2 — Surprise Me
fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ type: 'surprise' })
})

// Tab 3 — World Recipes
fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ type: 'world', cuisine: 'Japanese' })
})
