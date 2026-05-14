import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export default function Leaderboard({ currentPseudo }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      const q = query(collection(db, 'players'), orderBy('streak', 'desc'), limit(20))
      const snap = await getDocs(q)
      setPlayers(snap.docs.map((d) => ({ pseudo: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  if (loading) return <p className="loading">Chargement du classement…</p>
  if (players.length === 0) return <p className="loading">Aucun joueur encore.</p>

  return (
    <div className="leaderboard">
      <h2>Classement — Streaks</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Pseudo</th>
            <th>Streak</th>
            <th>Parties</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.pseudo} className={p.pseudo === currentPseudo ? 'row--me' : ''}>
              <td>{i + 1}</td>
              <td>{p.pseudo}</td>
              <td>{p.streak} 🔥</td>
              <td>{p.history?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
