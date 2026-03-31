import { useState } from 'react'
import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getSelectedLanguage, getTextForLanguage, setSelectedLanguage, useUiText } from '../translations'
import { getMentorRequests, getMyMentorRequestsFromApi } from '../services/mentorRequestService'

const LANGUAGES = [
  { code: 'en', key: 'langEnglish', flag: '🇬🇧' },
  { code: 'hi', key: 'langHindi', flag: '🇮🇳' },
  { code: 'te', key: 'langTelugu', flag: '🇮🇳' },
]

export default function ProfileSettings() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { t } = useUiText()

  const role = String(user?.publicMetadata?.role || 'student').toLowerCase()
  const rawMentorSubjects = user?.publicMetadata?.mentorSubjects
    || user?.publicMetadata?.subjects
    || user?.publicMetadata?.subject
    || user?.publicMetadata?.subjectExpertise

  const mentorSubjects = Array.isArray(rawMentorSubjects)
    ? rawMentorSubjects.map((entry) => String(entry || '').trim()).filter(Boolean)
    : typeof rawMentorSubjects === 'string'
      ? rawMentorSubjects.split(',').map((entry) => entry.trim()).filter(Boolean)
      : []

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [language, setLanguage] = useState(getSelectedLanguage)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [latestMentorApplication, setLatestMentorApplication] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadMentorApplication = async () => {
      const userId = String(user?.id || '').trim()
      const email = String(user?.primaryEmailAddress?.emailAddress || '').trim().toLowerCase()

      if (!userId && !email) {
        setLatestMentorApplication(null)
        return
      }

      try {
        const token = await getToken({ skipCache: true })
        if (token) {
          const requests = await getMyMentorRequestsFromApi(token)
          if (!cancelled) {
            setLatestMentorApplication(requests[0] || null)
          }
          return
        }
      } catch {
        // Fallback to local requests below.
      }

      const fallback = getMentorRequests().find((request) => {
        const reqClerkId = String(request.clerkId || '').trim()
        const reqEmail = String(request.email || '').trim().toLowerCase()
        return (userId && reqClerkId === userId) || (email && reqEmail === email)
      }) || null

      if (!cancelled) {
        setLatestMentorApplication(fallback)
      }
    }

    loadMentorApplication()

    return () => {
      cancelled = true
    }
  }, [getToken, user?.id, user?.primaryEmailAddress?.emailAddress])

  const handleSave = async () => {
    setSaving(true)
    try {
      await user.update({ firstName, lastName })
      setSelectedLanguage(language)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to update profile:', err)
    }
    setSaving(false)
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1>{t('profileTitle')}</h1>
        <p>{t('profileSubtitle')}</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        {/* Profile Card */}
        <div className="glass-card">
          <div className="flex align-center" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="avatar" style={{ width: '80px', height: '80px' }}>
              <img src={user?.imageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h3>{user?.fullName || 'User'}</h3>
              <p style={{ fontSize: '0.85rem' }}>{user?.primaryEmailAddress?.emailAddress}</p>
              <span className="badge" style={{ marginTop: '0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
                {role.toUpperCase()}
              </span>
              {role === 'mentor' && (
                <div style={{ marginTop: '0.65rem' }}>
                  {/* <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>Mentor Subjects</p> */}
                  {/* {mentorSubjects.length > 0 ? (
                    <div className="flex" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                      {mentorSubjects.map((subject) => (
                        <span
                          key={subject}
                          className="badge"
                          style={{ background: 'rgba(16,185,129,0.12)', color: 'rgb(5, 150, 105)' }}
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No subject specialization set yet.</p>
                  )} */}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('firstName')}</label>
            <input
              type="text"
              className="form-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('lastName')}</label>
            <input
              type="text"
              className="form-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input
              type="email"
              className="form-input"
              value={user?.primaryEmailAddress?.emailAddress || ''}
              disabled
              style={{ opacity: 0.5 }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{t('emailManagedByClerk')}</span>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : saved ? t('saved') : t('saveChanges')}
          </button>

          {latestMentorApplication && (
            <div className="glass-card" style={{ marginTop: '1rem', padding: '0.9rem', background: 'rgba(255,255,255,0.55)' }}>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>Mentorship Application</p>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600, textTransform: 'capitalize' }}>
                Subject: {latestMentorApplication.subject || 'N/A'}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                Status: {latestMentorApplication.status || 'pending'}
              </p>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>{t('languagePreferenceTitle')}</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {t('languagePreferenceDesc')}
          </p>

          <div className="language-grid">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`language-option ${language === lang.code ? 'language-selected' : ''}`}
                onClick={() => {
                  setLanguage(lang.code)
                  setSelectedLanguage(lang.code)
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                <span>{getTextForLanguage(lang.key, language)}</span>
              </button>
            ))}
          </div>

          <div className="glass-card" style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.03)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>{t('accountSecurityTitle')}</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
              {t('accountSecurityDesc')}
            </p>
            <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => user?.openUserProfile?.()}>
              {t('manageSecurity')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
