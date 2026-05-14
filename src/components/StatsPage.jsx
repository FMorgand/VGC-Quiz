import TopTeams from './TopTeams'

function BarChart({ title, items, color }) {
  if (!items.length) return null
  const max = Math.max(...items.map((i) => i.pct), 1)

  return (
    <div className="stat-section">
      <h3 className="stat-section-title">{title}</h3>
      <div className="bar-chart">
        {items.map((item) => (
          <div key={item.label} className="bar-row">
            <span className="bar-label">{item.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(item.pct / max) * 100}%`,
                  background: item.color ?? color,
                }}
              />
            </div>
            <span className="bar-value">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StatsPage({ quiz, votes, compositions, totalPlayers }) {
  if (!totalPlayers) {
    return <p className="loading">Pas encore de données pour aujourd'hui.</p>
  }

  function getLabel(zoneId) {
    return quiz.zones.find((z) => z.id === Number(zoneId))?.label ?? `Zone ${zoneId}`
  }

  function pct(count) {
    return Math.round(((count ?? 0) / totalPlayers) * 100)
  }

  // Chart 1 — Selection rate per Pokémon
  const selectionItems = quiz.zones
    .map((zone) => ({ label: zone.label, pct: pct(votes?.[zone.id]) }))
    .sort((a, b) => b.pct - a.pct)

  // Chart 4 — Benched rate (inverse of selection)
  const benchedItems = quiz.zones
    .map((zone) => ({ label: zone.label, pct: 100 - pct(votes?.[zone.id]) }))
    .sort((a, b) => b.pct - a.pct)

  // Derive lead/back pairs from compositions
  const leadPairsMap = {}
  const backPairsMap = {}
  Object.entries(compositions ?? {}).forEach(([key, count]) => {
    const parts = key.split('_')
    const lk = `${parts[0]}_${parts[1]}`
    const bk = `${parts[2]}_${parts[3]}`
    leadPairsMap[lk] = (leadPairsMap[lk] ?? 0) + count
    backPairsMap[bk] = (backPairsMap[bk] ?? 0) + count
  })

  // Chart 2 — Lead pairs
  const leadItems = Object.entries(leadPairsMap)
    .map(([key, count]) => {
      const [a, b] = key.split('_')
      return { label: `${getLabel(a)} + ${getLabel(b)}`, pct: pct(count) }
    })
    .sort((a, b) => b.pct - a.pct)

  // Chart 3 — Back pairs
  const backItems = Object.entries(backPairsMap)
    .map(([key, count]) => {
      const [a, b] = key.split('_')
      return { label: `${getLabel(a)} + ${getLabel(b)}`, pct: pct(count) }
    })
    .sort((a, b) => b.pct - a.pct)

  return (
    <div className="stats-page">
      <div className="stats-header">
        <span className="stats-total">{totalPlayers} joueur{totalPlayers > 1 ? 's' : ''} aujourd'hui</span>
      </div>

      <BarChart title="Taux de sélection" items={selectionItems} color="var(--accent)" />
      <BarChart title="Lead le plus joué" items={leadItems} color="var(--accent)" />
      <BarChart title="Back le plus joué" items={backItems} color="#818cf8" />
      <BarChart title="Pokémon les moins joués" items={benchedItems} color="var(--red)" />
      <TopTeams compositions={compositions} zones={quiz.zones} totalPlayers={totalPlayers} />
    </div>
  )
}
