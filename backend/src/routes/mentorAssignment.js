import mongoose from 'mongoose'
import { Router } from 'express'
import { getClerkClient, requireClerkAuth } from '../middleware/adminAuth.js'
import { StudentMentorProfile } from '../models/StudentMentorProfile.js'
import { MentorProfile } from '../models/MentorProfile.js'

const router = Router()

function normalizeSubject(value) {
  return String(value || '').trim().toLowerCase()
}

function toSubjectArray(rawMetadata) {
  const metadata = rawMetadata || {}
  const raw = metadata.mentorSubjects || metadata.subjects || metadata.subject || metadata.subjectExpertise || []

  if (Array.isArray(raw)) {
    return raw.map((entry) => normalizeSubject(entry)).filter(Boolean)
  }

  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((entry) => normalizeSubject(entry))
      .filter(Boolean)
  }

  return []
}

function toSafeRole(rawRole) {
  const role = String(rawRole || 'student').trim().toLowerCase()
  return role === 'mentor' || role === 'admin' ? role : 'student'
}

function toDisplayName(user) {
  return user?.fullName || user?.firstName || user?.username || 'User'
}

function toPrimaryEmail(user) {
  const primaryEmailId = user?.primaryEmailAddressId
  const emailObj = user?.emailAddresses?.find((item) => item.id === primaryEmailId)
    || user?.emailAddresses?.[0]
  return String(emailObj?.emailAddress || '').trim().toLowerCase()
}

async function chooseAutoMentorForSubject(clerkClient, subject) {
  const clerkUsers = await clerkClient.users.getUserList({ limit: 500 })
  const clerkUsersList = Array.isArray(clerkUsers?.data)
    ? clerkUsers.data
    : Array.isArray(clerkUsers)
      ? clerkUsers
      : []

  const eligibleMentors = clerkUsersList.filter((user) => {
    const role = toSafeRole(user?.publicMetadata?.role)
    if (role !== 'mentor') return false

    const subjects = toSubjectArray(user?.publicMetadata)
    return subjects.includes(subject)
  })

  if (eligibleMentors.length === 0) {
    return null
  }

  const mentorIds = eligibleMentors.map((user) => user.id)
  const mentorProfiles = await MentorProfile.find({ userId: { $in: mentorIds } }).lean()
  const profileMap = new Map(mentorProfiles.map((profile) => [profile.userId, profile]))

  eligibleMentors.sort((a, b) => {
    const countA = (profileMap.get(a.id)?.students || []).length
    const countB = (profileMap.get(b.id)?.students || []).length
    if (countA !== countB) return countA - countB
    return String(a.id).localeCompare(String(b.id))
  })

  return eligibleMentors[0]
}

router.post('/assign-mentor', requireClerkAuth, async (req, res) => {
  console.log('[assign-mentor] API hit')
  console.log('[assign-mentor] payload:', req.body)

  const studentId = String(req.body?.studentId || '').trim()
  const requestedMentorId = String(req.body?.mentorId || '').trim()
  const subject = normalizeSubject(req.body?.subject)

  if (!studentId || !subject) {
    return res.status(400).json({
      ok: false,
      message: 'studentId and subject are required',
    })
  }

  const clerkClient = getClerkClient(String(process.env.CLERK_SECRET_KEY || '').trim())

  try {
    const studentUser = await clerkClient.users.getUser(studentId)
    let mentorUser = null

    if (requestedMentorId) {
      mentorUser = await clerkClient.users.getUser(requestedMentorId)
    } else {
      mentorUser = await chooseAutoMentorForSubject(clerkClient, subject)
    }

    if (!studentUser) {
      return res.status(404).json({ ok: false, message: 'Student not found' })
    }

    if (!mentorUser) {
      return res.status(404).json({ ok: false, message: 'Mentor not found' })
    }

    const mentorId = String(mentorUser.id || '').trim()
    const mentorRole = toSafeRole(mentorUser?.publicMetadata?.role)
    if (mentorRole !== 'mentor') {
      return res.status(400).json({ ok: false, message: 'Provided mentorId does not belong to a mentor user' })
    }

    const metadataSubjects = toSubjectArray(mentorUser?.publicMetadata)

    const session = await mongoose.startSession()
    let updatedStudent = null

    try {
      await session.withTransaction(async () => {
        let mentorProfile = await MentorProfile.findOne({ userId: mentorId }).session(session)

        if (!mentorProfile) {
          mentorProfile = await MentorProfile.create([
            {
              userId: mentorId,
              subjects: metadataSubjects,
              students: [],
            },
          ], { session }).then((docs) => docs[0])
        }

        if (metadataSubjects.length > 0) {
          mentorProfile.subjects = Array.from(new Set([...mentorProfile.subjects, ...metadataSubjects]))
        }

        const mentorSubjects = (mentorProfile.subjects || []).map((entry) => normalizeSubject(entry)).filter(Boolean)
        if (!mentorSubjects.includes(subject)) {
          throw new Error(`Mentor does not teach subject: ${subject}`)
        }

        const existingStudent = await StudentMentorProfile.findOne({ userId: studentId }).session(session)
        const existingMentorMapping = (existingStudent?.mentors || [])
          .some((item) => item.mentorId === mentorId && normalizeSubject(item.subject) === subject)

        if (existingMentorMapping) {
          throw new Error('Same mentor already assigned for this subject')
        }

        updatedStudent = await StudentMentorProfile.findOneAndUpdate(
          { userId: studentId },
          {
            $setOnInsert: { userId: studentId },
            $addToSet: {
              mentors: {
                subject,
                mentorId,
              },
            },
          },
          { upsert: true, new: true, session },
        )

        await MentorProfile.findOneAndUpdate(
          { userId: mentorId },
          {
            $setOnInsert: {
              userId: mentorId,
              subjects: mentorSubjects,
            },
            $addToSet: {
              students: studentId,
              subjects: subject,
            },
          },
          { upsert: true, new: true, session },
        )

        console.log('[assign-mentor] DB update success', {
          studentId,
          mentorId,
          subject,
        })
      })
    } finally {
      await session.endSession()
    }

    if (!updatedStudent) {
      return res.status(500).json({ ok: false, message: 'Assignment failed' })
    }

    return res.status(200).json({
      ok: true,
      message: 'Mentor assigned successfully',
      mentorId: mentorUser.id,
      student: updatedStudent,
    })
  } catch (error) {
    const message = error?.message || 'Failed to assign mentor'
    const statusCode = message.includes('already assigned') || message.includes('does not teach') ? 400 : 500

    console.error('[assign-mentor] error:', message)
    return res.status(statusCode).json({ ok: false, message, error: message })
  }
})

