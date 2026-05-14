import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, increment, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const PLAYED_PREFIX = 'pokequiz_played_'

export function useVotes(today, pseudo) {
  const [votes, setVotes] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [hasPlayed, setHasPlayed] = useState(
    () => !!localStorage.getItem(PLAYED_PREFIX + today)
  )

  // Listen to live vote updates for today
  useEffect(() => {
    if (!today) return
    const ref = doc(db, 'votes', today)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setVotes(data.zones ?? {})
        setTotalPlayers(data.total ?? 0)
      } else {
        setVotes({})
        setTotalPlayers(0)
      }
    })
    return unsub
  }, [today])

  async function submitVote(chosenIds) {
    if (hasPlayed || !pseudo) return

    const ref = doc(db, 'votes', today)
    const updates = { total: increment(1) }
    chosenIds.forEach((id) => {
      updates[`zones.${id}`] = increment(1)
    })
    await setDoc(ref, updates, { merge: true })

    // Track in player history
    const playerRef = doc(db, 'players', pseudo)
    const playerSnap = await getDoc(playerRef)
    const playerData = playerSnap.exists() ? playerSnap.data() : { streak: 0, lastPlayed: null, history: [] }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().slice(0, 10)
    const newStreak = playerData.lastPlayed === yesterdayKey ? playerData.streak + 1 : 1

    await setDoc(playerRef, {
      streak: newStreak,
      lastPlayed: today,
      history: [...(playerData.history ?? []), { date: today, chosen: chosenIds }],
    })

    localStorage.setItem(PLAYED_PREFIX + today, '1')
    setHasPlayed(true)
  }

  return { votes, totalPlayers, hasPlayed, submitVote }
}
