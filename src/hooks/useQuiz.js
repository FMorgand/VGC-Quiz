import { useMemo } from 'react'
import questions from '../data/questions.json'

export const availableDates = Object.keys(questions).sort().reverse() // newest first

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function useQuiz(selectedDate) {
  const today = useMemo(() => todayKey(), [])
  const date = selectedDate ?? today
  const quiz = questions[date] ?? null

  return { today, quiz }
}
