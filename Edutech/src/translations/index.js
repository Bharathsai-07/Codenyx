import { useEffect, useMemo, useState } from 'react'
import hindiUi from './hindi/ui'
import teluguUi from './telugu/ui'

const STORAGE_KEY = 'smartlearn_lang'

const englishUi = {
  footerTagline: '2026 SmartLearn. Personalized Education Platform.',
  footerSupport: 'Support',
  footerTerms: 'Terms',
  footerPrivacy: 'Privacy',
  comingSoonDesc: 'This section is under development and will be available soon.',
  loadingSmartLearn: 'Loading SmartLearn...',
  appName: 'SmartLearn',
  loading: 'Loading...',

  navDashboard: 'Dashboard',
  navLessons: 'Lessons',
  navProgress: 'Progress',
  navDoubts: 'Doubts',
  navAchievements: 'Achievements',
  navProfile: 'Profile',
  navMyStudents: 'My Students',
  navAnalytics: 'Analytics',
  navSupport: 'Support',
  navUsers: 'Users',
  navMentorRequests: 'Mentor Requests',
  navSettings: 'Settings',
  signOut: 'Sign Out',

  accessDeniedTitle: 'Access Denied',
  accessDeniedLine1: 'Your current role is',
  accessDeniedLine2: "You don't have permission to access this section.",
  accessDeniedSub: 'Only the platform administrator can change user roles from the Clerk Dashboard. Contact your admin to request elevated access.',
  goToDashboard: 'Go to My Dashboard',

  studentWelcomeBack: 'Welcome back',
  levelStudent: 'Level {level} Student',
  currentLevel: 'Current Level',
  averageScore: 'Average Score',
  totalPoints: 'Total Points',
  topicsDone: 'Topics Done',
  recommendedNext: 'Recommended Next',
  startLearning: 'Start Learning',
  recentScores: 'Recent Scores',
  viewAll: 'View All',
  noQuizzesYet: 'No quizzes taken yet. Start a lesson!',
  progressSummary: 'Progress Summary',
  quizzes: 'Quizzes',
  streak: 'Streak',
  badges: 'Badges',
  weakTopicsNeedAttention: '{count} weak topic(s) need attention',
  fullReport: 'Full Report',
  quickActions: 'Quick Actions',
  askDoubt: 'Ask Doubt',

  mentorPortal: 'Mentor Portal',
  mentorBadge: 'Mentor',
  studentWatchlist: 'Student Watchlist',
  student: 'Student',
  progress: 'Progress',
  status: 'Status',
  weakArea: 'Weak Area',
  actions: 'Actions',
  review: 'Review',
  pendingDoubts: 'Pending Doubts',
  answerNow: 'Answer Now',

  adminConsole: 'Admin Console',
  systemOverview: 'System overview',
  adminBadge: 'Admin',
  totalUsers: 'Total Users',
  activeMentors: 'Active Mentors',
  avgPerformance: 'Avg Performance',
  activeSessions: 'Active Sessions',
  systemHealthGrowth: 'System Health & Growth',
  recentUsers: 'Recently Joined Users',
  manageUsers: 'Manage Users',
  viewLogs: 'View Logs',
  roleManagement: 'Role Management',

  learningModuleTitle: 'Learning Module',
  learningModuleSub: 'Choose a subject and start learning at your own pace',
  levels: 'levels',
  topics: 'topics',
  backToSubjects: 'Back to Subjects',
  level: 'Level',
  best: 'Best',
  start: 'Start',

  topicNotFound: 'Topic not found',
  backToLessons: 'Back to Lessons',
  readSuffix: 'read',
  completed: 'Completed',
  markCompleted: 'Mark as Completed',
  takeQuiz: 'Take Quiz',

  quizNotAvailable: 'Quiz not available',
  quizComplete: 'Quiz Complete!',
  correct: 'correct',
  pointsEarned: 'Points earned',
  yourAnswer: 'Your answer',
  notAnswered: 'Not answered',
  correctAnswer: 'Correct',
  viewProgress: 'View Progress',
  back: 'Back',
  previous: 'Previous',
  next: 'Next',
  submitQuiz: 'Submit Quiz',
  achievementsTitleShort: 'Achievements',

  progressTrackingTitle: 'Progress Tracking',
  progressTrackingSub: 'Track your learning journey, identify strengths, and improve weak areas',
  noQuizData: 'No quiz data yet',
  noQuizDataSub: 'Complete some quizzes to see your progress analytics here.',
  quizzesTaken: 'Quizzes Taken',
  scoreTrend: 'Score Trend (Last 10)',
  subjectBreakdown: 'Subject Breakdown',
  weakTopics: 'Weak Topics',
  strongTopics: 'Strong Topics',
  noWeakTopics: 'No weak topics! Great job!',
  practiceAbove80: 'Keep practicing to get your scores above 80%!',
  recentResults: 'Recent Results',

  achievementsTitle: 'Achievements & Gamification',
  achievementsSub: 'Earn badges by completing quizzes and hitting milestones',
  badgesEarned: 'Badges Earned',
  levelProgress: 'Level Progress',
  ptsToLevel: 'pts to Level',
  earnedBadges: 'Earned Badges',
  lockedBadges: 'Locked Badges',

  doubtSupportTitle: 'Doubt Support',
  doubtSupportSub: 'Chat with your mentor for instant help',
  clearChat: 'Clear Chat',
  online: 'Online',
  startConversation: 'Start a conversation',
  startConversationSub: "Ask any question about your lessons or topics you're stuck on.",
  typeQuestion: 'Type your question...',
  send: 'Send',
  realtimeNote: 'In production, this chat uses Socket.io for real-time communication with mentors.',
  aiAssistantTitle: 'AI Assistant',
  aiOpen: 'AI Chat',
  aiClose: 'Close Chat',
  aiThinking: 'Thinking...',
  aiError: 'Unable to fetch response. Check your API key and endpoint.',
  aiInputPlaceholder: 'Ask anything...',
  aiStudentGreeting: 'Hi! I am your AI study assistant. Ask me any concept, quiz, or revision question.',
  aiMentorGreeting: 'Hi! I am your AI mentor assistant. Ask for lesson ideas, explanations, or student guidance.',

  loginWelcomeBack: 'Welcome Back',
  loginSignInSub: 'Sign in to access your personalized dashboard',
  roleAssignedNote: 'Your role (Student, Mentor, Admin) is assigned by the platform administrator.',
  profileTitle: ' Profile Settings',
  profileSubtitle: 'Update your personal details and preferences',
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  emailManagedByClerk: 'Email is managed by Clerk authentication',
  saveChanges: 'Save Changes',
  saving: 'Saving...',
  saved: '✅ Saved!',
  languagePreferenceTitle: '🌐 Language Preference',
  languagePreferenceDesc: 'Select your preferred language for the platform interface.',
  accountSecurityTitle: 'Account Security',
  accountSecurityDesc: "Password, two-factor authentication, and connected accounts are managed through Clerk's secure portal. Click the button below to manage your security settings.",
  manageSecurity: 'Manage Security',
  langEnglish: 'English',
  langHindi: 'Hindi',
  langTelugu: 'Telugu',
}

