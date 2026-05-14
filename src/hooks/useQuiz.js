import { useMemo } from 'react'
import questions from '../data/questions.json'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function useQuiz() {
  const today = useMemo(() => todayKey(), [])
  const quiz = questions[today] ?? null

  return { today, quiz }
}
