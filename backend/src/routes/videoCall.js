import express from 'express'
import { VideoCall } from '../models/VideoCall.js'

const router = express.Router()

// Get recent calls
router.get('/calls', async (_req, res) => {
  try {
    const calls = await VideoCall.find()
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(calls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get calls for a specific user
router.get('/calls/user/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const calls = await VideoCall.find({
      $or: [{ initiatorId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20)

    res.json(calls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get call history with duration
router.get('/calls/stats/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const stats = await VideoCall.aggregate([
      {
        $match: {
          $or: [{ initiatorId: userId }, { receiverId: userId }],
          status: 'ended',
        },
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
        },
      },
    ])

    res.json(stats[0] || { totalCalls: 0, totalDuration: 0, avgDuration: 0 })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Log call metadata (for testing/monitoring)
router.post('/calls/log', async (req, res) => {
  const { initiatorId, initiatorRole, receiverId, receiverRole, callType, duration } = req.body

  try {
    const call = await VideoCall.create({
      initiatorId,
      initiatorRole,
      receiverId,
      receiverRole,
      status: 'ended',
      startTime: new Date(Date.now() - duration * 1000),
      endTime: new Date(),
      duration,
      callType,
    })

    res.json(call)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
