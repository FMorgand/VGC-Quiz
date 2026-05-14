import { useState } from 'react'

const MAX_SELECTIONS = 4

export default function QuizImage({ quiz, onSubmit, disabled }) {
  const [selected, setSelected] = useState([])

  function toggleZone(id) {
    if (disabled) return
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((z) => z !== id)
      if (prev.length >= MAX_SELECTIONS) return prev
      return [...prev, id]
    })
  }

  const remaining = MAX_SELECTIONS - selected.length

  return (
    <div className="quiz-image-wrapper">
      <p className="quiz-question">{quiz.question}</p>

      <div className="image-container">
        <img src={quiz.imageUrl} alt="Quiz du jour" draggable={false} />

        {quiz.zones.map((zone) => {
          const isSelected = selected.includes(zone.id)
          return (
            <button
              key={zone.id}
              className={`zone ${isSelected ? 'zone--selected' : ''}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.w}%`,
                height: `${zone.h}%`,
              }}
              onClick={() => toggleZone(zone.id)}
              aria-label={zone.label}
              aria-pressed={isSelected}
            />
          )
        })}
      </div>

      <div className="quiz-footer">
        <span className="remaining-count">
          {remaining > 0
            ? `Sélectionnez encore ${remaining} zone${remaining > 1 ? 's' : ''}`
            : 'Prêt à valider !'}
        </span>
        <button
          className="btn-validate"
          disabled={remaining > 0 || disabled}
          onClick={() => onSubmit(selected)}
        >
          Valider
        </button>
      </div>
    </div>
  )
}
