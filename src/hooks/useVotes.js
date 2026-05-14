import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, increment, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const PLAYED_PREFIX = 'pokequiz_played_'
const CHOSEN_PREFIX = 'pokequiz_chosen_'

export function useVotes(today, pseudo) {
  const [votes, setVotes] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [hasPlayed, setHasPlayed] = useState(
    () => !!localStorage.getItem(PLAYED_PREFIX + today)
  )
  const [savedChosenIds, setSavedChosenIds] = useState(() => {
    const raw = localStorage.getItem(CHOSEN_PREFIX + today)
    return raw ? JSON.parse(raw) : null
  })

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

    // Calculate alignment score against current votes + own vote
    const projectedVotes = {}
    if (votes) {
      Object.entries(votes).forEach(([id, count]) => {
        projectedVotes[Number(id)] = count
      })
    }
    chosenIds.forEach((id) => {
      projectedVotes[id] = (projectedVotes[id] ?? 0) + 1
    })
    const top4 = Object.entries(projectedVotes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => Number(id))
    const alignmentScore = chosenIds.filter((id) => top4.includes(id)).length

    const ref = doc(db, 'votes', today)
    const updates = { total: increment(1) }
    chosenIds.forEach((id) => {
      updates[`zones.${id}`] = increment(1)
    })
    await setDoc(ref, updates, { merge: true })

    const playerRef = doc(db, 'players', pseudo)
    const playerSnap = await getDoc(playerRef)
    const playerData = playerSnap.exists()
      ? playerSnap.data()
      : { streak: 0, lastPlayed: null, history: [] }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().slice(0, 10)
    const newStreak = playerData.lastPlayed === yesterdayKey ? playerData.streak + 1 : 1

    await setDoc(playerRef, {
      streak: newStreak,
      lastPlayed: today,
      history: [
        ...(playerData.history ?? []),
        { date: today, chosen: chosenIds, alignment: alignmentScore },
      ],
    })

    localStorage.setItem(PLAYED_PREFIX + today, '1')
    localStorage.setItem(CHOSEN_PREFIX + today, JSON.stringify(chosenIds))
    setSavedChosenIds(chosenIds)
    setHasPlayed(true)
  }

  return { votes, totalPlayers, hasPlayed, savedChosenIds, submitVote }
}
