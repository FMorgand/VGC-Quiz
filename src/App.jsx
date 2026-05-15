import { useState } from 'react'
import { usePlayer } from './hooks/usePlayer'
import { useQuiz, availableDates } from './hooks/useQuiz'
import { useVotes } from './hooks/useVotes'
import PseudoSetup from './components/PseudoSetup'
import QuizImage from './components/QuizImage'
import ResultScreen from './components/ResultScreen'
import StatsPage from './components/StatsPage'
import './index.css'

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function App() {
  const { pseudo, setPseudo } = usePlayer()
  const [selectedDate, setSelectedDate] = useState(() => availableDates[0] ?? new Date().toISOString().slice(0, 10))
  const [view, setView] = useState('quiz')

  const { today, quiz } = useQuiz(selectedDate)
  const { votes, totalPlayers, compositions, hasPlayed, savedChosenIds, firebaseError, submitVote } = useVotes(selectedDate, pseudo)
  const [chosenIds, setChosenIds] = useState(null)

  const isToday = selectedDate === today
  const isPast = selectedDate < today

  const currentIndex = availableDates.indexOf(selectedDate)
  const hasPrev = currentIndex < availableDates.length - 1
  const hasNext = currentIndex > 0

  function goToPrev() {
    if (hasPrev) { setSelectedDate(availableDates[currentIndex + 1]); setChosenIds(null) }
  }
  function goToNext() {
    if (hasNext) { setSelectedDate(availableDates[currentIndex - 1]); setChosenIds(null) }
  }

  const displayedChosenIds = chosenIds ?? savedChosenIds ?? []
  // Past dates: always show results; today: show results after voting
  const showResults = isPast || hasPlayed || chosenIds !== null

  if (!pseudo) return <PseudoSetup onConfirm={setPseudo} />

  return (
    <div className="app">
      <header className="app-header">
        <h1>PokéQuiz du Jour</h1>
        <div className="header-actions">
          <span className="pseudo-badge">{pseudo}</span>
          <button
            className={`nav-btn ${view === 'quiz' ? 'nav-btn--active' : ''}`}
            onClick={() => setView('quiz')}
          >
            Quiz
          </button>
          <button
            className={`nav-btn ${view === 'stats' ? 'nav-btn--active' : ''}`}
            onClick={() => setView('stats')}
          >
            Stats
          </button>
        </div>
      </header>

      {availableDates.length > 1 && (
        <div className="date-nav">
          <button className="date-nav-btn" onClick={goToPrev} disabled={!hasPrev} aria-label="Jour précédent">←</button>
          <span className="date-nav-label">
            {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
          </span>
          <button className="date-nav-btn" onClick={goToNext} disabled={!hasNext} aria-label="Jour suivant">→</button>
        </div>
      )}

      <main>
        {firebaseError && (
          <div className="firebase-error">
            {firebaseError === 'read'
              ? 'Impossible de lire les stats (Firestore inaccessible). Vérifiez les règles Firestore.'
              : "Impossible d'enregistrer votre vote (Firestore inaccessible). Vérifiez les règles Firestore."}
          </div>
        )}

        {!quiz ? (
          <div className="no-quiz">
            <p>Pas de quiz disponible pour cette date.</p>
          </div>
        ) : view === 'stats' ? (
          <StatsPage quiz={quiz} votes={votes} compositions={compositions} totalPlayers={totalPlayers} />
        ) : showResults ? (
          <>
            {isPast && !savedChosenIds && (
              <p className="past-notice">Vous n'avez pas joué ce jour-là.</p>
            )}
            <ResultScreen
              quiz={quiz}
              votes={votes}
              totalPlayers={totalPlayers}
              compositions={compositions}
              chosenIds={displayedChosenIds}
            />
            <div className="result-actions">
              <button className="nav-btn" onClick={() => setView('stats')}>Voir les stats</button>
            </div>
          </>
        ) : (
          <QuizImage quiz={quiz} onSubmit={async (ids) => { setChosenIds(ids); await submitVote(ids) }} disabled={false} />
        )}
      </main>
    </div>
  )
}
