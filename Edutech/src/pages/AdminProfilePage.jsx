import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getSelectedLanguage, getTextForLanguage, setSelectedLanguage, useUiText } from '../translations'
import { getAdminUsers, updateAdminUserRole } from '../services/adminService'

const ROLE_OPTIONS = ['student', 'mentor', 'admin']
const LANGUAGES = [
  { code: 'en', key: 'langEnglish', flag: '🇬🇧' },
  { code: 'hi', key: 'langHindi', flag: '🇮🇳' },
  { code: 'te', key: 'langTelugu', flag: '🇮🇳' },
]

export default function AdminProfilePage() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { t } = useUiText()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [language, setLanguage] = useState(getSelectedLanguage)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [pendingRoleByUserId, setPendingRoleByUserId] = useState({})
  const [savingRoleByUserId, setSavingRoleByUserId] = useState({})

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      setLoadingUsers(true)
      setUsersError('')
      try {
        const token = await getToken({ skipCache: true })
        if (!token) throw new Error('Unable to authenticate admin request. Please sign in again.')
        const data = await getAdminUsers(token)
        if (cancelled) return

        const usersList = Array.isArray(data.users) ? data.users : []
        setUsers(usersList)

        const rolesMap = {}
        usersList.forEach((u) => {
          rolesMap[u.id] = u.role || 'student'
        })
        setPendingRoleByUserId(rolesMap)
      } catch (error) {
        if (!cancelled) {
          setUsersError(error.message || 'Failed to load users')
        }
      } finally {
        if (!cancelled) {
          setLoadingUsers(false)
        }
      }
    }

    loadUsers()

    return () => {
      cancelled = true
    }
  }, [getToken])

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      await user.update({ firstName, lastName })
      setSavedProfile(true)
      setTimeout(() => setSavedProfile(false), 3000)
    } catch (error) {
      console.error('Failed to save admin profile:', error)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleRoleUpdate = async (targetUserId) => {
    const nextRole = pendingRoleByUserId[targetUserId]
    if (!nextRole) return

    setSavingRoleByUserId((prev) => ({ ...prev, [targetUserId]: true }))
    setUsersError('')

    try {
      const token = await getToken({ skipCache: true })
      if (!token) throw new Error('Unable to authenticate admin request. Please sign in again.')

      await updateAdminUserRole(token, targetUserId, nextRole)

      setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, role: nextRole } : u)))
    } catch (error) {
      setUsersError(error.message || 'Failed to update role')
    } finally {
      setSavingRoleByUserId((prev) => ({ ...prev, [targetUserId]: false }))
    }
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1>Admin Profile</h1>
        <p>Manage your profile and update platform user roles.</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        <div className="glass-card">
          <div className="flex align-center" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="avatar" style={{ width: '84px', height: '84px' }}>
              <img src={user?.imageUrl} alt="Admin profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h3>{user?.fullName || 'Admin'}</h3>
              <p style={{ fontSize: '0.85rem' }}>{user?.primaryEmailAddress?.emailAddress}</p>
              <span className="badge" style={{ marginTop: '0.45rem', background: 'rgba(239, 68, 68, 0.14)', color: '#fca5a5' }}>
                ADMIN
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('firstName')}</label>
            <input type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">{t('lastName')}</label>
            <input type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input
              type="email"
              className="form-input"
              value={user?.primaryEmailAddress?.emailAddress || ''}
              disabled
              style={{ opacity: 0.55 }}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? t('saving') : savedProfile ? t('saved') : t('saveChanges')}
          </button>

          <div className="glass-card" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.45)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>{t('languagePreferenceTitle')}</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{t('languagePreferenceDesc')}</p>

            <div className="language-grid">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-option ${language === lang.code ? 'language-selected' : ''}`}
                  onClick={() => {
                    setLanguage(lang.code)
                    setSelectedLanguage(lang.code)
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                  <span>{getTextForLanguage(lang.key, language)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '0.5rem' }}>Role Management</h3>
          <p style={{ fontSize: '0.84rem', marginBottom: '1rem' }}>
            Assign user roles directly from admin panel: student, mentor, or admin.
          </p>

          {loadingUsers && <p style={{ color: 'var(--text-dim)' }}>Loading users...</p>}
          {!loadingUsers && usersError && <p style={{ color: '#ef4444', marginBottom: '0.8rem' }}>{usersError}</p>}

          {!loadingUsers && users.length === 0 && <p style={{ color: 'var(--text-dim)' }}>No users available.</p>}

          {!loadingUsers && users.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', maxHeight: '530px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {users.map((u) => {
                const isCurrentUser = u.id === user?.id
                const selectedRole = pendingRoleByUserId[u.id] || u.role || 'student'
                const isSavingRole = Boolean(savingRoleByUserId[u.id])

                return (
                  <div
                    key={u.id}
                    style={{
                      border: '1px solid var(--surface-border)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="flex align-center justify-between" style={{ gap: '0.75rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name} {isCurrentUser ? '(You)' : ''}
                        </p>
                        <p style={{ fontSize: '0.74rem' }}>{u.email || 'No email'}</p>
                      </div>

                      <div className="flex align-center" style={{ gap: '0.5rem' }}>
                        <select
                          className="form-input"
                          style={{ width: '120px', padding: '0.45rem 0.6rem' }}
                          value={selectedRole}
                          onChange={(e) => {
                            const nextRole = e.target.value
                            setPendingRoleByUserId((prev) => ({ ...prev, [u.id]: nextRole }))
                          }}
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>

                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleRoleUpdate(u.id)}
                          disabled={isSavingRole || selectedRole === u.role}
                        >
                          {isSavingRole ? 'Updating...' : 'Update'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
