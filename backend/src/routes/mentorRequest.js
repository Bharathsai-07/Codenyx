import { Router } from 'express'
import { requireAdminFromClerk, requireClerkAuth } from '../middleware/adminAuth.js'
import { MentorRequest } from '../models/MentorRequest.js'

const router = Router()

function toSafeResponse(item) {
  return {
    id: String(item._id),
    clerkId: item.applicantUserId,
    name: item.name,
    email: item.email,
    subject: item.subject,
    experience: item.experience,
    reason: item.reason,
    status: item.status,
    approvedAt: item.approvedAt,
    adminNote: item.adminNote,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

router.post('/', requireClerkAuth, async (req, res) => {
  try {
    const applicantUserId = String(req.authUser?.id || '').trim()
    const name = String(req.body?.name || '').trim()
    const email = String(req.body?.email || '').trim().toLowerCase()
    const subject = String(req.body?.subject || '').trim().toLowerCase()
    const experience = String(req.body?.experience || '').trim()
    const reason = String(req.body?.reason || '').trim()

    if (!applicantUserId || !name || !email || !subject || !reason) {
      return res.status(400).json({
        ok: false,
        message: 'name, email, subject, and reason are required',
      })
    }

    const request = await MentorRequest.create({
      applicantUserId,
      name,
      email,
      subject,
      experience,
      reason,
      status: 'pending',
    })

    return res.status(201).json({
      ok: true,
      request: toSafeResponse(request),
    })
  } catch (error) {
    const message = error?.message || 'Failed to submit mentor request'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

router.get('/my', requireClerkAuth, async (req, res) => {
  try {
    const applicantUserId = String(req.authUser?.id || '').trim()
    if (!applicantUserId) {
      return res.status(400).json({ ok: false, message: 'Applicant user id is missing' })
    }

    const requests = await MentorRequest.find({ applicantUserId })
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      ok: true,
      requests: requests.map((item) => toSafeResponse(item)),
    })
  } catch (error) {
    const message = error?.message || 'Failed to load your mentor requests'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

router.get('/admin', requireAdminFromClerk, async (_req, res) => {
  try {
    const requests = await MentorRequest.find({})
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      ok: true,
      requests: requests.map((item) => toSafeResponse(item)),
    })
  } catch (error) {
    const message = error?.message || 'Failed to load mentor requests'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

router.patch('/:id/status', requireAdminFromClerk, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim()
    const status = String(req.body?.status || '').trim().toLowerCase()
    const adminNote = String(req.body?.adminNote || '').trim()

    if (!id) {
      return res.status(400).json({ ok: false, message: 'Request id is required' })
    }

    if (status !== 'pending' && status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ ok: false, message: 'Invalid status' })
    }

    const updates = {
      status,
      adminNote,
    }

    if (status === 'approved') {
      updates.approvedAt = new Date()
    }

    const updated = await MentorRequest.findByIdAndUpdate(id, updates, { new: true })
    if (!updated) {
      return res.status(404).json({ ok: false, message: 'Mentor request not found' })
    }

    return res.status(200).json({
      ok: true,
      request: toSafeResponse(updated),
    })
  } catch (error) {
    const message = error?.message || 'Failed to update mentor request'
    return res.status(500).json({ ok: false, message, error: message })
  }
})

export default router
