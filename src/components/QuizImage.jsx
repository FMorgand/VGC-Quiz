import { useState } from 'react'

export default function QuizImage({ quiz, onSubmit, disabled }) {
  // Ordered array: index 0-1 = leads, index 2-3 = backs
  const [selected, setSelected] = useState([])

  function toggleZone(id) {
    if (disabled) return
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((z) => z !== id)
      if (prev.length >= 4) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="quiz-image-wrapper">
      <p className="quiz-question">{quiz.question}</p>

      <div className="image-container">
        <img src={quiz.imageUrl} alt="Quiz du jour" draggable={false} />

        {quiz.zones.map((zone) => {
          const slotIndex = selected.indexOf(zone.id)
          const isSelected = slotIndex !== -1
          const isLead = slotIndex === 0 || slotIndex === 1

          return (
            <button
              key={zone.id}
              className={`zone ${isSelected ? (isLead ? 'zone--lead' : 'zone--back') : ''}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.w}%`,
                height: `${zone.h}%`,
              }}
              onClick={() => toggleZone(zone.id)}
              aria-label={zone.label}
            >
              {isSelected && (
                <span className={`zone-badge ${isLead ? 'zone-badge--lead' : 'zone-badge--back'}`}>
                  {slotIndex + 1}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="slot-panel">
        <div className="slot-group">
          <span className="slot-group-label slot-group-label--lead">Lead</span>
          {[0, 1].map((i) => {
            const zone = quiz.zones.find((z) => z.id === selected[i])
            return (
              <div key={i} className={`slot ${zone ? 'slot--lead' : 'slot--empty'}`}>
                <span className="slot-num">{i + 1}</span>
                <span className="slot-name">{zone?.label ?? '—'}</span>
              </div>
            )
          })}
        </div>

        <div className="slot-group">
          <span className="slot-group-label slot-group-label--back">Back</span>
          {[2, 3].map((i) => {
            const zone = quiz.zones.find((z) => z.id === selected[i])
            return (
              <div key={i} className={`slot ${zone ? 'slot--back' : 'slot--empty'}`}>
                <span className="slot-num">{i + 1}</span>
                <span className="slot-name">{zone?.label ?? '—'}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="quiz-footer">
        <span className="remaining-count">
          {selected.length < 4
            ? `Sélectionnez encore ${4 - selected.length} Pokémon`
            : 'Prêt à valider !'}
        </span>
        <button
          className="btn-validate"
          disabled={selected.length < 4 || disabled}
          onClick={() => onSubmit(selected)}
        >
          Valider
        </button>
      </div>
    </div>
  )
}
