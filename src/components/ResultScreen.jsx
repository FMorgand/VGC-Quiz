export default function ResultScreen({ quiz, votes, totalPlayers, chosenIds }) {
  function getPercent(zoneId) {
    if (!votes || totalPlayers === 0) return 0
    return Math.round(((votes[zoneId] ?? 0) / totalPlayers) * 100)
  }

  // Opacity 0.15 (no votes) → 0.75 (100% votes)
  function heatOpacity(pct) {
    return 0.15 + (pct / 100) * 0.6
  }

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

      <p className="result-meta">
        {totalPlayers} joueur{totalPlayers > 1 ? 's' : ''} ont voté aujourd'hui.
        <br />
        <span className="legend legend--chosen">■ Votre choix</span>
        {'  '}
        <span className="legend legend--other">■ Autre zone</span>
      </p>
    </div>
  )
}
