import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import routes from './routes/index.js'
import { connectDB } from './config/db.js'
import { VideoCall } from './models/VideoCall.js'
import { Conversation } from './models/Conversation.js'
import { ChatMessage } from './models/ChatMessage.js'
import { activeUsers, callRooms, chatUsersBySocketId, socketIdsByChatUserId } from './state/realtimeState.js'
import { setSocketServer } from './state/socketState.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
setSocketServer(io)

const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/api', routes)

app.get('/', (_req, res) => {
  res.json({ message: 'Edutech backend API is running' })
})

function toSafeId(value) {
  return String(value || '').trim()
}

function toSafeText(value) {
  return String(value || '').trim()
}

function buildChatRoomId(studentId, mentorId) {
  return `${toSafeId(studentId)}-${toSafeId(mentorId)}`
}

function registerChatSocketUser(socket, userId) {
  const safeUserId = toSafeId(userId)
  if (!safeUserId) return

  chatUsersBySocketId.set(socket.id, safeUserId)

  const existingSocketSet = socketIdsByChatUserId.get(safeUserId) || new Set()
  existingSocketSet.add(socket.id)
  socketIdsByChatUserId.set(safeUserId, existingSocketSet)

  socket.join(`user:${safeUserId}`)
}

// WebSocket Connection Handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // User registers themselves
  socket.on('register-user', ({ userId, role }) => {
    // ✅ Normalize email: trim and lowercase
    const normalizedUserId = (userId || '').trim().toLowerCase()
    
    activeUsers.set(normalizedUserId, { socketId: socket.id, role, userId: normalizedUserId })
    socket.userId = normalizedUserId
    socket.userRole = role

    // Broadcast online status to all users
    io.emit('user-online', { userId: normalizedUserId, role, socketId: socket.id })
    
    console.log(`\n========== USER REGISTRATION ==========`)
    console.log(`✅ User Registered!`)
    console.log(`   - Email (normalized): "${normalizedUserId}"`)
    console.log(`   - Email (original): "${userId}"`)
    console.log(`   - Email Type: ${typeof normalizedUserId}`)
    console.log(`   - Email Length: ${normalizedUserId.length}`)
    console.log(`   - Role: ${role}`)
    console.log(`   - Socket ID: ${socket.id}`)
    console.log(`   - Total Users Online: ${activeUsers.size}`)
    console.log(`   - All Online Users:`)
    Array.from(activeUsers.keys()).forEach((email, idx) => {
      console.log(`     ${idx + 1}. "${email}"`)
    })
    console.log(`=======================================\n`)
    
    // Send list of currently online users to the newly registered user
    const onlineUsersList = Array.from(activeUsers.entries())
      .filter(([id]) => id !== normalizedUserId)
      .map(([id, data]) => ({ userId: id, role: data.role }))
    
    socket.emit('online-users-list', { users: onlineUsersList })
  })

  socket.on('register-socket-user', ({ userId, role }) => {
    const safeUserId = toSafeId(userId)
    if (!safeUserId) return

    socket.userId = safeUserId
    socket.userRole = String(role || '').trim().toLowerCase()
    registerChatSocketUser(socket, safeUserId)
    console.log('[chat] register-socket-user', { socketId: socket.id, userId: safeUserId, role: socket.userRole })
  })

  socket.on('register-chat-user', ({ userId }) => {
    const safeUserId = toSafeId(userId)
    if (!safeUserId) return
    registerChatSocketUser(socket, safeUserId)
  })

  socket.on('join-chat-room', ({ studentId, mentorId }) => {
    const safeStudentId = toSafeId(studentId)
    const safeMentorId = toSafeId(mentorId)
    if (!safeStudentId || !safeMentorId) return

    const roomId = buildChatRoomId(safeStudentId, safeMentorId)
    socket.join(roomId)
    socket.emit('chat-room-joined', { roomId, studentId: safeStudentId, mentorId: safeMentorId })
    console.log('[chat] join-chat-room', { socketId: socket.id, roomId, studentId: safeStudentId, mentorId: safeMentorId })
  })

  socket.on('send-message', async (payload) => {
    const safeStudentId = toSafeId(payload?.studentId)
    const safeMentorId = toSafeId(payload?.mentorId)
    const safeSenderId = toSafeId(payload?.senderId)
    const safeSender = String(payload?.sender || '').trim().toLowerCase()
    const safeSenderName = toSafeText(payload?.senderName) || 'User'
    const safeText = toSafeText(payload?.text)
    const safeSubject = toSafeText(payload?.subject).toLowerCase()

    if (!safeStudentId || !safeMentorId || !safeSenderId || !safeText) {
      socket.emit('message-error', { message: 'studentId, mentorId, senderId and text are required' })
      return
    }

    if (safeSender !== 'student' && safeSender !== 'mentor') {
      socket.emit('message-error', { message: 'sender must be student or mentor' })
      return
    }

    if (safeSenderId !== safeStudentId && safeSenderId !== safeMentorId) {
      socket.emit('message-error', { message: 'senderId must match studentId or mentorId' })
      return
    }

    try {
      const roomId = buildChatRoomId(safeStudentId, safeMentorId)

      const conversation = await Conversation.findOneAndUpdate(
        { studentId: safeStudentId, mentorId: safeMentorId },
        {
          $setOnInsert: {
            studentId: safeStudentId,
            mentorId: safeMentorId,
            subject: safeSubject || 'general',
          },
          $set: {
            subject: safeSubject || 'general',
            lastMessageText: safeText,
            lastMessageAt: new Date(),
          },
        },
        { upsert: true, new: true },
      )

      const savedMessage = await ChatMessage.create({
        conversationId: conversation._id,
        studentId: safeStudentId,
        mentorId: safeMentorId,
        senderId: safeSenderId,
        senderRole: safeSender,
        senderName: safeSenderName,
        text: safeText,
      })

      const messagePayload = {
        id: String(savedMessage._id),
        studentId: safeStudentId,
        mentorId: safeMentorId,
        sender: safeSender,
        senderId: safeSenderId,
        senderName: safeSenderName,
        text: safeText,
        timestamp: savedMessage.createdAt,
      }

      io.to(roomId).emit('receive-message', messagePayload)
      io.to(`user:${safeStudentId}`).emit('conversation-updated', {
        studentId: safeStudentId,
        mentorId: safeMentorId,
      })
      io.to(`user:${safeMentorId}`).emit('conversation-updated', {
        studentId: safeStudentId,
        mentorId: safeMentorId,
      })

      socket.emit('message-sent', {
        ok: true,
        messageId: String(savedMessage._id),
      })

      console.log('[chat] send-message success', {
        roomId,
        studentId: safeStudentId,
        mentorId: safeMentorId,
        sender: safeSender,
        textLength: safeText.length,
      })
    } catch (error) {
      const message = error?.message || 'Failed to send message'
      socket.emit('message-error', { message })
      console.error('[chat] send-message error', message)
    }
  })

  socket.on('join-conversation', ({ conversationId }) => {
    const safeConversationId = String(conversationId || '').trim()
    if (!safeConversationId) return
    socket.join(`conversation:${safeConversationId}`)
  })

  socket.on('leave-conversation', ({ conversationId }) => {
    const safeConversationId = String(conversationId || '').trim()
    if (!safeConversationId) return
    socket.leave(`conversation:${safeConversationId}`)
  })

  // Initiate a video call with roomId
  socket.on('initiate-call', ({ roomId, callerId, callerRole, receiverId, receiverRole, callType }) => {
    // ✅ Normalize emails
    const normalizedCallerId = (callerId || '').trim().toLowerCase()
    const normalizedReceiverId = (receiverId || '').trim().toLowerCase()
    
    console.log(`\n========== CALL INITIATION ==========`)
    console.log(`[roomId]: ${roomId}`)
    console.log(`[Caller]: "${normalizedCallerId}" (${callerRole})`)
    console.log(`[Receiver]: "${normalizedReceiverId}" (${receiverRole})`)
    
    // Debug: Show active users
    console.log(`\n[Active Users in System] (${activeUsers.size} total):`)
    Array.from(activeUsers.entries()).forEach(([email, user]) => {
      console.log(`  ✓ "${email}" (${user.role}) - Socket: ${user.socketId}`)
    })
    
    const receiver = activeUsers.get(normalizedReceiverId)
    console.log(`\n[Lookup] Searching for: "${normalizedReceiverId}"`)
    console.log(`[Result] Found: ${receiver ? 'YES ✅' : 'NO ❌'}`)

    if (receiver) {
      console.log(`✅ Receiver Found!`)
      console.log(`   - Email: "${normalizedReceiverId}"`)
      console.log(`   - Socket ID: ${receiver.socketId}`)
      
      // ✅ STEP 1: Both users join the room FIRST
      console.log(`\n📍 STEP 1: Joining users to room "${roomId}"`)
      
      // Caller joins room
      socket.join(roomId)
      console.log(`   ✅ Caller "${normalizedCallerId}" joined room`)
      
      // Receiver joins room
      const receiverSocket = io.sockets.sockets.get(receiver.socketId)
      if (receiverSocket) {
        receiverSocket.join(roomId)
        console.log(`   ✅ Receiver "${normalizedReceiverId}" joined room`)
      }
      
      // Store room info
      callRooms.set(roomId, {
        callerId: normalizedCallerId,
        callerRole,
        receiverId: normalizedReceiverId,
        receiverRole,
        callType,
        status: 'active',
        participants: [normalizedCallerId, normalizedReceiverId],
        callerSocketId: socket.id,
        receiverSocketId: receiver.socketId,
        startTime: new Date(),
      })

      // ✅ STEP 2: Send incoming-call to the ROOM (receiver will get it)
      console.log(`\n📤 STEP 2: Broadcasting incoming-call to room`)
      socket.to(roomId).emit('incoming-call', {
        roomId,
        callerId: normalizedCallerId,
        callerRole,
        receiverId: normalizedReceiverId,
        receiverRole,
        callType,
      })
      console.log(`✅ Call initiated successfully - both users in room "${roomId}"`)

      // Notify caller that call was initiated
      socket.emit('call-initiated', { roomId })
      
    } else {
      console.log(`❌ Receiver NOT found`)
      socket.emit('call-error', { message: `Receiver ${normalizedReceiverId} is offline` })
    }
    console.log(`=====================================\n`)
  })

  // ✅ Call accepted - notify the room
  socket.on('accept-call', ({ roomId, callerId, receiverId }) => {
    // Normalize emails
    const normalizedCallerId = (callerId || '').trim().toLowerCase()
    const normalizedReceiverId = (receiverId || '').trim().toLowerCase()
    
    console.log(`\n========== CALL ACCEPTED ==========`)
    console.log(`[roomId]: ${roomId}`)
    console.log(`[Caller]: "${normalizedCallerId}"`)
    console.log(`[Receiver]: "${normalizedReceiverId}"`)
    
    const roomInfo = callRooms.get(roomId)
    if (roomInfo) {
      roomInfo.status = 'active'
      roomInfo.startTime = new Date()
      callRooms.set(roomId, roomInfo)
      console.log(`✅ Room status updated to 'active'`)
    }

    // ✅ Broadcast to the ROOM that call was accepted
    console.log(`📤 Broadcasting 'call-accepted' to room "${roomId}"`)
    io.to(roomId).emit('call-accepted', { roomId })
    
    console.log(`✅ Call accepted - both users already in room`)
    console.log(`=====================================\n`)
  })

  socket.on('reject-call', ({ roomId, callerId }) => {
    console.log(`[Call Rejected] roomId: ${roomId}, caller: ${callerId}`)
    const caller = activeUsers.get(callerId)
    if (caller) {
      io.to(caller.socketId).emit('call-rejected', { roomId })
    }
    // Clean up room
    callRooms.delete(roomId)
    console.log(`Call rejected: ${roomId}`)
  })

  // WebRTC Signaling - Offer
  socket.on('send-offer', ({ roomId, offer }) => {
    console.log(`[WebRTC] Sending offer for room: ${roomId}`)
    socket.to(roomId).emit('receive-offer', { roomId, offer, senderId: socket.userId })
  })

  // WebRTC Signaling - Answer
  socket.on('send-answer', ({ roomId, answer }) => {
    console.log(`[WebRTC] Sending answer for room: ${roomId}`)
    socket.to(roomId).emit('receive-answer', { roomId, answer, senderId: socket.userId })
  })

  // ICE Candidates
  socket.on('send-ice-candidate', ({ roomId, candidate }) => {
    console.log(`[WebRTC] Sending ICE candidate for room: ${roomId}`)
    socket.to(roomId).emit('receive-ice-candidate', { roomId, candidate, senderId: socket.userId })
  })

  // End call
  socket.on('end-call', async ({ roomId, callerId, receiverId }) => {
    const callRoom = callRooms.get(roomId)
    if (callRoom) {
      const duration = Math.floor((new Date() - callRoom.startTime) / 1000)

      // Save call history to database
      try {
        await VideoCall.create({
          initiatorId: callerId,
          initiatorRole: 'mentor', // This should come from socket data
          receiverId: receiverId,
          receiverRole: 'student', // This should come from socket data
          status: 'ended',
          startTime: callRoom.startTime,
          endTime: new Date(),
          duration,
          callType: 'mentor-student',
        })
      } catch (err) {
        console.error('Failed to save call:', err)
      }

      callRooms.delete(roomId)
    }

    io.to(roomId).emit('call-ended', { roomId })
    socket.leave(roomId)
    console.log(`Call ended: ${roomId}`)
  })

  // Disconnect
  socket.on('disconnect', () => {
    const chatUserId = chatUsersBySocketId.get(socket.id)
    if (chatUserId) {
      const socketSet = socketIdsByChatUserId.get(chatUserId)
      if (socketSet) {
        socketSet.delete(socket.id)
        if (socketSet.size === 0) {
          socketIdsByChatUserId.delete(chatUserId)
        } else {
          socketIdsByChatUserId.set(chatUserId, socketSet)
        }
      }
      chatUsersBySocketId.delete(socket.id)
    }

    for (const [userId, user] of activeUsers.entries()) {
      if (user.socketId === socket.id) {
        activeUsers.delete(userId)
        io.emit('user-offline', { userId })
        console.log(`User disconnected: ${userId}`)
        break
      }
    }
  })
})


async function startServer() {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log('WebSocket ready for connections')
  })

  try {
    await connectDB(process.env.MONGO_URI)
  } catch (error) {
    console.error('MongoDB unavailable, continuing without DB:', error.message)
  }
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exit(1)
})

export { io, activeUsers, callRooms }
