import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { addMentorRequest, addMentorRequestToApi } from '../services/mentorRequestService'

export default function MentorshipApplicationModal({ isOpen, onClose }) {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [mentorSubmitted, setMentorSubmitted] = useState(false)
  const [mentorForm, setMentorForm] = useState({
    name: '',
    email: '',
    clerkId: '',
    subject: '',
    experience: '',
    reason: '',
  })

  useEffect(() => {
    if (!isOpen || !user) return

    setMentorForm((prev) => ({
      ...prev,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.name,
      email: user.primaryEmailAddress?.emailAddress || prev.email,
      clerkId: user.id,
    }))
  }, [isOpen, user])

  const resetForm = () => {
    setMentorSubmitted(false)
    setMentorForm({
      name: '',
      email: '',
      clerkId: '',
      subject: '',
      experience: '',
      reason: '',
    })
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const handleMentorSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = await getToken({ skipCache: true })
      if (token) {
        await addMentorRequestToApi(mentorForm, token)
      } else {
        addMentorRequest(mentorForm)
      }
    } catch {
      addMentorRequest(mentorForm)
    }

    setMentorSubmitted(true)

    setTimeout(() => {
      handleClose()
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between align-center" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Apply for Mentorship</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        {mentorSubmitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>Application Submitted!</h3>
            <p style={{ marginTop: '0.5rem' }}>Our admin will review your application and assign the mentor role if approved.</p>
          </div>
        ) : (
          <form onSubmit={handleMentorSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={mentorForm.name}
                onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                value={mentorForm.email}
                onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Expertise *</label>
              <select
                className="form-input"
                required
                value={mentorForm.subject}
                onChange={(e) => setMentorForm({ ...mentorForm, subject: e.target.value })}
              >
                <option value="">Select a subject</option>
                <option value="mathematics">Mathematics</option>
                <option value="english">English</option>
                <option value="science">Science</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                required
                value={mentorForm.experience}
                onChange={(e) => setMentorForm({ ...mentorForm, experience: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Why do you want to mentor? *</label>
              <textarea
                className="form-input"
                rows="3"
                required
                style={{ resize: 'vertical' }}
                value={mentorForm.reason}
                onChange={(e) => setMentorForm({ ...mentorForm, reason: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Application</button>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.75rem', textAlign: 'center' }}>
              After approval, the admin will assign you the Mentor role.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
