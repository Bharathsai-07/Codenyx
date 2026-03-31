import { Router } from 'express'
import { getClerkClient, requireClerkAuth } from '../middleware/adminAuth.js'
import { activeUsers } from '../state/realtimeState.js'
import { Conversation } from '../models/Conversation.js'

const router = Router()

function toSafeRole(rawRole) {
  const role = String(rawRole || 'student').toLowerCase()
  return role === 'admin' || role === 'mentor' ? role : 'student'
}

function normalizeSubject(value) {
  return String(value || '').trim().toLowerCase()
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

function toDisplayName(user) {
  return user.fullName || user.firstName || user.username || 'User'
}

function toPrimaryEmail(user) {
  const primaryEmailId = user.primaryEmailAddressId
  const emailObj = user.emailAddresses?.find((email) => email.id === primaryEmailId)
    || user.emailAddresses?.[0]

  return (emailObj?.emailAddress || '').trim().toLowerCase()
}

function toSafeUser(user) {
  const email = toPrimaryEmail(user)
  const role = toSafeRole(user.publicMetadata?.role)
  const mentorSubjects = toSubjectArray(user.publicMetadata)

  return {
    id: user.id,
    name: toDisplayName(user),
    email,
    role,
    mentorSubjects,
    imageUrl: user.imageUrl,
    isOnline: email ? activeUsers.has(email) : false,
  }
}

router.get('/mentors', requireClerkAuth, async (req, res) => {
  try {
    const requestedSubject = normalizeSubject(req.query?.subject)
    const clerkClient = getClerkClient(String(process.env.CLERK_SECRET_KEY || '').trim())
    const clerkUsers = await clerkClient.users.getUserList({ limit: 500 })
    const clerkUsersList = Array.isArray(clerkUsers?.data)
      ? clerkUsers.data
      : Array.isArray(clerkUsers)
        ? clerkUsers
        : []

    let mentors = clerkUsersList
      .map((user) => toSafeUser(user))
      .filter((user) => user.role === 'mentor')

    if (requestedSubject) {
      mentors = mentors.filter((mentor) => mentor.mentorSubjects.includes(requestedSubject))
    }

    return res.status(200).json({
      ok: true,
      mentors,
    })
  } catch (error) {
    const message = error?.message || 'Failed to load mentors'
    return res.status(500).json({
      ok: false,
      message,
      error: message,
    })
  }
})

router.get('/mentor/students', requireClerkAuth, async (req, res) => {
  try {
    const currentUserId = String(req.authUser?.id || '').trim()

    const clerkClient = getClerkClient(String(process.env.CLERK_SECRET_KEY || '').trim())
    const clerkUsers = await clerkClient.users.getUserList({ limit: 500 })
    const clerkUsersList = Array.isArray(clerkUsers?.data)
      ? clerkUsers.data
      : Array.isArray(clerkUsers)
        ? clerkUsers
        : []

    const users = clerkUsersList.map((user) => toSafeUser(user))
    const mentors = users.filter((user) => user.role === 'mentor')
    const students = users.filter((user) => user.role === 'student')

    const conversations = await Conversation.find({ mentorId: currentUserId }).lean()
    const uniqueStudentIds = Array.from(new Set(conversations.map((conversation) => conversation.studentId)))

    const assignedStudents = uniqueStudentIds
      .map((studentId) => students.find((student) => student.id === studentId))
      .filter(Boolean)

    return res.status(200).json({
      ok: true,
      students: assignedStudents,
      totals: {
        assignedStudents: assignedStudents.length,
        totalStudents: students.length,
        totalMentors: mentors.length,
      },
    })
  } catch (error) {
    const message = error?.message || 'Failed to load assigned students'
    return res.status(500).json({
      ok: false,
      message,
      error: message,
    })
  }
})

export default router
