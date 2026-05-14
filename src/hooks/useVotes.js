import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const PLAYED_PREFIX = 'pokequiz_played_'
const CHOSEN_PREFIX = 'pokequiz_chosen_'

export function useVotes(today, pseudo) {
  const [votes, setVotes] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [compositions, setCompositions] = useState({})
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
          setCompositions(data.compositions ?? {})
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

    // votes = community data BEFORE this player's submission → clean comparison
    const othersTotal = votes ? Object.values(votes).reduce((sum, n) => sum + n, 0) : 0
    let alignmentScore = null
    if (votes && othersTotal > 0) {
      const top4 = Object.entries(votes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([id]) => Number(id))
      alignmentScore = chosenIds.filter((id) => top4.includes(id)).length
    }

    try {
      const ref = doc(db, 'votes', today)

      // chosenIds is ordered: [lead1, lead2, back1, back2]
      const leads = chosenIds.slice(0, 2)
      const backs = chosenIds.slice(2, 4)
      const compositionKey = chosenIds.join('_')

      // updateDoc handles dot-notation as nested field paths (setDoc merge does not)
      const updates = { total: increment(1) }
      chosenIds.forEach((id) => { updates[`zones.${id}`] = increment(1) })
      leads.forEach((id) => { updates[`leads.${id}`] = increment(1) })
      backs.forEach((id) => { updates[`backs.${id}`] = increment(1) })
      updates[`compositions.${compositionKey}`] = increment(1)

      try {
        await updateDoc(ref, updates)
      } catch {
        // Document doesn't exist yet — create it with proper nested structure
        const zones = {}, leadsMap = {}, backsMap = {}
        chosenIds.forEach((id) => { zones[String(id)] = 1 })
        leads.forEach((id) => { leadsMap[String(id)] = 1 })
        backs.forEach((id) => { backsMap[String(id)] = 1 })
        await setDoc(ref, {
          total: 1,
          zones,
          leads: leadsMap,
          backs: backsMap,
          compositions: { [compositionKey]: 1 },
        })
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

  return { votes, totalPlayers, compositions, hasPlayed, savedChosenIds, firebaseError, submitVote }
}
