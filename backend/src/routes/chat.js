import { Router } from 'express'
import { getClerkClient, requireClerkAuth } from '../middleware/adminAuth.js'
import { activeUsers } from '../state/realtimeState.js'
import { MentorAssignment } from '../models/MentorAssignment.js'
import { Conversation } from '../models/Conversation.js'
import { ChatMessage } from '../models/ChatMessage.js'
import { getSocketServer } from '../state/socketState.js'

const router = Router()

function toSafeRole(rawRole) {
  const role = String(rawRole || 'student').toLowerCase()
  return role === 'admin' || role === 'mentor' ? role : 'student'
}

function normalizeSubject(value) {
  return String(value || '').trim().toLowerCase()
}

function toDisplayName(user) {
  return user.fullName || user.firstName || user.username || 'User'
}

function toPrimaryEmail(user) {
  const primaryEmailId = user.primaryEmailAddressId
  const emailObj = user.emailAddresses?.find((email) => email.id === primaryEmailId)
    || user.emailAddresses?.[0]

  return (emailObj?.emailAddress || '').trim().toLowerCase()
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
  const normalized = normalizeSubject(subject)
  if (!normalized) return true
  return Array.isArray(mentorSubjects) && mentorSubjects.some((item) => normalizeSubject(item) === normalized)
}

function toSafeUser(user) {
  const email = toPrimaryEmail(user)
  const role = toSafeRole(user.publicMetadata?.role)

  return {
    id: user.id,
    name: toDisplayName(user),
    email,
    role,
    imageUrl: user.imageUrl,
    mentorSubjects: toSubjectArray(user.publicMetadata),
    isOnline: email ? activeUsers.has(email) : false,
  }
}

async function loadSafeUsers() {
  const clerkClient = getClerkClient(String(process.env.CLERK_SECRET_KEY || '').trim())
  const clerkUsers = await clerkClient.users.getUserList({ limit: 500 })
  const clerkUsersList = Array.isArray(clerkUsers?.data)
    ? clerkUsers.data
    : Array.isArray(clerkUsers)
      ? clerkUsers
      : []

  return clerkUsersList.map((user) => toSafeUser(user))
}

function toConversationPayload(conversation, currentRole, usersMap) {
  const isStudent = currentRole === 'student'
  const peerId = isStudent ? conversation.mentorId : conversation.studentId
  const peer = usersMap.get(peerId)
  const peerEmail = peer?.email || ''
  const peerName = peer?.name || (isStudent ? 'Mentor' : 'Student')
  const peerImageUrl = peer?.imageUrl || ''

  return {
    id: String(conversation._id),
    subject: conversation.subject,
    updatedAt: conversation.updatedAt?.toISOString?.() || conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt,
    lastMessageText: conversation.lastMessageText,
    peer: isStudent
      ? {
        id: conversation.mentorId,
        name: peerName,
        email: peerEmail,
        imageUrl: peerImageUrl,
        isOnline: peerEmail ? activeUsers.has(peerEmail) : false,
      }
      : {
        id: conversation.studentId,
        name: peerName,
        email: peerEmail,
        imageUrl: peerImageUrl,
        isOnline: peerEmail ? activeUsers.has(peerEmail) : false,
      },
  }
}

async function getUsersMap() {
  const users = await loadSafeUsers()
  return new Map(users.map((user) => [user.id, user]))
}

async function chooseMentorForSubject({ studentId, subject, requestedMentorId, mentors }) {
  const normalizedSubject = normalizeSubject(subject)
  if (!normalizedSubject) return null

  if (requestedMentorId) {
    const requestedMentor = mentors.find((mentor) => mentor.id === requestedMentorId)
    if (requestedMentor && mentorMatchesSubject(requestedMentor.mentorSubjects, normalizedSubject)) {
      return requestedMentor
    }
  }

  const existingAssignments = await MentorAssignment.find({ studentId, subject: normalizedSubject }).lean()
  if (existingAssignments.length > 0) {
    const existingMentor = mentors.find((mentor) => mentor.id === existingAssignments[0].mentorId)
    if (existingMentor) {
      return existingMentor
    }
  }

  const subjectMentors = mentors.filter((mentor) => mentorMatchesSubject(mentor.mentorSubjects, normalizedSubject))
  if (subjectMentors.length === 0) return null

  const mentorIds = subjectMentors.map((mentor) => mentor.id)
  const assignmentCounts = await MentorAssignment.aggregate([
    { $match: { subject: normalizedSubject, mentorId: { $in: mentorIds } } },
    { $group: { _id: '$mentorId', count: { $sum: 1 } } },
  ])

  const countMap = new Map(assignmentCounts.map((entry) => [entry._id, entry.count]))
  subjectMentors.sort((a, b) => {
    const countA = countMap.get(a.id) || 0
    const countB = countMap.get(b.id) || 0
    if (countA !== countB) return countA - countB
    return a.id.localeCompare(b.id)
  })

  return subjectMentors[0]
}

