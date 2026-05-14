export default function ResultScreen({ quiz, votes, totalPlayers, chosenIds }) {
  function getPercent(zoneId) {
    if (!votes || totalPlayers === 0) return 0
    return Math.round(((votes[zoneId] ?? 0) / totalPlayers) * 100)
  }

  function heatOpacity(pct) {
    return 0.15 + (pct / 100) * 0.6
  }

  // Top-4 zones by vote count
  const top4 = votes
    ? Object.entries(votes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([id]) => Number(id))
    : []

  const alignmentScore = chosenIds.filter((id) => top4.includes(id)).length
  const alignmentLabel = ['😬 0/4', '😐 1/4', '🙂 2/4', '😎 3/4', '🎯 4/4'][alignmentScore] ?? '—'

  return (
    <div className="result-wrapper">
      <p className="quiz-question">{quiz.question}</p>

      <div className="image-container">
        <img src={quiz.imageUrl} alt="Quiz du jour" draggable={false} />

        {quiz.zones.map((zone) => {
          const pct = getPercent(zone.id)
          const isChosen = chosenIds.includes(zone.id)
          return (
            <div
              key={zone.id}
              className={`zone zone--result ${isChosen ? 'zone--chosen' : ''}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.w}%`,
                height: `${zone.h}%`,
                backgroundColor: isChosen
                  ? `rgba(234, 179, 8, ${heatOpacity(pct)})`
                  : `rgba(239, 68, 68, ${heatOpacity(pct)})`,
              }}
            >
              <span className="zone-pct">{pct}%</span>
            </div>
          )
        })}
      </div>

      <div className="result-stats">
        <div className="stat-card">
          <span className="stat-label">Alignement</span>
          <span className="stat-value">{alignmentLabel}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Joueurs aujourd'hui</span>
          <span className="stat-value">{totalPlayers}</span>
        </div>
      </div>

      <p className="result-meta">
        <span className="legend legend--chosen">■ Votre choix</span>
        {'  '}
        <span className="legend legend--other">■ Autre zone</span>
      </p>
    </div>
  )
}
