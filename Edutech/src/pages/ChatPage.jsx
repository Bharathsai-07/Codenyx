import { useState, useEffect, useRef } from 'react'
import { getChatMessages, sendMessage, simulateMentorReply, clearChat } from '../services/chatService'
import { useRole } from '../hooks/useRole'
import { useUiText } from '../translations'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const { userName } = useRole()
  const { t } = useUiText()

  useEffect(() => {
    setMessages(getChatMessages())
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    const userMsg = sendMessage(text)
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const reply = await simulateMentorReply()
    setIsTyping(false)
    setMessages(prev => [...prev, reply])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    clearChat()
    setMessages([])
  }

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div className="flex justify-between align-center">
          <div>
            <h1>💬 {t('doubtSupportTitle')}</h1>
            <p>{t('doubtSupportSub')}</p>
          </div>
          {messages.length > 0 && (
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={handleClear}>
              {t('clearChat')}
            </button>
          )}
        </div>
      </div>

      <div className="chat-container glass-card">
        {/* Mentor info bar */}
        <div className="chat-mentor-bar">
          <div className="flex align-center" style={{ gap: '0.75rem' }}>
            <div className="avatar" style={{ width: '36px', height: '36px' }}>
              <img src="https://ui-avatars.com/api/?name=Dr+Sarah+Lee&background=10b981&color=fff&size=36" alt="" style={{ width: '100%', height: '100%' }} />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Dr. Sarah Lee</p>
              <span className="chat-online-dot">● {t('online')}</span>
            </div>
          </div>
          <span className="badge badge-success">{t('mentorBadge')}</span>
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

          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble ${msg.sender === 'student' ? 'chat-bubble-student' : 'chat-bubble-mentor'}`}>
              <div className="chat-bubble-header">
                <span className="chat-bubble-name">{msg.sender === 'student' ? userName : msg.senderName || 'Mentor'}</span>
                <span className="chat-bubble-time">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="chat-bubble-text">{msg.text}</p>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble chat-bubble-mentor">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('typeQuestion')}
            className="chat-input-field"
          />
          <button className="btn btn-primary chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
            {t('send')}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem', textAlign: 'center' }}>
        💡 {t('realtimeNote')}
      </p>
    </div>
  )
}
