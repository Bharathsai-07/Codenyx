import { Router } from 'express'
import videoCallRoutes from './videoCall.js'
import adminRoutes from './admin.js'
import usersRoutes from './users.js'
import chatRoutes from './chat.js'
import mentorRequestRoutes from './mentorRequest.js'
import mentorAssignmentRoutes from './mentorAssignment.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  })
})

router.use('/video', videoCallRoutes)
router.use('/admin', adminRoutes)
router.use('/users', usersRoutes)
router.use('/chat', chatRoutes)
router.use('/mentor-requests', mentorRequestRoutes)
router.use('/', mentorAssignmentRoutes)

export default router
