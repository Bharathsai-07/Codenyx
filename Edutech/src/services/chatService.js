/**
 * Chat Service — simulates real-time mentor chat.
 * In production, this would use Socket.io with a backend.
 * For now, we persist messages in localStorage and simulate mentor responses.
 */

const CHAT_KEY = 'smartlearn_chat'

const MENTOR_RESPONSES = [
  "Great question! Let me explain this step by step.",
  "That's a common area of confusion. The key concept here is to break the problem into smaller parts.",
  "I'd recommend reviewing the lesson material once more and focusing on the examples provided.",
  "Excellent thinking! You're on the right track. Try applying the formula we discussed.",
  "Let me clarify — the main difference is in how we approach the solution. Would you like me to walk through an example?",
  "Good effort! Remember, practice makes perfect. Try 2-3 more problems on this topic.",
  "That's a really insightful question. Here's a simpler way to think about it...",
  "I see where you're stuck. The trick is to identify the pattern first, then apply the rule.",
  "You're making great progress! Keep at it. Do you have any other doubts?",
  "Let me share a helpful tip — always check your answer by substituting it back into the original equation.",
]

function getMessages() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY)) || []
  } catch { return [] }
}

function saveMessages(messages) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages))
}

export function getChatMessages() {
  return getMessages()
}

export function sendMessage(text) {
  const messages = getMessages()
  const userMessage = {
    id: Date.now().toString(),
    text,
    sender: 'student',
    timestamp: new Date().toISOString(),
  }
  messages.push(userMessage)
  saveMessages(messages)
  return userMessage
}

/** Simulates a mentor response after a short delay */
export function simulateMentorReply() {
  return new Promise((resolve) => {
    const delay = 1000 + Math.random() * 2000
    setTimeout(() => {
      const messages = getMessages()
      const reply = {
        id: (Date.now() + 1).toString(),
        text: MENTOR_RESPONSES[Math.floor(Math.random() * MENTOR_RESPONSES.length)],
        sender: 'mentor',
        senderName: 'Dr. Sarah Lee',
        timestamp: new Date().toISOString(),
      }
      messages.push(reply)
      saveMessages(messages)
      resolve(reply)
    }, delay)
  })
}

export function clearChat() {
  localStorage.removeItem(CHAT_KEY)
}
