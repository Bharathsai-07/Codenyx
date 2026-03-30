import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { getSelectedLanguage, getTextForLanguage, setSelectedLanguage, useUiText } from '../translations'

const LANGUAGES = [
  { code: 'en', key: 'langEnglish', flag: '🇬🇧' },
  { code: 'hi', key: 'langHindi', flag: '🇮🇳' },
  { code: 'te', key: 'langTelugu', flag: '🇮🇳' },
]

export default function ProfileSettings() {
  const { user } = useUser()
  const { t } = useUiText()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [language, setLanguage] = useState(getSelectedLanguage)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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
                {(user?.publicMetadata?.role || 'student').toUpperCase()}
              </span>
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
