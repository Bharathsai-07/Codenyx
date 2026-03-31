import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getLocaleForLanguage, useUiText } from '../translations'
import { getMentorRequests, getMentorRequestsFromApi, updateMentorRequest, updateMentorRequestStatusInApi } from '../services/mentorRequestService'
import { getAdminUsers, updateAdminUserRole } from '../services/adminService'

export default function AdminMentorRequestsPage() {
  const { t, language } = useUiText()
  const { getToken } = useAuth()
  const [mentorRequests, setMentorRequests] = useState([])
  const [userIdByEmail, setUserIdByEmail] = useState({})
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const refreshMentorRequests = async () => {
    try {
      const token = await getToken({ skipCache: true })
      if (!token) {
        setMentorRequests(getMentorRequests())
        return
      }

      const requests = await getMentorRequestsFromApi(token)
      setMentorRequests(requests)
    } catch {
      setMentorRequests(getMentorRequests())
    }
  }

  const loadAdminUsersLookup = async () => {
    const token = await getToken({ skipCache: true })
    if (!token) throw new Error('Unable to authenticate admin actions')

    const data = await getAdminUsers(token)
    const emailMap = {}

    ;(data.users || []).forEach((user) => {
      const email = String(user.email || '').trim().toLowerCase()
      if (email) {
        emailMap[email] = user.id
      }
    })

    setUserIdByEmail(emailMap)
  }

  useEffect(() => {
    refreshMentorRequests().catch(() => {
      setMentorRequests(getMentorRequests())
    })
    loadAdminUsersLookup().catch(() => {
      setActionMessage('Unable to load user lookup right now. You can still refresh and try again.')
    })
  }, [getToken])

  const handleMakeMentor = async (request) => {
    const clerkId = String(request.clerkId || '').trim()
    const emailKey = String(request.email || '').trim().toLowerCase()
    const resolvedUserId = clerkId || userIdByEmail[emailKey]

    if (!resolvedUserId) {
      setActionMessage(`Cannot find user id for ${request.email || 'this applicant'}.`)
      return
    }

    setActionLoadingId(request.id)
    setActionMessage('')

    try {
      const token = await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Unable to authenticate admin action')
      }

      await updateAdminUserRole(token, resolvedUserId, 'mentor')
      const updates = {
        status: 'approved',
        clerkId: resolvedUserId,
        approvedAt: new Date().toISOString(),
      }

      try {
        await updateMentorRequestStatusInApi(request.id, updates, token)
      } catch {
        updateMentorRequest(request.id, updates)
      }

      await refreshMentorRequests()
      setActionMessage(`${request.name || 'Applicant'} is now a mentor.`)
    } catch (error) {
      setActionMessage(error.message || 'Failed to make mentor')
    } finally {
      setActionLoadingId('')
    }
  }

  return (
    <div className="page animate-fade-in">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{t('navMentorRequests')}</h1>
          <p style={{ color: 'var(--text-dim)' }}>View mentor application details submitted by users.</p>
          {actionMessage && (
            <p style={{ color: 'var(--text-main)', fontSize: '0.8rem', marginTop: '0.35rem' }}>{actionMessage}</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={refreshMentorRequests}>Refresh Requests</button>
      </header>

      <div className="glass-card">
        {mentorRequests.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No mentor requests yet.</p>
        ) : (
          mentorRequests.map((req) => (
            <div
              key={req.id}
              style={{
                borderBottom: '1px solid var(--surface-border)',
                padding: '1rem 0',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem' }}>{req.name || 'N/A'}</p>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)' }}>{req.email || 'N/A'}</p>
              </div>

              <p style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Subject:</strong>{' '}
                <span style={{ color: 'var(--text-main)' }}>{req.subject || 'N/A'}</span>
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Years of Experience:</strong>{' '}
                <span style={{ color: 'var(--text-main)' }}>{req.experience || 'N/A'}</span>
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Reason:</strong>{' '}
                <span style={{ color: 'var(--text-main)' }}>{req.reason || 'N/A'}</span>
              </p>
              <p style={{ fontSize: '0.75rem', marginBottom: '0.6rem' }}>
                Applied on {new Date(req.createdAt).toLocaleString(getLocaleForLanguage(language))}
              </p>

              <div className="flex align-center" style={{ gap: '0.6rem' }}>
                <span
                  className={`badge ${req.status === 'approved' ? 'badge-success' : 'badge-warning'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {req.status || 'pending'}
                </span>
                {req.status !== 'approved' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleMakeMentor(req)}
                    disabled={actionLoadingId === req.id}
                  >
                    {actionLoadingId === req.id ? 'Updating...' : 'Make Mentor'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Approved {req.approvedAt ? `on ${new Date(req.approvedAt).toLocaleString(getLocaleForLanguage(language))}` : ''}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