const languageDictionary = {
  en: englishUi,
  hi: hindiUi,
  te: teluguUi,
}

function normalizeLanguage(code) {
  if (code === 'hi' || code === 'te') {
    return code
  }
  return 'en'
}

export function getSelectedLanguage() {
  if (typeof window === 'undefined') {
    return 'en'
  }
  return normalizeLanguage(localStorage.getItem(STORAGE_KEY))
}

export function setSelectedLanguage(code) {
  if (typeof window === 'undefined') {
    return
  }
  const normalized = normalizeLanguage(code)
  localStorage.setItem(STORAGE_KEY, normalized)
  window.dispatchEvent(new Event('smartlearn-language-changed'))
}

export function getTextForLanguage(key, code) {
  const selectedDictionary = languageDictionary[normalizeLanguage(code)] || englishUi
  return selectedDictionary[key] || englishUi[key] || key
}

export function getLocaleForLanguage(language) {
  const selected = normalizeLanguage(language)
  if (selected === 'hi') return 'hi-IN'
  if (selected === 'te') return 'te-IN'
  return 'en-US'
}

export function useUiText() {
  const [language, setLanguage] = useState(getSelectedLanguage)

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setLanguage(getSelectedLanguage())
      }
    }

    const onLanguageChanged = () => {
      setLanguage(getSelectedLanguage())
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('smartlearn-language-changed', onLanguageChanged)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('smartlearn-language-changed', onLanguageChanged)
    }
  }, [])

  const dictionary = useMemo(() => languageDictionary[language] || englishUi, [language])

  const t = (key) => dictionary[key] || englishUi[key] || key

  return { t, language }
}
