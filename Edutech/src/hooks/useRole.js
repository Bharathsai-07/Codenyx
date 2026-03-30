import { useUser } from '@clerk/clerk-react'

/**
 * Returns the user's role from Clerk publicMetadata.
 * Roles can ONLY be set from the Clerk Dashboard by the admin.
 * 
 * To set a role:
 * 1. Go to https://dashboard.clerk.com
 * 2. Navigate to "Users" → Select a user
 * 3. Scroll to "Public metadata"
 * 4. Set:  { "role": "admin" }   or   { "role": "mentor" }
 * 
 * If no role is set, the user defaults to "student".
 * This metadata CANNOT be changed from the website - only from the Clerk Dashboard.
 */
export function useRole() {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded || !isSignedIn) {
    return { role: null, isLoaded, isSignedIn }
  }

  const metadata = user.publicMetadata || {}
  const role = (metadata.role || 'student').toLowerCase()

  return {
    role,
    isLoaded,
    isSignedIn,
    isAdmin: role === 'admin',
    isMentor: role === 'mentor',
    isStudent: role === 'student',
    userName: user.fullName || user.firstName || 'User',
    userImage: user.imageUrl,
  }
}
