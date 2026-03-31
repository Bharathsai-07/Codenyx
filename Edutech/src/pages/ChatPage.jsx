import { useState, useEffect, useRef } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useRole } from '../hooks/useRole'
import { useUiText } from '../translations'
import { getAvailableMentors } from '../services/mentorService'
import { assignMentorToStudent, getMentorStudents, getStudentMentorAssignments, getThreadMessages } from '../services/chatApiService'
import { SUBJECTS } from '../data/subjects'
import socketService from '../services/socketService'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [mentors, setMentors] = useState([])
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [mentorLoadError, setMentorLoadError] = useState('')
  const [studentAssignments, setStudentAssignments] = useState([])
  const [mentorStudents, setMentorStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentsLoadError, setStudentsLoadError] = useState('')
  const [messagesError, setMessagesError] = useState('')
  const [activeThread, setActiveThread] = useState({ studentId: '', mentorId: '' })
  const messagesEndRef = useRef(null)
  const { getToken } = useAuth()
  const { user } = useUser()
  const { userName, role } = useRole()
  const { t } = useUiText()
  const currentUserId = String(user?.id || '').trim()
  const subjectOptions = SUBJECTS.map((subject) => subject.name)

  const normalizeText = (value) => String(value || '').trim().toLowerCase()
  const assignedMentorForSubject = studentAssignments.find(
    (assignment) => normalizeText(assignment.subject) === normalizeText(selectedSubject),
  )?.mentor || null

  const resolvedStudentMentorId = selectedMentorId || assignedMentorForSubject?.id || mentors[0]?.id || ''
  const selectedMentor = mentors.find((mentor) => mentor.id === resolvedStudentMentorId)
    || (assignedMentorForSubject
      ? {
        id: assignedMentorForSubject.id,
        name: assignedMentorForSubject.name,
        imageUrl: '',
        isOnline: false,
      }
      : null)
  const selectedStudent = mentorStudents.find((student) => student.id === selectedStudentId) || null

  const focusStudentAssignment = (assignment) => {
    if (!assignment?.mentor?.id) return

    setSelectedSubject(assignment.subject || '')
    setSelectedMentorId(assignment.mentor.id)
    setActiveThread({
      studentId: currentUserId,
      mentorId: assignment.mentor.id,
    })
  }

  const focusMentorStudentThread = (studentId) => {
    setSelectedStudentId(studentId)
    setActiveThread({
      studentId,
      mentorId: currentUserId,
    })
  }

  const loadAssignments = async () => {
    if (role !== 'student') {
      setStudentAssignments([])
      return
    }

    const token = await getToken({ skipCache: true })
    if (!token) throw new Error('Unable to authenticate assignment fetch.')

    const assignments = await getStudentMentorAssignments(token)
    setStudentAssignments(assignments)
  }

  const loadMentorStudents = async () => {
    if (role !== 'mentor' || !currentUserId) {
      setMentorStudents([])
      return
    }

    const token = await getToken({ skipCache: true })
    if (!token) throw new Error('Unable to authenticate mentor students fetch.')

    const students = await getMentorStudents(token, currentUserId)
    setMentorStudents(students)
  }

  useEffect(() => {
    let cancelled = false

    const loadMentors = async () => {
      if (role !== 'student') return
      setMentorLoadError('')

      try {
        const token = await getToken({ skipCache: true })
        if (!token) throw new Error('Unable to authenticate mentor fetch.')

        const mentorsList = await getAvailableMentors(token, selectedSubject)
        if (cancelled) return

        setMentors(mentorsList)
        setSelectedMentorId((prev) => {
          if (prev && mentorsList.some((mentor) => mentor.id === prev)) return prev
          return mentorsList[0]?.id || ''
        })
      } catch (error) {
        if (!cancelled) {
          setMentorLoadError(error.message || 'Failed to load mentors')
          setMentors([])
          setSelectedMentorId('')
        }
      }
    }

    loadMentors()

    return () => {
      cancelled = true
    }
  }, [getToken, role, selectedSubject])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (role !== 'student') return

      try {
        await loadAssignments()
      } catch (error) {
        if (!cancelled) {
          setMentorLoadError(error.message || 'Failed to load assignments')
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [getToken, role])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (role !== 'mentor') return
      setStudentsLoadError('')

      try {
        await loadMentorStudents()
      } catch (error) {
        if (!cancelled) {
          setStudentsLoadError(error.message || 'Failed to load assigned students')
          setMentorStudents([])
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [currentUserId, getToken, role])

  useEffect(() => {
    if (role !== 'student' || !currentUserId) return

    if (!resolvedStudentMentorId) {
      setActiveThread({ studentId: '', mentorId: '' })
      return
    }

    setActiveThread({
      studentId: currentUserId,
      mentorId: resolvedStudentMentorId,
    })
  }, [currentUserId, resolvedStudentMentorId, role])

  useEffect(() => {
    if (role !== 'mentor' || !currentUserId) return

    if (!selectedStudentId && mentorStudents.length > 0) {
      setSelectedStudentId(mentorStudents[0].id)
      return
    }

    if (selectedStudentId && !mentorStudents.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(mentorStudents[0]?.id || '')
      return
    }

    setActiveThread({
      studentId: selectedStudentId,
      mentorId: currentUserId,
    })
  }, [currentUserId, mentorStudents, role, selectedStudentId])

  useEffect(() => {
    if (!activeThread.studentId || !activeThread.mentorId) {
      setMessages([])
      return
    }

    let cancelled = false

    const loadMessages = async () => {
      setMessagesError('')
      try {
        const token = await getToken({ skipCache: true })
        if (!token) throw new Error('Unable to authenticate messages fetch.')

        const items = await getThreadMessages(token, activeThread.studentId, activeThread.mentorId)
        if (!cancelled) {
          setMessages(items)
        }
      } catch (error) {
        if (!cancelled) {
          setMessagesError(error.message || 'Failed to load messages')
          setMessages([])
        }
      }
    }

    loadMessages()

    return () => {
      cancelled = true
    }
  }, [activeThread.mentorId, activeThread.studentId, getToken])

  useEffect(() => {
    if (!currentUserId || (role !== 'student' && role !== 'mentor')) return

    socketService.connect()
    socketService.registerSocketUser(currentUserId, role)

    const onChatMessage = (message) => {
      if (!message?.studentId || !message?.mentorId) return

      const isActiveThread =
        String(message.studentId) === String(activeThread.studentId)
        && String(message.mentorId) === String(activeThread.mentorId)

      if (!isActiveThread) return

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev
        return [...prev, message]
      })
    }

    const onConversationUpdated = () => {
      if (role === 'student') {
        loadAssignments().catch(() => {})
      } else if (role === 'mentor') {
        loadMentorStudents().catch(() => {})
      }
    }

    socketService.on('onChatMessage', onChatMessage)
    socketService.on('onConversationUpdated', onConversationUpdated)

    return () => {
      socketService.on('onChatMessage', null)
      socketService.on('onConversationUpdated', null)
    }
  }, [activeThread.mentorId, activeThread.studentId, currentUserId, role])

  useEffect(() => {
    if (!activeThread.studentId || !activeThread.mentorId) return undefined

    socketService.joinChatRoom(activeThread.studentId, activeThread.mentorId)
    return () => {
      // Keep socket alive; room switch is handled by next join event.
    }
  }, [activeThread.mentorId, activeThread.studentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    if (role === 'student' && !selectedSubject) {
      setMentorLoadError('Select the subject you are interested in before sending your first question.')
      return
    }

    if (role === 'mentor' && !activeThread.studentId) {
      setStudentsLoadError('Choose a student conversation first to reply.')
      return
    }

    setIsSending(true)
    setMentorLoadError('')
    setStudentsLoadError('')
    setMessagesError('')

    try {
      let mentorIdForMessage = resolvedStudentMentorId

      if (role === 'student') {
        const token = await getToken({ skipCache: true })
        if (!token) throw new Error('Unable to authenticate assignment update.')

        try {
          const assigned = await assignMentorToStudent(token, {
            studentId: currentUserId,
            mentorId: mentorIdForMessage || undefined,
            subject: selectedSubject,
          })

          if (assigned?.mentors?.length > 0) {
            const matched = assigned.mentors.find(
              (entry) => normalizeText(entry.subject) === normalizeText(selectedSubject),
            )
            if (matched?.mentorId) {
              mentorIdForMessage = matched.mentorId
            }
          }
        } catch (assignError) {
          const detail = String(assignError?.message || '').toLowerCase()
          if (!detail.includes('already assigned')) {
            throw assignError
          }
        }

        const refreshedAssignments = await getStudentMentorAssignments(token)
        setStudentAssignments(refreshedAssignments)

        const refreshedMentor = refreshedAssignments.find(
          (entry) => normalizeText(entry.subject) === normalizeText(selectedSubject),
        )?.mentor
        if (refreshedMentor?.id) {
          mentorIdForMessage = refreshedMentor.id
        }

        if (!mentorIdForMessage) {
          throw new Error('No mentor available for selected subject.')
        }

        setSelectedMentorId(mentorIdForMessage)
        setActiveThread({
          studentId: currentUserId,
          mentorId: mentorIdForMessage,
        })
      }

      const payload = role === 'student'
        ? {
          studentId: currentUserId,
          mentorId: mentorIdForMessage,
          sender: 'student',
          senderId: currentUserId,
          senderName: userName,
          text,
          subject: selectedSubject,
        }
        : {
          studentId: selectedStudentId,
          mentorId: currentUserId,
          sender: 'mentor',
          senderId: currentUserId,
          senderName: userName,
          text,
          subject: selectedSubject || 'general',
        }

      socketService.sendChatRoomMessage(payload)
      setInput('')
    } catch (error) {
      const detail = error.message || 'Failed to send message'
      if (role === 'student') {
        setMentorLoadError(detail)
      } else {
        setStudentsLoadError(detail)
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div className="flex justify-between align-center">
          <div>
            <h1> {t('doubtSupportTitle')}</h1>
            <p>{t('doubtSupportSub')}</p>
          </div>
        </div>
      </div>

      {role === 'student' && (
        <div className="glass-card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Assigned Mentors by Subject</h3>
          {studentAssignments.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No mentor assigned yet. Send your first doubt with a subject to get assigned.</p>
          ) : (
            <div className="grid" style={{ gap: '0.65rem' }}>
              {studentAssignments.map((assignment) => (
                <div key={assignment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '0.55rem 0.7rem' }}>
                  <div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600 }}>{assignment.mentor.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{assignment.subject}</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => focusStudentAssignment(assignment)}>
                    Ask Doubt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {role === 'mentor' && (
        <div className="glass-card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Students with Active Doubts</h3>
          {mentorStudents.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No student doubts yet.</p>
          ) : (
            <div className="grid" style={{ gap: '0.65rem' }}>
              {mentorStudents.map((student) => (
                <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '0.55rem 0.7rem' }}>
                  <div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600 }}>{student.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{student.email || 'Student'}</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => focusMentorStudentThread(student.id)}>
                    Open Thread
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="chat-container glass-card">
        {/* Mentor info bar */}
        <div className="chat-mentor-bar">
          <div className="flex align-center" style={{ gap: '0.75rem' }}>
            <div className="avatar" style={{ width: '36px', height: '36px' }}>
              <img
                src={
                  role === 'student'
                    ? (selectedMentor?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMentor?.name || 'Mentor')}&background=10b981&color=fff&size=36`)
                    : (selectedStudent?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent?.name || 'Student')}&background=3b82f6&color=fff&size=36`)
                }
                alt=""
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div>
              <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
                {role === 'student'
                  ? (selectedMentor?.name || (mentors.length > 0 ? 'Loading mentor...' : 'No mentor found for selected subject'))
                  : (selectedStudent?.name || 'No student selected')}
              </p>
              <span className="chat-online-dot">
                ● {role === 'student'
                  ? (selectedMentor ? (selectedMentor.isOnline ? t('online') : 'Offline') : 'Not available')
                  : (selectedStudent ? t('online') : 'Not available')}
              </span>
            </div>
          </div>
          <div className="flex align-center" style={{ gap: '0.5rem' }}>
            {role === 'student' && mentorLoadError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{mentorLoadError}</span>}
            {role === 'mentor' && studentsLoadError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{studentsLoadError}</span>}
            {messagesError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{messagesError}</span>}

            {role === 'student' && (
              <select
                className="form-input"
                style={{ width: '200px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select subject interest</option>
                {subjectOptions.map((subjectName) => (
                  <option key={subjectName} value={subjectName}>{subjectName}</option>
                ))}
              </select>
            )}

            {role === 'student' && mentors.length > 0 && (
              <select
                className="form-input"
                style={{ width: '180px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
              >
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                ))}
              </select>
            )}

            {role === 'mentor' && mentorStudents.length > 0 && (
              <select
                className="form-input"
                style={{ width: '190px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {mentorStudents.map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            )}

            <span className="badge badge-success">{t('mentorBadge')}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              {/* <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👋</div> */}
              <h3>{t('startConversation')}</h3>
              <p>{t('startConversationSub')}</p>
            </div>
          )}

          {messages.map((msg) => {
            const senderRole = msg.senderRole || msg.sender

            return (
            <div key={msg.id} className={`chat-bubble ${senderRole === 'student' ? 'chat-bubble-student' : 'chat-bubble-mentor'}`}>
              <div className="chat-bubble-header">
                <span className="chat-bubble-name">
                  {msg.senderId === currentUserId
                    ? userName
                    : (senderRole === 'student' ? (selectedStudent?.name || 'Student') : (selectedMentor?.name || msg.senderName || 'Mentor'))}
                </span>
                <span className="chat-bubble-time">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="chat-bubble-text">{msg.text}</p>
            </div>
            )
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={role === 'student' && !selectedSubject
              ? 'Select your interested subject first.'
                  : role === 'student' && !resolvedStudentMentorId
                ? 'No mentor available for this subject.'
                    : role === 'mentor' && !activeThread.studentId
                  ? 'No student conversation yet. Wait for student messages.'
                  : t('typeQuestion')}
            className="chat-input-field"
            disabled={isSending || (role === 'student' && (!resolvedStudentMentorId || !selectedSubject)) || (role === 'mentor' && !activeThread.studentId)}
          />
          <button
            className="btn btn-primary chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isSending || (role === 'student' && (!resolvedStudentMentorId || !selectedSubject)) || (role === 'mentor' && !activeThread.studentId)}
          >
            {isSending ? 'Sending...' : t('send')}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem', textAlign: 'center' }}>
        💡 {t('realtimeNote')}
      </p>
    </div>
  )
}
