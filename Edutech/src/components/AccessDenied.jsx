import { useAuth } from '@clerk/clerk-react'
import { useRole } from '../hooks/useRole'
import { useNavigate } from 'react-router-dom'
import { useUiText } from '../translations'

export default function AccessDenied() {
  const { signOut } = useAuth()
  const { role } = useRole()
  const navigate = useNavigate()
  const { t } = useUiText()

  return (
    <div className="access-denied-page">
      <div className="access-denied-card glass-card animate-fade-in">
        <div className="access-denied-icon">🚫</div>
        <h1>{t('accessDeniedTitle')}</h1>
        <p className="access-denied-message">
          {t('accessDeniedLine1')} <span className="role-highlight">{role || t('student')}</span>. 
          {t('accessDeniedLine2')}
        </p>
        <p className="access-denied-sub">
          {t('accessDeniedSub')}
        </p>
        <div className="access-denied-actions">
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            {t('goToDashboard')}
          </button>
          <button className="btn btn-outline" onClick={() => signOut()}>
            {t('signOut')}
          </button>
        </div>
      </div>
    </div>
  )
}
