import { useAuth } from '@clerk/clerk-react'
import { useRole } from '../hooks/useRole'
import { useNavigate } from 'react-router-dom'

export default function AccessDenied() {
  const { signOut } = useAuth()
  const { role } = useRole()
  const navigate = useNavigate()

  return (
    <div className="access-denied-page">
      <div className="access-denied-card glass-card animate-fade-in">
        <div className="access-denied-icon">🚫</div>
        <h1>Access Denied</h1>
        <p className="access-denied-message">
          Your current role is <span className="role-highlight">{role || 'student'}</span>. 
          You don't have permission to access this section.
        </p>
        <p className="access-denied-sub">
          Only the platform administrator can change user roles from the Clerk Dashboard. 
          Contact your admin to request elevated access.
        </p>
        <div className="access-denied-actions">
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Go to My Dashboard
          </button>
          <button className="btn btn-outline" onClick={() => signOut()}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