router.get('/student/:id/mentors', requireClerkAuth, async (req, res) => {
  const studentId = String(req.params.id || '').trim()

  if (!studentId) {
    return res.status(400).json({ ok: false, message: 'Student id is required' })
  }

  try {
    const studentProfile = await StudentMentorProfile.findOne({ userId: studentId }).lean()

    if (!studentProfile) {
      return res.status(200).json({ ok: true, studentId, mentors: [] })
    }

    const mentorIds = Array.from(new Set((studentProfile.mentors || []).map((entry) => entry.mentorId)))
    const clerkClient = getClerkClient(String(process.env.CLERK_SECRET_KEY || '').trim())

    const mentorUsers = await Promise.all(
      mentorIds.map(async (mentorId) => {
        try {
          return await clerkClient.users.getUser(mentorId)
        } catch {
          return null
        }
      }),
    )

    const mentorMap = new Map(
      mentorUsers
        .filter(Boolean)
        .map((user) => [
          user.id,
          {
            id: user.id,
            name: user.fullName || user.firstName || user.username || 'Mentor',
            role: toSafeRole(user.publicMetadata?.role),
          },
        ]),
    )

    const mentors = (studentProfile.mentors || []).map((entry) => ({
      subject: entry.subject,
      mentorId: entry.mentorId,
      mentor: mentorMap.get(entry.mentorId) || { id: entry.mentorId, name: 'Mentor', role: 'mentor' },
    }))

    return res.status(200).json({
      ok: true,
      studentId,
      mentors,
    })
  } catch (error) {
    const message = error?.message || 'Failed to load student mentors'
    console.error('[student/:id/mentors] error:', message)
    return res.status(500).json({ ok: false, message, error: message })
  }
})

router.get('/mentor/:id/students', requireClerkAuth, async (req, res) => {
  const mentorId = String(req.params.id || '').trim()

  if (!mentorId) {
    return res.status(400).json({ ok: false, message: 'Mentor id is required' })
  }

  try {
    const mentorProfile = await MentorProfile.findOne({ userId: mentorId }).lean()
    if (!mentorProfile) {
      return res.status(200).json({ ok: true, mentorId, students: [] })
    }

    const studentIds = Array.from(new Set((mentorProfile.students || []).filter(Boolean)))
    if (studentIds.length === 0) {
      return res.status(200).json({ ok: true, mentorId, students: [] })
    }

    const clerkClient = getClerkClient(String(process.env.CLERK_SECRET_KEY || '').trim())
    const studentUsers = await Promise.all(
      studentIds.map(async (studentId) => {
        try {
          return await clerkClient.users.getUser(studentId)
        } catch {
          return null
        }
      }),
    )

    const students = studentUsers
      .filter(Boolean)
      .map((user) => ({
        id: user.id,
        name: toDisplayName(user),
        email: toPrimaryEmail(user),
        role: toSafeRole(user.publicMetadata?.role),
      }))

    return res.status(200).json({
      ok: true,
      mentorId,
      students,
    })
  } catch (error) {
    const message = error?.message || 'Failed to load mentor students'
    console.error('[mentor/:id/students] error:', message)
    return res.status(500).json({ ok: false, message, error: message })
  }
})

export default router
