# Video Call Testing Guide

## Issues Fixed

1. **Port Mismatch**: Backend now runs on port 5000 (updated .env file)
2. **Room Join Issue**: Fixed both caller and receiver properly joining the WebRTC room
3. **Call Flow**: Improved the WebRTC signaling flow (offer/answer/ICE candidates)
4. **Error Handling**: Added comprehensive logging and error handling
5. **Call Rejection**: Added proper handling when calls are rejected
6. **Stream Management**: Better management of local and remote video streams

## Current Setup

✅ Backend Server: Running on http://localhost:5000
✅ Frontend Server: Running on http://localhost:5174
✅ WebSocket: Connected on port 5000

## How to Test

### Both servers are already running! Just follow these steps:

1. **Open Two Browser Windows/Tabs**
   - Window 1: Open http://localhost:5174 and login as User A (e.g., student)
   - Window 2: Open http://localhost:5174 (in incognito/private mode) and login as User B (e.g., mentor)

2. **Check Console Logs**
   - Open browser DevTools (F12) in both windows
   - Look for registration messages like: "Registered as [email] ([role])"

3. **Initiate Call**
   - In Window 1: Click the video call button (📞) at bottom right
   - You should see online users listed
   - Click on User B to call them
   - Watch console for: "📞 Initiating call to: [email]"

4. **Accept Call**
   - In Window 2: You should see "Incoming Call" notification
   - Click "Accept"
   - Watch console for: "📞 Accepting call from: [email]"

5. **Verify Connection**
   - Both windows should show:
     - Local video (small, bottom-right)
     - Remote video (full screen)
     - Call duration timer
     - Control buttons (mute, video, end call)

6. **Test Controls**
   - Toggle audio mute (🔊/🔇)
   - Toggle video (📷/📹)
   - End call (☎️)

## Console Log Indicators

### Successful Call Flow:
```
Window 1 (Caller):
📞 Initiating call to: [receiver-email]
✅ Call initiated successfully
✅ Call accepted, roomId: [room-id]
🔗 Creating peer connection for: [receiver-email]
✅ Added local track: audio
✅ Added local track: video
📡 Sending ICE candidate
📞 Received WebRTC answer from: [receiver-email]
✅ Set remote description from answer
📺 Received remote track: audio
📺 Received remote track: video

Window 2 (Receiver):
📞 Incoming call received: {...}
📞 Accepting call from: [caller-email]
✅ Call accepted successfully
🔗 Creating peer connection for: [caller-email]
📞 Received WebRTC offer from: [caller-email]
✅ Sent WebRTC answer
📺 Received remote track: audio
📺 Received remote track: video
```

## Troubleshooting

### Call Not Reaching Other Person
- Check if both users are registered (look for "Registered as..." in console)
- Verify backend is running on port 5000
- Check if receiver appears in "Online Users" list
- Look for error messages in console

### No Video/Audio
- Grant camera/microphone permissions when prompted
- Check browser console for permission errors
- Verify devices are not in use by another application

### Connection Issues
- Check ICE connection state in console
- Verify STUN servers are accessible
- Try refreshing both browser windows
- Check firewall/network settings

## Backend Logs to Watch

```
User connected: [socket-id]
[role] [email] registered
[Call Initiated] From: [caller] To: [receiver]
✅ Receiver Found! Socket ID: [socket-id]
✅ Call initiated successfully, roomId: [room-id]
[Call Accepted] roomId: [room-id], caller: [caller], receiver: [receiver]
✅ Caller [caller] joined room [room-id]
✅ Receiver [receiver] joined room [room-id]
[WebRTC] Sending offer for room: [room-id]
[WebRTC] Sending answer for room: [room-id]
[WebRTC] Sending ICE candidate for room: [room-id]
```

## Common Issues

1. **"Receiver is offline"**: User hasn't registered or disconnected
2. **No remote video**: WebRTC connection failed, check ICE candidates
3. **Call stuck on "Calling..."**: Receiver didn't receive the call, check backend logs
4. **Permission denied**: Browser blocked camera/microphone access

## Notes

- Both users must be logged in and on the platform
- Camera/microphone permissions must be granted
- Works best on Chrome/Edge (full WebRTC support)
- Local network or STUN servers handle NAT traversal
