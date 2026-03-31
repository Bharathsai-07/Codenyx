import { SignIn, useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { useUiText } from '../translations'

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { t } = useUiText()

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="login-container">
        {/* Left: Branding panel */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-logo">
              {/* <div className="brand-logo-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="url(#grad)" />
                  <path d="M9 16L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                      <stop stopColor="#6366f1"/>
                      <stop offset="1" stopColor="#10b981"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div> */}
              <h1 className="brand-name">SmartLearn</h1>
            </div>

            <h2 className="brand-headline">Your journey to<br/><span className="gradient-text">excellence</span> starts here.</h2>
            <p className="brand-description">
              Connect with expert mentors, track your progress, and learn at your own pace with personalized guidance.
            </p>

            <div className="role-cards">
              <div className="role-card">
                {/* <span className="role-icon">🧑‍🎓</span> */}
                <div>
                  <h4>Student</h4>
                  <p>Learn, practice & grow</p>
                </div>
              </div>
              <div className="role-card">
                {/* <span className="role-icon">👨</span> */}
                <div>
                  <h4>Mentor</h4>
                  <p>Guide & track students</p>
                </div>
              </div>
              <div className="role-card">
                {/* <span className="role-icon"></span> */}
                <div>
                  <h4>Admin</h4>
                  <p>Manage the platform</p>
                </div>
              </div>
            </div>

            <div className="brand-stats">
              <div className="brand-stat">
                <span className="brand-stat-value">10K+</span>
                <span className="brand-stat-label">Students</span>
              </div>
              <div className="brand-stat-divider"></div>
              <div className="brand-stat">
                <span className="brand-stat-value">500+</span>
                <span className="brand-stat-label">Mentors</span>
              </div>
              <div className="brand-stat-divider"></div>
              <div className="brand-stat">
                <span className="brand-stat-value">98%</span>
                <span className="brand-stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Clerk Sign-In */}
        <div className="login-form-area">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h3>{t('loginWelcomeBack')}</h3>
              <p>{t('loginSignInSub')}</p>
            </div>
            <div className="clerk-container">
              <SignIn
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: { width: '100%' },
                    card: { background: 'transparent', boxShadow: 'none', border: 'none', width: '100%' },
                    headerTitle: { display: 'none' },
                    headerSubtitle: { display: 'none' },
                    socialButtonsBlockButton: {
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc', borderRadius: '10px', padding: '12px', transition: 'all 0.2s ease',
                    },
                    socialButtonsBlockButtonText: { color: '#f8fafc' },
                    dividerLine: { background: 'rgba(255,255,255,0.1)' },
                    dividerText: { color: '#94a3b8' },
                    formFieldLabel: { color: '#94a3b8' },
                    formFieldInput: {
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc', borderRadius: '10px', padding: '12px 16px',
                    },
                    formButtonPrimary: {
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: '600',
                    },
                    footerActionLink: { color: '#6366f1' },
                    footerActionText: { color: '#94a3b8' },
                    identityPreviewEditButton: { color: '#6366f1' },
                    formFieldInputShowPasswordButton: { color: '#94a3b8' },
                    otpCodeFieldInput: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                    formResendCodeLink: { color: '#6366f1' },
                    alert: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' },
                    identityPreview: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' },
                    identityPreviewText: { color: '#f8fafc' },
                  },
                }}
              />
            </div>
            <p className="login-note">
              {t('roleAssignedNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
