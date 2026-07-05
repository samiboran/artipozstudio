
import { useState } from 'react'

const STORAGE_KEY = 'fg_favorites'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

let listeners = []
let favState = load()

function setFavs(newFavs) {
  favState = newFavs
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs)) } catch {}
  listeners.forEach(l => l([...newFavs]))
}

export function useFavorites() {
  const [ids, setIds] = useState(favState)

  if (!listeners.includes(setIds)) {
    listeners.push(setIds)
  }

  function toggle(id) {
    if (favState.includes(id)) {
      setFavs(favState.filter(x => x !== id))
    } else {
      setFavs([...favState, id])
    }
  }

  function isFav(id) {
    return ids.includes(id)
  }

  return { ids, toggle, isFav, count: ids.length }
}