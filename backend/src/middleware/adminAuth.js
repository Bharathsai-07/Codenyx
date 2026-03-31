import { createClerkClient, verifyToken } from '@clerk/backend'

let cachedClient = null
let cachedClientKey = ''

const defaultAuthorizedParties = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]

function getClerkSecretKey() {
  return String(process.env.CLERK_SECRET_KEY || '').trim()
}

function getAuthorizedParties() {
  const configuredAuthorizedParties = String(process.env.CLERK_AUTHORIZED_PARTIES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return configuredAuthorizedParties.length > 0
    ? configuredAuthorizedParties
    : defaultAuthorizedParties
}

export function getClerkClient(secretKey) {
  if (!cachedClient || cachedClientKey !== secretKey) {
    cachedClient = createClerkClient({ secretKey })
    cachedClientKey = secretKey
  }

  return cachedClient
}

function getBearerToken(authorizationHeader = '') {
  if (!authorizationHeader.toLowerCase().startsWith('bearer ')) {
    return ''
  }
  return authorizationHeader.slice(7).trim()
}

export async function requireClerkAuth(req, res, next) {
  const clerkSecretKey = getClerkSecretKey()

  if (!clerkSecretKey) {
    return res.status(500).json({
      ok: false,
      message: 'CLERK_SECRET_KEY is not configured on backend',
    })
  }

  const token = getBearerToken(req.headers.authorization)
  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Missing bearer token',
    })
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: clerkSecretKey,
      authorizedParties: getAuthorizedParties(),
    })
    const userId = payload?.sub

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid authentication token',
      })
    }

    const clerkClient = getClerkClient(clerkSecretKey)
    const user = await clerkClient.users.getUser(userId)
    const role = String(user?.publicMetadata?.role || 'student').toLowerCase()

    req.authUser = user
    req.authRole = role
    return next()
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: `Unauthorized: ${error?.message || 'Invalid token'}`,
    })
  }
}

export async function requireAdminFromClerk(req, res, next) {
  const clerkSecretKey = getClerkSecretKey()

  if (!clerkSecretKey) {
    return res.status(500).json({
      ok: false,
      message: 'CLERK_SECRET_KEY is not configured on backend',
    })
  }

  const token = getBearerToken(req.headers.authorization)
  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Missing bearer token',
    })
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: clerkSecretKey,
      authorizedParties: getAuthorizedParties(),
    })
    const userId = payload?.sub

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid authentication token',
      })
    }

    const clerkClient = getClerkClient(clerkSecretKey)
    const user = await clerkClient.users.getUser(userId)
    const role = String(user?.publicMetadata?.role || 'student').toLowerCase()

    if (role !== 'admin') {
      return res.status(403).json({
        ok: false,
        message: 'Admin access required',
      })
    }

    req.authUser = user
    req.authRole = role
    return next()
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: `Unauthorized: ${error?.message || 'Invalid token'}`,
    })
  }
}
