import { Router } from 'express'
import { requireAdminFromClerk, getClerkClient } from '../middleware/adminAuth.js'
import { activeUsers } from '../state/realtimeState.js'

const router = Router()

function toSafeRole(rawRole) {
  const role = String(rawRole || 'student').toLowerCase()
  return role === 'admin' || role === 'mentor' ? role : 'student'
}

function isSupportedRole(role) {
  return role === 'student' || role === 'mentor' || role === 'admin'
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

router.get('/users', requireAdminFromClerk, async (req, res) => {
  try {
    const rawLimit = Number(req.query.limit)
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 500)
      : 100

    const clerkClient = getClerkClient(String(process.env.CLERK_SECRET_KEY || '').trim())
    const clerkUsers = await clerkClient.users.getUserList({ limit })
    const clerkUsersList = Array.isArray(clerkUsers?.data)
      ? clerkUsers.data
      : Array.isArray(clerkUsers)
        ? clerkUsers
        : []

    const users = clerkUsersList.map((user) => {
      const email = toPrimaryEmail(user)
      const role = toSafeRole(user.publicMetadata?.role)

      return {
        id: user.id,
        name: toDisplayName(user),
        email,
        role,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        isOnline: email ? activeUsers.has(email) : false,
      }
    })

    const totalUsers = users.length
    const activeMentors = users.filter((user) => user.role === 'mentor').length
    const onlineUsers = users.filter((user) => user.isOnline).length

    return res.status(200).json({
      ok: true,
      users,
      totals: {
        totalUsers,
        activeMentors,
        onlineUsers,
      },
    })
  } catch (error) {
    console.error('[admin/users] Failed to load Clerk users:', error)

    const message = error?.message || 'Failed to load users from Clerk'
    return res.status(500).json({
      ok: false,
      message,
      error: message,
    })
  }
})

router.patch('/users/:userId/role', requireAdminFromClerk, async (req, res) => {
  try {
    const userId = String(req.params.userId || '').trim()
    const requestedRoleRaw = String(req.body?.role || '').trim().toLowerCase()

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: 'User id is required',
      })
    }

    if (!isSupportedRole(requestedRoleRaw)) {
      return res.status(400).json({
        ok: false,
        message: 'Role must be one of: student, mentor, admin',
      })
    }

    const requestedRole = requestedRoleRaw

    const clerkClient = getClerkClient(String(process.env.CLERK_SECRET_KEY || '').trim())

    const targetUser = await clerkClient.users.getUser(userId)
    const existingMetadata = targetUser?.publicMetadata || {}

    const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...existingMetadata,
        role: requestedRole,
      },
    })

    return res.status(200).json({
      ok: true,
      user: {
        id: updatedUser.id,
        role: toSafeRole(updatedUser?.publicMetadata?.role),
      },
      message: `Role updated to ${requestedRole}`,
    })
  } catch (error) {
    console.error('[admin/users/:userId/role] Failed to update role:', error)
    const message = error?.message || 'Failed to update user role'
    return res.status(500).json({
      ok: false,
      message,
      error: message,
    })
  }
})

export default router
