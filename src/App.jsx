import { useState } from 'react'
import { usePlayer } from './hooks/usePlayer'
import { useQuiz } from './hooks/useQuiz'
import { useVotes } from './hooks/useVotes'
import PseudoSetup from './components/PseudoSetup'
import QuizImage from './components/QuizImage'
import ResultScreen from './components/ResultScreen'
import Leaderboard from './components/Leaderboard'
import './index.css'

export default function App() {
  const { pseudo, setPseudo } = usePlayer()
  const { today, quiz } = useQuiz()
  const { votes, totalPlayers, hasPlayed, savedChosenIds, submitVote } = useVotes(today, pseudo)
  const [chosenIds, setChosenIds] = useState(null)
  const [view, setView] = useState('quiz') // 'quiz' | 'leaderboard'

  const displayedChosenIds = chosenIds ?? savedChosenIds ?? []

  if (!pseudo) {
    return <PseudoSetup onConfirm={setPseudo} />
  }

  if (!quiz) {
    return (
      <div className="no-quiz">
        <h1>PokéQuiz du Jour</h1>
        <p>Pas de quiz disponible aujourd'hui. Revenez demain !</p>
      </div>
    )
  }

  async function handleSubmit(ids) {
    setChosenIds(ids)
    await submitVote(ids)
  }

  const showResults = hasPlayed || chosenIds !== null

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
            className={`nav-btn ${view === 'leaderboard' ? 'nav-btn--active' : ''}`}
            onClick={() => setView('leaderboard')}
          >
            Classement
          </button>
        </div>
      </header>

      <main>
        {view === 'leaderboard' ? (
          <Leaderboard currentPseudo={pseudo} />
        ) : showResults ? (
          <>
            <ResultScreen
              quiz={quiz}
              votes={votes}
              totalPlayers={totalPlayers}
              chosenIds={displayedChosenIds}
            />
            <div className="result-actions">
              <button className="nav-btn" onClick={() => setView('leaderboard')}>
                Voir le classement
              </button>
            </div>
          </>
        ) : (
          <QuizImage quiz={quiz} onSubmit={handleSubmit} disabled={false} />
        )}
      </main>
    </div>
  )
}
