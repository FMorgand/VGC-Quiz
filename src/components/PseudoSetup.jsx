import { useState } from 'react'

export default function PseudoSetup({ onConfirm }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed.length >= 2) onConfirm(trimmed)
  }

  return (
    <div className="setup-screen">
      <h1>PokéQuiz du Jour</h1>
      <p>Choisissez un pseudo pour commencer. Vous ne pourrez pas le changer.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Votre pseudo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={20}
          autoFocus
        />
        <button type="submit" disabled={value.trim().length < 2}>
          Jouer
        </button>
      </form>
    </div>
  )
}