router.get('/student/assignments', requireClerkAuth, async (req, res) => {
  try {
    if (req.authRole !== 'student') {
      return res.status(403).json({ ok: false, message: 'Only students can access assignments' })
    }

    const studentId = String(req.authUser?.id || '').trim()
    const assignments = await MentorAssignment.find({ studentId }).sort({ subject: 1, createdAt: 1 }).lean()
    const usersMap = await getUsersMap()

    const data = assignments.map((assignment) => {
      const mentor = usersMap.get(assignment.mentorId)
      return {
        id: String(assignment._id),
        subject: assignment.subject,
        mentor: {
          id: assignment.mentorId,
          name: mentor?.name || 'Mentor',
          email: mentor?.email || '',
          imageUrl: mentor?.imageUrl || '',
          isOnline: mentor?.email ? activeUsers.has(mentor.email) : false,
          mentorSubjects: mentor?.mentorSubjects || [],
        },
      }
    })

    return res.status(200).json({ ok: true, assignments: data })
  } catch (error) {
    const message = error?.message || 'Failed to load student assignments'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

router.get('/conversations', requireClerkAuth, async (req, res) => {
  try {
    const currentUserId = String(req.authUser?.id || '').trim()
    const currentRole = String(req.authRole || '').trim().toLowerCase()

    if (currentRole !== 'student' && currentRole !== 'mentor') {
      return res.status(403).json({
        ok: false,
        message: 'Only students and mentors can access conversations',
      })
    }

    const query = currentRole === 'student'
      ? { studentId: currentUserId }
      : { mentorId: currentUserId }

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .lean()
    const usersMap = await getUsersMap()

    return res.status(200).json({
      ok: true,
      conversations: conversations.map((conversation) => toConversationPayload(conversation, currentRole, usersMap)),
    })
  } catch (error) {
    const message = error?.message || 'Failed to load conversations'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

router.get('/messages/:conversationId', requireClerkAuth, async (req, res) => {
  try {
    const conversationId = String(req.params.conversationId || '').trim()
    const currentUserId = String(req.authUser?.id || '').trim()

    if (!conversationId) {
      return res.status(400).json({ ok: false, message: 'conversationId is required' })
    }

    const conversation = await Conversation.findById(conversationId).lean()
    if (!conversation) {
      return res.status(404).json({ ok: false, message: 'Conversation not found' })
    }

    if (conversation.studentId !== currentUserId && conversation.mentorId !== currentUserId) {
      return res.status(403).json({ ok: false, message: 'Access denied for this conversation' })
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean()

    return res.status(200).json({
      ok: true,
      messages: messages.map((message) => ({
        id: String(message._id),
        conversationId: String(message.conversationId),
        senderId: message.senderId,
        senderRole: message.senderRole,
        senderName: message.senderName,
        text: message.text,
        timestamp: message.createdAt,
      })),
    })
  } catch (error) {
    const message = error?.message || 'Failed to load messages'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

router.get('/thread', requireClerkAuth, async (req, res) => {
  try {
    const studentId = String(req.query?.studentId || '').trim()
    const mentorId = String(req.query?.mentorId || '').trim()
    const currentUserId = String(req.authUser?.id || '').trim()

    if (!studentId || !mentorId) {
      return res.status(400).json({ ok: false, message: 'studentId and mentorId are required' })
    }

    if (currentUserId !== studentId && currentUserId !== mentorId) {
      return res.status(403).json({ ok: false, message: 'Access denied for this chat thread' })
    }

    const conversation = await Conversation.findOne({ studentId, mentorId }).lean()
    if (!conversation) {
      return res.status(200).json({ ok: true, messages: [] })
    }

    const messages = await ChatMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean()

    return res.status(200).json({
      ok: true,
      messages: messages.map((message) => ({
        id: String(message._id),
        studentId: message.studentId,
        mentorId: message.mentorId,
        sender: message.senderRole,
        senderId: message.senderId,
        senderName: message.senderName,
        text: message.text,
        timestamp: message.createdAt,
      })),
    })
  } catch (error) {
    const message = error?.message || 'Failed to load chat thread'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

router.post('/messages', requireClerkAuth, async (req, res) => {
  try {
    const currentRole = String(req.authRole || '').trim().toLowerCase()
    const currentUserId = String(req.authUser?.id || '').trim()
    const currentUserName = toDisplayName(req.authUser)
    const currentUserEmail = toPrimaryEmail(req.authUser)
    const currentUserImage = req.authUser?.imageUrl || ''

    const text = String(req.body?.text || '').trim()
    const requestedSubject = normalizeSubject(req.body?.subject)
    const requestedMentorId = String(req.body?.mentorId || '').trim()
    const requestedConversationId = String(req.body?.conversationId || '').trim()

    if (!text) {
      return res.status(400).json({ ok: false, message: 'Message text is required' })
    }

    let conversation = null
    let usersMap = await getUsersMap()

    if (requestedConversationId) {
      conversation = await Conversation.findById(requestedConversationId)
      if (!conversation) {
        return res.status(404).json({ ok: false, message: 'Conversation not found' })
      }

      if (conversation.studentId !== currentUserId && conversation.mentorId !== currentUserId) {
        return res.status(403).json({ ok: false, message: 'Access denied for this conversation' })
      }

      if (currentRole === 'mentor' && conversation.mentorId !== currentUserId) {
        return res.status(403).json({ ok: false, message: 'Mentor can reply only to own conversations' })
      }
    } else if (currentRole === 'student') {
      const subject = normalizeSubject(requestedSubject)
      if (!subject) {
        return res.status(400).json({ ok: false, message: 'Subject is required for student doubts' })
      }

      const users = Array.from(usersMap.values())
      const mentors = users.filter((user) => user.role === 'mentor')

      const selectedMentor = await chooseMentorForSubject({
        studentId: currentUserId,
        subject,
        requestedMentorId,
        mentors,
      })

      if (!selectedMentor) {
        return res.status(404).json({
          ok: false,
          message: requestedSubject
            ? `No mentor available for subject: ${subject}`
            : 'No mentor available',
        })
      }

      await MentorAssignment.findOneAndUpdate(
        { studentId: currentUserId, mentorId: selectedMentor.id, subject },
        { $setOnInsert: { studentId: currentUserId, mentorId: selectedMentor.id, subject } },
        { upsert: true, new: true },
      )

      conversation = await Conversation.findOneAndUpdate(
        { studentId: currentUserId, mentorId: selectedMentor.id },
        {
          $setOnInsert: {
            studentId: currentUserId,
            mentorId: selectedMentor.id,
          },
          $set: {
            subject,
          },
        },
        { upsert: true, new: true },
      )

      usersMap = await getUsersMap()
    } else if (currentRole === 'mentor') {
      return res.status(400).json({
        ok: false,
        message: 'conversationId is required for mentor replies',
      })
    } else {
      return res.status(403).json({ ok: false, message: 'Only students and mentors can chat' })
    }

    const message = await ChatMessage.create({
      conversationId: conversation._id,
      studentId: conversation.studentId,
      mentorId: conversation.mentorId,
      senderId: currentUserId,
      senderRole: currentRole,
      senderName: currentUserName,
      text,
    })

    conversation.lastMessageText = text
    conversation.lastMessageAt = new Date()
    await conversation.save()

    const messagePayload = {
      id: String(message._id),
      conversationId: String(conversation._id),
      senderId: message.senderId,
      senderRole: message.senderRole,
      senderName: message.senderName,
      text: message.text,
      timestamp: message.createdAt,
    }

    const io = getSocketServer()
    if (io) {
      io.to(`conversation:${String(conversation._id)}`).emit('chat-message', {
        conversationId: String(conversation._id),
        message: messagePayload,
      })
      io.to(`conversation:${String(conversation._id)}`).emit('receive-message', {
        id: messagePayload.id,
        studentId: conversation.studentId,
        mentorId: conversation.mentorId,
        sender: messagePayload.senderRole,
        senderId: messagePayload.senderId,
        senderName: messagePayload.senderName,
        text: messagePayload.text,
        timestamp: messagePayload.timestamp,
      })

      io.to(`user:${conversation.studentId}`).emit('conversation-updated', {
        conversationId: String(conversation._id),
      })
      io.to(`user:${conversation.mentorId}`).emit('conversation-updated', {
        conversationId: String(conversation._id),
      })
    }

    const responseRole = currentRole
    const conversationPayload = toConversationPayload(conversation.toObject(), responseRole, usersMap)

    return res.status(200).json({
      ok: true,
      conversation: conversationPayload,
      message: messagePayload,
    })
  } catch (error) {
    const message = error?.message || 'Failed to send message'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

export default router
