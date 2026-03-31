const conversations = new Map()
const messagesByConversationId = new Map()
const conversationIdByKey = new Map()
const studentInterestByUserId = new Map()
const roundRobinCursorBySubject = new Map()

let sequence = 1

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeSubject(value) {
  return normalizeText(value)
}

function toConversationKey(studentId, mentorId, subject) {
  return `${studentId}::${mentorId}::${subject || 'general'}`
}

function nextId(prefix) {
  sequence += 1
  return `${prefix}_${Date.now()}_${sequence}`
}

function toSubjectArray(rawMetadata) {
  const metadata = rawMetadata || {}
  const raw = metadata.mentorSubjects || metadata.subjects || metadata.subject || metadata.subjectExpertise || []

  if (Array.isArray(raw)) {
    return raw
      .map((entry) => normalizeSubject(entry))
      .filter(Boolean)
  }

  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((entry) => normalizeSubject(entry))
      .filter(Boolean)
  }

  return []
}

function mentorMatchesSubject(mentorSubjects, subject) {
  if (!subject) return true
  const wanted = normalizeSubject(subject)
  if (!wanted) return true
  if (!Array.isArray(mentorSubjects) || mentorSubjects.length === 0) return false
  return mentorSubjects.some((entry) => normalizeSubject(entry) === wanted)
}

export function setStudentInterest(userId, subject) {
  const safeUserId = String(userId || '').trim()
  const safeSubject = normalizeSubject(subject)

  if (!safeUserId || !safeSubject) return
  studentInterestByUserId.set(safeUserId, safeSubject)
}

export function getStudentInterest(userId) {
  const safeUserId = String(userId || '').trim()
  if (!safeUserId) return ''
  return studentInterestByUserId.get(safeUserId) || ''
}

export function pickMentorForSubject({ subject, mentors }) {
  const safeSubject = normalizeSubject(subject)
  const mentorList = Array.isArray(mentors) ? mentors : []

  let candidateMentors = mentorList
  if (safeSubject) {
    const strictMatches = mentorList.filter((mentor) => mentorMatchesSubject(mentor.mentorSubjects, safeSubject))
    if (strictMatches.length > 0) {
      candidateMentors = strictMatches
    }
  }

  if (candidateMentors.length === 0) {
    return null
  }

  const cursorKey = safeSubject || 'general'
  const cursor = roundRobinCursorBySubject.get(cursorKey) || 0
  const picked = candidateMentors[cursor % candidateMentors.length]

  roundRobinCursorBySubject.set(cursorKey, cursor + 1)
  return picked
}

export function upsertConversation({ student, mentor, subject }) {
  const studentId = String(student?.id || '').trim()
  const mentorId = String(mentor?.id || '').trim()
  const normalizedSubject = normalizeSubject(subject)

  if (!studentId || !mentorId) {
    throw new Error('Student and mentor are required')
  }

  const key = toConversationKey(studentId, mentorId, normalizedSubject)
  const existingId = conversationIdByKey.get(key)

  if (existingId && conversations.has(existingId)) {
    return conversations.get(existingId)
  }

  const now = new Date().toISOString()
  const conversation = {
    id: nextId('conv'),
    studentId,
    studentName: student.name || 'Student',
    studentEmail: student.email || '',
    studentImageUrl: student.imageUrl || '',
    mentorId,
    mentorName: mentor.name || 'Mentor',
    mentorEmail: mentor.email || '',
    mentorImageUrl: mentor.imageUrl || '',
    subject: normalizedSubject,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    lastMessageText: '',
  }

  conversations.set(conversation.id, conversation)
  messagesByConversationId.set(conversation.id, [])
  conversationIdByKey.set(key, conversation.id)

  return conversation
}

export function appendMessage({ conversationId, senderId, senderRole, senderName, text }) {
  const safeConversationId = String(conversationId || '').trim()
  if (!safeConversationId || !conversations.has(safeConversationId)) {
    throw new Error('Conversation not found')
  }

  const safeText = String(text || '').trim()
  if (!safeText) {
    throw new Error('Message text is required')
  }

  const now = new Date().toISOString()
  const message = {
    id: nextId('msg'),
    conversationId: safeConversationId,
    senderId: String(senderId || '').trim(),
    senderRole: String(senderRole || 'student').trim().toLowerCase(),
    senderName: senderName || 'User',
    text: safeText,
    timestamp: now,
  }

  const items = messagesByConversationId.get(safeConversationId) || []
  items.push(message)
  messagesByConversationId.set(safeConversationId, items)

  const conversation = conversations.get(safeConversationId)
  conversation.updatedAt = now
  conversation.lastMessageAt = now
  conversation.lastMessageText = safeText
  conversations.set(safeConversationId, conversation)

  return message
}

export function getConversationById(conversationId) {
  const safeConversationId = String(conversationId || '').trim()
  return conversations.get(safeConversationId) || null
}

export function getMessagesByConversationId(conversationId) {
  const safeConversationId = String(conversationId || '').trim()
  return messagesByConversationId.get(safeConversationId) || []
}

export function canAccessConversation(conversationId, userId) {
  const conversation = getConversationById(conversationId)
  const safeUserId = String(userId || '').trim()

  if (!conversation || !safeUserId) {
    return false
  }

  return conversation.studentId === safeUserId || conversation.mentorId === safeUserId
}

export function getConversationsForUser({ userId, role }) {
  const safeUserId = String(userId || '').trim()
  const safeRole = String(role || '').trim().toLowerCase()

  if (!safeUserId || (safeRole !== 'student' && safeRole !== 'mentor')) {
    return []
  }

  return Array.from(conversations.values())
    .filter((conversation) => (
      safeRole === 'student'
        ? conversation.studentId === safeUserId
        : conversation.mentorId === safeUserId
    ))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getStudentsForMentorId(mentorId) {
  const safeMentorId = String(mentorId || '').trim()
  if (!safeMentorId) return []

  const uniqueStudents = new Map()
  Array.from(conversations.values())
    .filter((conversation) => conversation.mentorId === safeMentorId)
    .forEach((conversation) => {
      if (!uniqueStudents.has(conversation.studentId)) {
        uniqueStudents.set(conversation.studentId, {
          id: conversation.studentId,
          name: conversation.studentName,
          email: conversation.studentEmail,
          imageUrl: conversation.studentImageUrl,
        })
      }
    })

  return Array.from(uniqueStudents.values())
}

export { normalizeSubject, toSubjectArray, mentorMatchesSubject }
