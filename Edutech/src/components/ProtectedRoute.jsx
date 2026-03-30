import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import { useUiText } from '../translations'

/**
 * ProtectedRoute: Guards routes based on authentication and role.
 * - If not signed in → redirects to /login
 * - If signed in but wrong role → shows AccessDenied
 * - allowedRoles: array of roles that can view this route (e.g. ['admin', 'mentor'])
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isSignedIn, isLoaded } = useAuth()
  const { role } = useRole()
  const { t } = useUiText()

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>{t('loading')}</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  // If allowedRoles is empty, any authenticated user can access
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />
  }

  return children
}
