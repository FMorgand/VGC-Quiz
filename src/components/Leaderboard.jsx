import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

function avgAlignment(history) {
  if (!history?.length) return null
  const scored = history.filter((h) => h.alignment != null)
  if (!scored.length) return null
  const avg = scored.reduce((sum, h) => sum + h.alignment, 0) / scored.length
  return Math.round(avg * 10) / 10
}

export default function Leaderboard({ currentPseudo }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('streak') // 'streak' | 'alignment'

  useEffect(() => {
    async function fetchLeaderboard() {
      const q = query(collection(db, 'players'), orderBy('streak', 'desc'), limit(50))
      const snap = await getDocs(q)
      setPlayers(snap.docs.map((d) => ({ pseudo: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  if (loading) return <p className="loading">Chargement du classement…</p>
  if (players.length === 0) return <p className="loading">Aucun joueur encore.</p>

  const sorted = [...players].sort((a, b) => {
    if (sortBy === 'alignment') {
      return (avgAlignment(b.history) ?? -1) - (avgAlignment(a.history) ?? -1)
    }
    return b.streak - a.streak
  })

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Classement</h2>
        <div className="sort-tabs">
          <button
            className={`sort-tab ${sortBy === 'streak' ? 'sort-tab--active' : ''}`}
            onClick={() => setSortBy('streak')}
          >
            🔥 Streaks
          </button>
          <button
            className={`sort-tab ${sortBy === 'alignment' ? 'sort-tab--active' : ''}`}
            onClick={() => setSortBy('alignment')}
          >
            🎯 Alignement
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Pseudo</th>
            <th>Streak</th>
            <th>Alignement moy.</th>
            <th>Parties</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const avg = avgAlignment(p.history)
            return (
              <tr key={p.pseudo} className={p.pseudo === currentPseudo ? 'row--me' : ''}>
                <td>{i + 1}</td>
                <td>{p.pseudo}</td>
                <td>{p.streak} 🔥</td>
                <td>{avg != null ? `${avg}/4` : '—'}</td>
                <td>{p.history?.length ?? 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
