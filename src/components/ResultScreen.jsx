export default function ResultScreen({ quiz, votes, totalPlayers, chosenIds }) {
  // chosenIds is ordered: [lead1, lead2, back1, back2]
  const leads = chosenIds.slice(0, 2)
  const backs = chosenIds.slice(2, 4)

  function getPercent(zoneId) {
    if (!votes || totalPlayers === 0) return 0
    return Math.round(((votes[zoneId] ?? 0) / totalPlayers) * 100)
  }

  function heatOpacity(pct) {
    return 0.15 + (pct / 100) * 0.6
  }

  const alignmentLabel = (() => {
    const othersTotal = totalPlayers - 1
    if (!votes || othersTotal <= 0) return '—'
    const othersVotes = {}
    Object.entries(votes).forEach(([id, count]) => {
      const myContrib = chosenIds.includes(Number(id)) ? 1 : 0
      othersVotes[id] = Math.max(0, count - myContrib)
    })
    const top4 = Object.entries(othersVotes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => Number(id))
    const score = chosenIds.filter((id) => top4.includes(id)).length
    return ['😬 0/4', '😐 1/4', '🙂 2/4', '😎 3/4', '🎯 4/4'][score] ?? '—'
  })()

  return (
    <div className="result-wrapper">
      <p className="quiz-question">{quiz.question}</p>

      <div className="image-container">
        <img src={quiz.imageUrl} alt="Quiz du jour" draggable={false} />

        {quiz.zones.map((zone) => {
          const pct = getPercent(zone.id)
          const slotIndex = chosenIds.indexOf(zone.id)
          const isChosen = slotIndex !== -1
          const isLead = slotIndex === 0 || slotIndex === 1

          return (
            <div
              key={zone.id}
              className={`zone zone--result ${isChosen ? (isLead ? 'zone--result-lead' : 'zone--result-back') : ''}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.w}%`,
                height: `${zone.h}%`,
                backgroundColor: isChosen
                  ? isLead
                    ? `rgba(250, 204, 21, ${heatOpacity(pct)})`
                    : `rgba(129, 140, 248, ${heatOpacity(pct)})`
                  : `rgba(239, 68, 68, ${heatOpacity(pct)})`,
              }}
            >
              {isChosen && (
                <span className={`zone-badge ${isLead ? 'zone-badge--lead' : 'zone-badge--back'}`}>
                  {slotIndex + 1}
                </span>
              )}
              <span className="zone-pct">{pct}%</span>
            </div>
          )
        })}
      </div>

      <div className="slot-panel slot-panel--result">
        <div className="slot-group">
          <span className="slot-group-label slot-group-label--lead">Lead</span>
          {leads.map((id, i) => {
            const zone = quiz.zones.find((z) => z.id === id)
            return (
              <div key={i} className="slot slot--lead">
                <span className="slot-num">{i + 1}</span>
                <span className="slot-name">{zone?.label ?? '?'}</span>
                <span className="slot-pct">{getPercent(id)}%</span>
              </div>
            )
          })}
        </div>

        <div className="slot-group">
          <span className="slot-group-label slot-group-label--back">Back</span>
          {backs.map((id, i) => {
            const zone = quiz.zones.find((z) => z.id === id)
            return (
              <div key={i} className="slot slot--back">
                <span className="slot-num">{i + 3}</span>
                <span className="slot-name">{zone?.label ?? '?'}</span>
                <span className="slot-pct">{getPercent(id)}%</span>
              </div>
            )
          })}
        </div>
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
    </div>
  )
}
