import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const PLAYED_PREFIX = 'pokequiz_played_'
const CHOSEN_PREFIX = 'pokequiz_chosen_'

export function useVotes(today, pseudo) {
  const [votes, setVotes] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [firebaseError, setFirebaseError] = useState(null)
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
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setFirebaseError(null)
        if (snap.exists()) {
          const data = snap.data()
          setVotes(data.zones ?? {})
          setTotalPlayers(data.total ?? 0)
        } else {
          setVotes({})
          setTotalPlayers(0)
        }
      },
      (err) => {
        console.error('Firestore read error:', err)
        setFirebaseError('read')
      }
    )
    return unsub
  }, [today])

  async function submitVote(chosenIds) {
    if (hasPlayed || !pseudo) return

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

    try {
      const ref = doc(db, 'votes', today)

      // updateDoc handles dot-notation as nested field paths (setDoc merge does not)
      const updates = { total: increment(1) }
      chosenIds.forEach((id) => {
        updates[`zones.${id}`] = increment(1)
      })
      try {
        await updateDoc(ref, updates)
      } catch {
        // Document doesn't exist yet — create it with proper nested structure
        const zones = {}
        chosenIds.forEach((id) => { zones[String(id)] = 1 })
        await setDoc(ref, { total: 1, zones })
      }

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

      setFirebaseError(null)
    } catch (err) {
      console.error('Firestore write error:', err)
      setFirebaseError('write')
    }

    localStorage.setItem(PLAYED_PREFIX + today, '1')
    localStorage.setItem(CHOSEN_PREFIX + today, JSON.stringify(chosenIds))
    setSavedChosenIds(chosenIds)
    setHasPlayed(true)
  }

  return { votes, totalPlayers, hasPlayed, savedChosenIds, firebaseError, submitVote }
}
