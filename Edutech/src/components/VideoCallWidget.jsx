import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import socketService from '../services/socketService'

const VideoCallWidget = forwardRef(({ userId, userRole, userName, targetMentorId }, ref) => {
  const { user } = useUser()
  // ✅ Normalize email: trim whitespace and lowercase
  const userEmail = (user?.primaryEmailAddress?.emailAddress || userId || '').trim().toLowerCase()
  
  console.log('🎬 VideoCallWidget rendered', { 
    userId, 
    userRole, 
    userName, 
    userEmail,
    rawEmail: user?.primaryEmailAddress?.emailAddress,
    hasUser: !!user
  })
  
  const [isCallActive, setIsCallActive] = useState(false)
  const [roomId, setRoomId] = useState(null)
  const [remoteUserId, setRemoteUserId] = useState(null)
  const [callDuration, setCallDuration] = useState(0)
  const [incomingCall, setIncomingCall] = useState(null)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoDisabled, setIsVideoDisabled] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [showCallList, setShowCallList] = useState(false)
  const [callStatus, setCallStatus] = useState('idle') // idle, calling, connected, ended

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const timerRef = useRef(null)
  const socketInitialized = useRef(false)

  // ✅ DEFINE ALL HANDLERS HERE - Before useEffect so they're available for socket registration
  const initiateDirCallRef = useRef(null)
  
  // ✅ DEFINE ALL HANDLERS HERE - Before useEffect so they're available for socket registration
  const handleIncomingCall = useCallback(({ roomId, callerId, callerRole, callType }) => {
    console.log('🎯 [HANDLER] handleIncomingCall triggered!')
    console.log('📞 Incoming call from:', callerId)
    console.log('   - roomId:', roomId)
    console.log('   - callerRole:', callerRole)
    console.log('   - callType:', callType)
    console.log('   - AUTO-ACCEPTING CALL...')
    
    // ✅ AUTO-ACCEPT: Immediately accept the call
    acceptCallAutomatically(roomId, callerId)
  }, [])

  const handleCallRejected = useCallback(({ roomId }) => {
    console.log('❌ Call was rejected, roomId:', roomId)
    setCallStatus('idle')
    setRemoteUserId(null)
    socketService.stopLocalStream()
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
  }, [])

  const handleCallAccepted = useCallback(async ({ roomId }) => {
    try {
      console.log('📞 Call accepted, roomId:', roomId)
      
      // Get local stream if not already started
      if (!socketService.localStream) {
        const stream = await socketService.startLocalStream()
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      }

      setRoomId(roomId)
      setIsCallActive(true)
      setCallStatus('connected')
      setCallDuration(0)

      // Caller sends WebRTC offer after call is accepted
      const targetUserId = remoteUserId || incomingCall?.callerId
      console.log('📞 Sending WebRTC offer to:', targetUserId)
      await socketService.sendOffer(roomId, targetUserId)
    } catch (error) {
      console.error('Error in handleCallAccepted:', error)
    }
  }, [remoteUserId, incomingCall])

  const handleRemoteStream = useCallback(({ stream }) => {
    console.log('📺 Received remote stream')
    if (remoteVideoRef.current && stream) {
      remoteVideoRef.current.srcObject = stream
      console.log('✅ Remote stream set successfully')
    }
  }, [])

  const handleCallEnded = useCallback(() => {
    console.log('📞 Call ended')
    setIsCallActive(false)
    setRoomId(null)
    setRemoteUserId(null)
    setIncomingCall(null)
    setCallDuration(0)
    setCallStatus('idle')

    socketService.stopLocalStream()
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }, [])

  const handleUserOnline = useCallback(({ userId }) => {
    console.log('👤 User came online:', userId, 'Current user:', userEmail)
    if (userId === userEmail) return
    setOnlineUsers((prev) => {
      if (prev.includes(userId)) {
        console.log('User already in list')
        return prev
      }
      console.log('✅ Adding user to online list:', userId)
      return [...prev, userId]
    })
  }, [userEmail])

  const handleOnlineUsersList = useCallback(({ users }) => {
    console.log('📋 Setting initial online users list:', users)
    const userIds = users.map(u => u.userId).filter(id => id !== userEmail)
    setOnlineUsers(userIds)
  }, [userEmail])

  const handleUserOffline = useCallback(({ userId }) => {
    console.log('👤 User went offline:', userId)
    setOnlineUsers((prev) => prev.filter((id) => id !== userId))
  
    // ✅ Setup imperativeHandle with ref - deferred resolution
    useImperativeHandle(ref, () => ({
      callMentor: (mentorEmail, mentorRole = 'mentor') => {
        if (initiateDirCallRef.current) {
          initiateDirCallRef.current(mentorEmail, mentorRole)
        }
      },
    }))
  }, [])

  // Initialize Socket connection - only ONCE on component mount
  useEffect(() => {
    // Skip if already initialized or dependencies not ready
    if (socketInitialized.current) {
      return
    }
    
    if (!userEmail || !userRole) {
      return
    }
    
    console.log('✅ Initializing socket connection (first time only)')
    socketInitialized.current = true
    
    const initSocket = async () => {
      try {
        console.log('🔌 Connecting to socket...')
        socketService.connect()
        
        // Register using real Clerk email
        console.log('📝 Registering user...')
        await socketService.registerUser(userEmail, userRole)
        console.log(`✅ Registered as ${userEmail} (${userRole})`)

        // Register callbacks - these persist across re-renders
        console.log('📝 Registering VideoCallWidget callbacks')
        socketService.on('onIncomingCall', handleIncomingCall)
        socketService.on('onCallAccepted', handleCallAccepted)
        socketService.on('onCallRejected', handleCallRejected)
        socketService.on('onCallEnded', handleCallEnded)
        socketService.on('onRemoteStream', handleRemoteStream)
        socketService.on('onUserOnline', handleUserOnline)
        socketService.on('onUserOffline', handleUserOffline)
        socketService.on('onOnlineUsersList', handleOnlineUsersList)
        socketService.on('onError', (error) => {
          console.error('Video call error:', error)
          setCallStatus('idle')
          socketService.stopLocalStream()
        })
        console.log('✅ All callbacks registered')
      } catch (error) {
        console.error('❌ Socket connection error:', error)
        socketInitialized.current = false
      }
    }
    
    initSocket()

    // ✅ FIX 2: DO NOT disconnect on unmount - removed disconnect call
    return () => {
      if (socketInitialized.current) {
        console.log('🔌 Component unmounting (but keeping socket connection alive)')
        // ❌ DO NOT call: socketService.disconnect()
        // This keeps the connection alive for other components
      }
    }
  }, [userEmail, userRole]) // Simplified - only initialize when user info becomes available

  // Timer for call duration
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isCallActive])

  // ✅ NEW: Track state changes for debugging
  useEffect(() => {
    console.log('📊 State changed:', {
      incomingCall,
      callStatus,
      isCallActive,
      remoteUserId,
    })
  }, [incomingCall, callStatus, isCallActive, remoteUserId])

  const initiateCall = async (receiverId, receiverRole) => {
    try {
      console.log('📞 Initiating call to:', receiverId)
      setRemoteUserId(receiverId)
      setCallStatus('calling')
      
      const stream = await socketService.startLocalStream()
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      await socketService.initiateCall(userEmail, userRole, receiverId, receiverRole, 'mentor-student')
      console.log('✅ Call initiated successfully')
    } catch (error) {
      console.error('Error initiating call:', error)
      setCallStatus('idle')
      socketService.stopLocalStream()
    }
  }

  const initiateDirectCall = async (mentorEmail, mentorRole = 'mentor') => {
    try {
      // ✅ Normalize both emails
      const normalizedCallerEmail = (userEmail || '').trim().toLowerCase()
      const normalizedReceiverEmail = (mentorEmail || '').trim().toLowerCase()
      
      console.log('📞 Initiating call')
      console.log(`   - Caller: "${normalizedCallerEmail}" (${userRole})`)
      console.log(`   - Receiver: "${normalizedReceiverEmail}" (${mentorRole})`)
      
      setCallStatus('calling')
      setRemoteUserId(normalizedReceiverEmail)
        // ✅ Update ref whenever initiateDirectCall changes
        useEffect(() => {
          initiateDirCallRef.current = initiateDirectCall
        }, [])
      
      const stream = await socketService.startLocalStream()
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // ✅ FIX 6: Get roomId from initiateCall using normalized emails
      const generatedRoomId = await socketService.initiateCall(
        normalizedCallerEmail, 
        userRole, 
        normalizedReceiverEmail, 
        mentorRole, 
        'admin-mentor'
      )
      setRoomId(generatedRoomId)
      
      console.log(`✅ Call initiated with roomId: ${generatedRoomId}`)
      
      // Set a timeout - if no response within 30 seconds, cancel
      setTimeout(() => {
        if (callStatus === 'calling') {
          console.warn('⏱️ Call timeout - mentor did not respond')
          alert(`Call timeout: Mentor ${normalizedReceiverEmail} did not respond. They may be offline.`)
          setCallStatus('idle')
          socketService.stopLocalStream()
          setRemoteUserId(null)
        }
      }, 30000)
    } catch (error) {
      console.error('Error initiating direct call:', error)
      alert(`❌ Error initiating call: ${error.message || 'Unknown error'}`)
      setCallStatus('idle')
      socketService.stopLocalStream()
    }
  }

  const acceptCall = async () => {
    if (incomingCall) {
      console.log('📞 Accepting call from:', incomingCall.callerId)
      
      try {
        // Start local stream first
        const stream = await socketService.startLocalStream()
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Accept the call
        await socketService.acceptCall({
          roomId: incomingCall.roomId,
          callerId: incomingCall.callerId,
          receiverId: userEmail,
        })

        setRoomId(incomingCall.roomId)
        setIsCallActive(true)
        setCallStatus('connected')
        setRemoteUserId(incomingCall.callerId)
        setIncomingCall(null)
        
        console.log('✅ Call accepted successfully')
      } catch (error) {
        console.error('Error accepting call:', error)
        setCallStatus('idle')
      }
    }
  }

  // ✅ NEW: Auto-accept function
  const acceptCallAutomatically = async (roomId, callerId) => {
    console.log('🤖 AUTO-ACCEPTING call from:', callerId)
    
    try {
      // Start local stream first
      console.log('📹 Starting local stream...')
      const stream = await socketService.startLocalStream()
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      console.log('✅ Local stream started')

      // Accept the call
      console.log('📤 Sending accept-call event...')
      await socketService.acceptCall({
        roomId: roomId,
        callerId: callerId,
        receiverId: userEmail,
      })
      console.log('✅ Accept-call event sent')

      setRoomId(roomId)
      setIsCallActive(true)
      setCallStatus('connected')
      setRemoteUserId(callerId)
      
      console.log('✅ Call auto-accepted successfully!')
    } catch (error) {
      console.error('❌ Error auto-accepting call:', error)
      setCallStatus('idle')
    }
  }

  const rejectCall = async () => {
    if (incomingCall) {
      await socketService.rejectCall({
        roomId: incomingCall.roomId,
        callerId: incomingCall.callerId,
      })
      setIncomingCall(null)
      setCallStatus('idle')
    }
  }

  const endCall = async () => {
    if (roomId) {
      console.log('📞 Ending call, roomId:', roomId)
      await socketService.endCall(roomId, userEmail, remoteUserId)
      handleCallEnded()
    }
  }

  const toggleAudio = () => {
    if (socketService.localStream) {
      socketService.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsAudioMuted(!isAudioMuted)
    }
  }

  const toggleVideo = () => {
    if (socketService.localStream) {
      socketService.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoDisabled(!isVideoDisabled)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Calling state - show while waiting for mentor to accept
  if (callStatus === 'calling' && !isCallActive) {
    console.log('🎬 RENDERING: Calling UI', { callStatus, isCallActive, remoteUserId })
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-sm z-50 border-2 border-purple-500">
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">Calling...</h3>
          <p className="text-gray-600 mb-4">
            Connecting to {remoteUserId}
          </p>
          <div className="flex justify-center mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full"></div>
          </div>
          <button
            onClick={() => {
              setCallStatus('idle')
              socketService.stopLocalStream()
              setRemoteUserId(null)
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold w-full"
          >
            Cancel Call
          </button>
        </div>
      </div>
    )
  }

  // Incoming call notification - AUTO-ACCEPT (no UI needed)
  // The call is automatically accepted in handleIncomingCall

  // Active call view
  if (isCallActive) {
    console.log('🎬 RENDERING: Active Call UI', { isCallActive, roomId })
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
        {/* Remote video - full screen */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Local video - picture in picture */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-20 right-6 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white shadow-lg object-cover"
        />

        {/* Call info and controls */}
        <div className="absolute top-6 left-6 text-white">
          <p className="text-3xl font-bold">
            {formatTime(callDuration)}
          </p>
          <p className="text-sm opacity-75">
            Call with {remoteUserId}
          </p>
        </div>

        {/* Control buttons */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white transition-all ${
              isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isAudioMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white transition-all ${
              isVideoDisabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isVideoDisabled ? 'Enable video' : 'Disable video'}
          >
            {isVideoDisabled ? '📹' : '📷'}
          </button>

          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center font-bold text-white text-2xl transition-all"
            title="End call"
          >
            ☎️
          </button>
        </div>
      </div>
    )
  }

  // Hide idle launcher button; call UI still appears when a call is initiated/received.
  return null
})

VideoCallWidget.displayName = 'VideoCallWidget'

export default VideoCallWidget
