const MAX_DISPLAY = 5

export default function TopTeams({ compositions, zones, totalPlayers }) {
  if (!compositions || Object.keys(compositions).length === 0) return null

  function getLabel(zoneId) {
    return zones.find((z) => z.id === Number(zoneId))?.label ?? `Zone ${zoneId}`
  }

  const sorted = Object.entries(compositions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_DISPLAY)

  return (
    <div className="top-teams">
      <h3 className="top-teams-title">Équipes les plus jouées</h3>

      {sorted.map(([key, count], i) => {
        const [l1, l2, b1, b2] = key.split('_')
        const pct = totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0
        const isFirst = i === 0

        return (
          <div key={key} className={`team-entry ${isFirst ? 'team-entry--top' : ''}`}>
            <span className="team-rank">#{i + 1}</span>

            <div className="team-composition">
              <div className="team-row">
                <span className="team-role team-role--lead">Lead</span>
                <span className="team-names">
                  {getLabel(l1)}
                  <span className="team-sep">+</span>
                  {getLabel(l2)}
                </span>
              </div>
              <div className="team-row">
                <span className="team-role team-role--back">Back</span>
                <span className="team-names">
                  {getLabel(b1)}
                  <span className="team-sep">+</span>
                  {getLabel(b2)}
                </span>
              </div>
            </div>

            <div className="team-stats">
              <span className="team-pct">{pct}%</span>
              <span className="team-count">{count} vote{count > 1 ? 's' : ''}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
