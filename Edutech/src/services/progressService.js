/**
 * Progress & Quiz Service — localStorage-backed.
 * Stores quiz results, tracks completion, calculates analytics.
 */

const STORAGE_KEY = 'smartlearn_progress'
const COMPLETED_TOPICS_KEY = 'smartlearn_completed_topics'

function getStoredResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch { return [] }
}

function saveResults(results) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
}

function getCompletedTopics() {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_TOPICS_KEY)) || []
  } catch { return [] }
}

function saveCompletedTopics(topics) {
  localStorage.setItem(COMPLETED_TOPICS_KEY, JSON.stringify(topics))
}

/** Mark a topic lesson as completed (read) */
export function markTopicCompleted(topicId) {
  const completed = getCompletedTopics()
  if (!completed.includes(topicId)) {
    completed.push(topicId)
    saveCompletedTopics(completed)
  }
}

/** Check if a topic lesson has been completed */
export function isTopicCompleted(topicId) {
  return getCompletedTopics().includes(topicId)
}

/** Get all completed topic IDs */
export function getCompletedTopicIds() {
  return getCompletedTopics()
}

/** Save a quiz result */
export function saveQuizResult({ topicId, topicTitle, subjectId, subjectName, score, totalQuestions, answers }) {
  const results = getStoredResults()
  const result = {
    id: Date.now().toString(),
    topicId,
    topicTitle,
    subjectId,
    subjectName,
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    answers,
    date: new Date().toISOString(),
  }
  results.push(result)
  saveResults(results)
  return result
}

/** Get all quiz results */
export function getAllQuizResults() {
  return getStoredResults()
}

/** Get results for a specific topic */
export function getResultsByTopic(topicId) {
  return getStoredResults().filter(r => r.topicId === topicId)
}

/** Get results for a specific subject */
export function getResultsBySubject(subjectId) {
  return getStoredResults().filter(r => r.subjectId === subjectId)
}

/** Calculate overall stats for the progress page */
export function getProgressStats() {
  const results = getStoredResults()

  if (results.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      totalPoints: 0,
      level: 1,
      hasPerfectScore: false,
      streak: 0,
      subjectsAttempted: 0,
      weakTopics: [],
      strongTopics: [],
      recentResults: [],
      subjectBreakdown: {},
      improvementData: [],
    }
  }

  const totalQuizzes = results.length
  const averageScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes)
  const hasPerfectScore = results.some(r => r.percentage === 100)

  // Points: 10 per correct answer + bonus for high scores
  const totalPoints = results.reduce((sum, r) => {
    let points = r.score * 10
    if (r.percentage === 100) points += 50
    else if (r.percentage >= 80) points += 20
    else if (r.percentage >= 60) points += 10
    return sum + points
  }, 0)

  // Level: every 200 points = 1 level
  const level = Math.max(1, Math.floor(totalPoints / 200) + 1)

  // Streak: consecutive quizzes with 60%+
  let streak = 0
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].percentage >= 60) streak++
    else break
  }

  // Subjects attempted
  const subjectsSet = new Set(results.map(r => r.subjectId))
  const subjectsAttempted = subjectsSet.size

  // Topic analysis
  const topicScores = {}
  results.forEach(r => {
    if (!topicScores[r.topicId]) {
      topicScores[r.topicId] = { title: r.topicTitle, subjectName: r.subjectName, scores: [] }
    }
    topicScores[r.topicId].scores.push(r.percentage)
  })

  const weakTopics = []
  const strongTopics = []
  Object.entries(topicScores).forEach(([topicId, data]) => {
    const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
    const entry = { topicId, title: data.title, subjectName: data.subjectName, average: avg }
    if (avg < 40) weakTopics.push(entry)
    else if (avg >= 80) strongTopics.push(entry)
  })

  // Subject breakdown
  const subjectBreakdown = {}
  results.forEach(r => {
    if (!subjectBreakdown[r.subjectName]) {
      subjectBreakdown[r.subjectName] = { scores: [], quizzes: 0 }
    }
    subjectBreakdown[r.subjectName].scores.push(r.percentage)
    subjectBreakdown[r.subjectName].quizzes++
  })
  Object.keys(subjectBreakdown).forEach(name => {
    const data = subjectBreakdown[name]
    data.average = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
  })

  // Improvement over time (last 10 results)
  const improvementData = results.slice(-10).map((r, i) => ({
    index: i + 1,
    score: r.percentage,
    topic: r.topicTitle,
    date: new Date(r.date).toLocaleDateString(),
  }))

  // Recent results (last 5)
  const recentResults = results.slice(-5).reverse()

  return {
    totalQuizzes,
    averageScore,
    totalPoints,
    level,
    hasPerfectScore,
    streak,
    subjectsAttempted,
    weakTopics,
    strongTopics,
    recentResults,
    subjectBreakdown,
    improvementData,
  }
}

/** Reset all progress */
export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(COMPLETED_TOPICS_KEY)
}
