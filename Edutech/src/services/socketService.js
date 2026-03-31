import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.peerConnections = new Map()
    this.localStream = null
    this.currentUser = null
    this.callbacks = {
      onIncomingCall: null,
      onCallAccepted: null,
      onCallRejected: null,
      onCallEnded: null,
      onRemoteStream: null,
      onUserOnline: null,
      onUserOffline: null,
      onOnlineUsersList: null,
      onChatMessage: null,
      onConversationUpdated: null,
      onError: null,
    }
  }

  // ✅ FIX 1: Create SINGLE socket instance (don't reconnect)
  connect() {
    console.log('🔌 SocketService.connect() called - socket exists?', !!this.socket)
    
    if (!this.socket) {
      console.log('🔌 Creating new socket connection to http://localhost:5002')
      this.socket = io('http://localhost:5002', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 20,
        transports: ['websocket', 'polling'],
      })

      const onConnect = () => {
        console.log('✅ Socket connected! Socket ID:', this.socket.id)
        this.setupEventListeners()
        
        // Re-register user on reconnect
        if (this.currentUser?.userId && this.currentUser?.role) {
          console.log('🔄 Re-registering user after reconnect:', this.currentUser.userId)
          this.socket.emit('register-user', this.currentUser)
        }
      }

      const onConnectError = (error) => {
        console.error('❌ Socket connection error:', error)
      }

      this.socket.once('connect', onConnect)
      this.socket.on('connect_error', onConnectError)
    }
    
    return this.socket
  }

  // ✅ FIX 2: DO NOT disconnect - keep connection alive
  disconnect() {
    // ❌ Commented out to keep connection alive
    // if (this.socket) {
    //   this.socket.disconnect()
    // }
    console.log('⚠️ disconnect() called but skipped to keep connection alive')
  }

  isConnected() {
    return Boolean(this.socket && this.socket.connected)
  }

  async registerUser(userId, role) {
    console.log('📝 registerUser called:', { userId, role })
    // ✅ Normalize email
    const normalizedUserId = (userId || '').trim().toLowerCase()
    this.currentUser = { userId: normalizedUserId, role }
    
    // Ensure connected first
    if (!this.isConnected()) {
      this.connect()
      // Wait for actual connection
      await new Promise(resolve => {
        if (this.socket.connected) {
          resolve()
        } else {
          this.socket.once('connect', resolve)
        }
      })
    }
    
    console.log('📤 Emitting register-user event with normalized email:', normalizedUserId)
    this.socket.emit('register-user', { userId: normalizedUserId, role })
  }

  setupEventListeners() {
    console.log('📡 Setting up socket event listeners')
    
    this.socket.on('incoming-call', ({ roomId, callerId, callerRole, callType }) => {
      console.log('📞 [SOCKET EVENT] incoming-call received:', { roomId, callerId, callerRole, callType })
      console.log('📞 [CALLBACK CHECK] onIncomingCall callback exists?', !!this.callbacks.onIncomingCall)
      
      if (this.callbacks.onIncomingCall) {
        console.log('📞 [CALLING CALLBACK] Triggering onIncomingCall callback')
        this.callbacks.onIncomingCall({ roomId, callerId, callerRole, callType })
      } else {
        console.error('❌ [ERROR] onIncomingCall callback not registered!')
      }
    })

    // ✅ FIX 4: Listen for room joined confirmation
    this.socket.on('room-joined', ({ roomId }) => {
      console.log('✅ Successfully joined room:', roomId)
    })

    this.socket.on('call-accepted', ({ roomId }) => {
      console.log('✅ Call accepted, roomId:', roomId)
      if (this.callbacks.onCallAccepted) {
        this.callbacks.onCallAccepted({ roomId })
      }
    })

    this.socket.on('call-rejected', ({ roomId }) => {
      console.log('❌ Call rejected, roomId:', roomId)
      if (this.callbacks.onCallRejected) {
        this.callbacks.onCallRejected({ roomId })
      }
    })

    this.socket.on('call-ended', ({ roomId }) => {
      console.log('📞 Call ended, roomId:', roomId)
      this.closePeerConnection(roomId)
      if (this.callbacks.onCallEnded) {
        this.callbacks.onCallEnded({ roomId })
      }
    })

    this.socket.on('receive-offer', async ({ roomId, offer, senderId }) => {
      console.log('📞 Received WebRTC offer from:', senderId, 'for room:', roomId)
      try {
        const peerConnection = this.createPeerConnection(senderId, roomId)
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        
        // ✅ FIX 5: Emit to room instead of socketId
        this.socket.emit('send-answer', { roomId, answer })
        console.log('✅ Sent WebRTC answer to room:', roomId)
      } catch (error) {
        console.error('Error handling offer:', error)
        if (this.callbacks.onError) {
          this.callbacks.onError(error)
        }
      }
    })

    this.socket.on('receive-answer', async ({ answer, senderId }) => {
      console.log('📞 Received WebRTC answer from:', senderId)
      try {
        const peerConnection = this.peerConnections.get(senderId)
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          console.log('✅ Set remote description from answer')
        } else {
          console.warn('⚠️ No peer connection found for:', senderId)
        }
      } catch (error) {
        console.error('Error handling answer:', error)
        if (this.callbacks.onError) {
          this.callbacks.onError(error)
        }
      }
    })

    this.socket.on('receive-ice-candidate', async ({ candidate, senderId }) => {
      console.log('📞 Received ICE candidate from:', senderId)
      try {
        const peerConnection = this.peerConnections.get(senderId)
        if (peerConnection && candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          console.log('✅ Added ICE candidate')
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error)
      }
    })

    this.socket.on('user-online', ({ userId, role }) => {
      console.log('👤 User online event:', userId, role)
      if (this.callbacks.onUserOnline) {
        this.callbacks.onUserOnline({ userId, role })
      }
    })

    this.socket.on('online-users-list', ({ users }) => {
      console.log('📋 Received online users list:', users)
      if (this.callbacks.onOnlineUsersList) {
        this.callbacks.onOnlineUsersList({ users })
      }
    })

    this.socket.on('user-offline', ({ userId }) => {
      console.log('👤 User offline event:', userId)
      if (this.callbacks.onUserOffline) {
        this.callbacks.onUserOffline({ userId })
      }
    })

    this.socket.on('call-error', ({ message }) => {
      console.error('❌ Call error:', message)
      if (this.callbacks.onError) {
        this.callbacks.onError(new Error(message))
      }
    })

    this.socket.on('chat-message', ({ conversationId, message }) => {
      if (this.callbacks.onChatMessage) {
        this.callbacks.onChatMessage(message || null)
      }
    })

    this.socket.on('receive-message', (message) => {
      if (this.callbacks.onChatMessage) {
        this.callbacks.onChatMessage(message || null)
      }
    })

    this.socket.on('conversation-updated', ({ conversationId }) => {
      if (this.callbacks.onConversationUpdated) {
        this.callbacks.onConversationUpdated({ conversationId })
      }
    })
  }

  async registerChatUser(userId) {
    const safeUserId = String(userId || '').trim()
    if (!safeUserId) return

    if (!this.isConnected()) {
      this.connect()
      await new Promise(resolve => {
        if (this.socket.connected) {
          resolve()
        } else {
          this.socket.once('connect', resolve)
        }
      })
    }

    this.socket.emit('register-chat-user', { userId: safeUserId })
  }

  async registerSocketUser(userId, role) {
    const safeUserId = String(userId || '').trim()
    const safeRole = String(role || '').trim().toLowerCase()
    if (!safeUserId || !safeRole) return

    if (!this.isConnected()) {
      this.connect()
      await new Promise(resolve => {
        if (this.socket.connected) {
          resolve()
        } else {
          this.socket.once('connect', resolve)
        }
      })
    }

    this.socket.emit('register-socket-user', { userId: safeUserId, role: safeRole })
  }

  joinChatRoom(studentId, mentorId) {
    const safeStudentId = String(studentId || '').trim()
    const safeMentorId = String(mentorId || '').trim()
    if (!safeStudentId || !safeMentorId || !this.socket) return
    this.socket.emit('join-chat-room', { studentId: safeStudentId, mentorId: safeMentorId })
  }

  sendChatRoomMessage(payload) {
    if (!this.socket) return
    this.socket.emit('send-message', payload)
  }

  joinConversation(conversationId) {
    const safeConversationId = String(conversationId || '').trim()
    if (!safeConversationId || !this.socket) return
    this.socket.emit('join-conversation', { conversationId: safeConversationId })
  }

  leaveConversation(conversationId) {
    const safeConversationId = String(conversationId || '').trim()
    if (!safeConversationId || !this.socket) return
    this.socket.emit('leave-conversation', { conversationId: safeConversationId })
  }

  // ✅ FIX 6: Use roomId instead of email
  async initiateCall(callerId, callerRole, receiverId, receiverRole, callType) {
    if (!this.isConnected()) {
      this.connect()
      await new Promise(resolve => {
        if (this.socket.connected) {
          resolve()
        } else {
          this.socket.once('connect', resolve)
        }
      })
    }

    // Generate roomId from both users
    const roomId = `${callerId}-${receiverId}-${Date.now()}`
    console.log('📤 Emitting initiate-call with roomId:', roomId)
    
    this.socket.emit('initiate-call', {
      roomId,
      callerId,
      callerRole,
      receiverId,
      receiverRole,
      callType,
    })

    return roomId
  }

  async acceptCall({ roomId, callerId, receiverId }) {
    if (!this.isConnected()) {
      this.connect()
    }
    console.log('📤 Emitting accept-call:', { roomId, callerId, receiverId })
    this.socket.emit('accept-call', { roomId, callerId, receiverId })
  }

  async rejectCall({ roomId, callerId }) {
    if (!this.isConnected()) {
      this.connect()
    }
    console.log('📤 Emitting reject-call:', { roomId, callerId })
    this.socket.emit('reject-call', { roomId, callerId })
  }

  async startLocalStream() {
    if (this.localStream) {
      return this.localStream
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })
    return this.localStream
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }

  createPeerConnection(remotePeerId, roomId) {
    console.log('🔗 Creating peer connection for:', remotePeerId)
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream)
        console.log('✅ Added local track:', track.kind)
      })
    }

    peerConnection.ontrack = (event) => {
      console.log('📺 Received remote track:', event.track.kind)
      if (this.callbacks.onRemoteStream) {
        this.callbacks.onRemoteStream({ stream: event.streams[0], peerId: remotePeerId })
      }
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('📡 Sending ICE candidate')
        this.socket.emit('send-ice-candidate', {
          roomId,
          candidate: event.candidate,
        })
      }
    }

    peerConnection.oniceconnectionstatechange = () => {
      console.log('🔗 ICE connection state:', peerConnection.iceConnectionState)
    }

    peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', peerConnection.connectionState)
    }

    this.peerConnections.set(remotePeerId, peerConnection)
    return peerConnection
  }

  async sendOffer(roomId, remotePeerId) {
    const peerConnection =
      this.peerConnections.get(remotePeerId) ||
      this.createPeerConnection(remotePeerId, roomId)

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    
    console.log('📤 Emitting send-offer to room:', roomId)
    this.socket.emit('send-offer', { roomId, offer })
  }

  async endCall(roomId, callerId, receiverId) {
    if (!this.isConnected()) {
      this.connect()
    }
    console.log('📤 Emitting end-call:', { roomId, callerId, receiverId })
    this.socket.emit('end-call', { roomId, callerId, receiverId })
    this.closePeerConnection(receiverId)
  }

  closePeerConnection(peerId) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(peerId)
    }
  }

  on(event, callback) {
    if (Object.prototype.hasOwnProperty.call(this.callbacks, event)) {
      this.callbacks[event] = callback
    }
  }
}

export default new SocketService()
