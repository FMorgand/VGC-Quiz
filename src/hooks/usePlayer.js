import { useState } from 'react'

const STORAGE_KEY = 'pokequiz_pseudo'

export function usePlayer() {
  const [pseudo, setPseudoState] = useState(() => localStorage.getItem(STORAGE_KEY) || '')

  function setPseudo(name) {
    localStorage.setItem(STORAGE_KEY, name)
    setPseudoState(name)
  }

  function clearPseudo() {
    localStorage.removeItem(STORAGE_KEY)
    setPseudoState('')
  }

  return { pseudo, setPseudo, clearPseudo }
}
