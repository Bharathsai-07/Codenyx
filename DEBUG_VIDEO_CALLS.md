# 🐛 Debug Video Calls - Step by Step

## What I Just Fixed

1. **Added detailed console logging** throughout the call flow
2. **Added online users list sync** - when you register, you get the full list of who's online
3. **Better user registration checks** - ensures email is available before connecting
4. **Enhanced debugging** - every step now logs to console

## How to Test & Debug

### Step 1: Refresh Both Browser Windows
- Close all browser tabs with the app
- Open http://localhost:5174 in Window 1
- Open http://localhost:5174 in Window 2 (incognito/private mode)

### Step 2: Login & Check Console
Open DevTools (F12) in BOTH windows and watch for:

**Window 1 (User A):**
```
🔌 Connecting to socket... {userEmail: "user1@example.com", userRole: "student"}
✅ Registered as user1@example.com (student)
📋 Received online users list: []
```

**Window 2 (User B):**
```
🔌 Connecting to socket... {userEmail: "user2@example.com", userRole: "mentor"}
✅ Registered as user2@example.com (mentor)
📋 Received online users list: [{userId: "user1@example.com", role: "student"}]
👤 User online event: user1@example.com student
```

### Step 3: Check Online Users List
In Window 1 or 2:
- Click the video call button (📞) at bottom right
- You should see a popup with "Online Users (X)"
- The other user should be listed

**If you see "No users online":**
- Check console for registration messages
- Make sure both users are logged in
- Refresh both windows

### Step 4: Initiate Call
In Window 1:
- Click on the other user's email in the online users list
- Console should show:
  ```
  📞 Initiating call to: user2@example.com
  ✅ Call initiated successfully
  ```

### Step 5: Check Window 2 (Receiver)
Window 2 console should show:
```
📞 Incoming call received: {roomId: "...", callerId: "user1@example.com", ...}
```

And you should see an "Incoming Call" popup with Accept/Reject buttons.

### Step 6: Accept Call
In Window 2:
- Click "Accept"
- Console should show:
  ```
  📞 Accepting call from: user1@example.com
  ✅ Call accepted successfully
  🔗 Creating peer connection for: user1@example.com
  ```

### Step 7: Verify Connection
Both windows should show:
```
📞 Received WebRTC offer/answer
✅ Added local track: audio
✅ Added local track: video
📺 Received remote track: audio
📺 Received remote track: video
🔗 ICE connection state: connected
🔗 Connection state: connected
```

## Common Issues & Solutions

### Issue: "No users online"
**Solution:**
- Check console for "✅ Registered as..." message
- If missing, refresh the page
- Make sure you're logged in with Clerk

### Issue: Camera turns on but call doesn't go through
**Solution:**
- Check Window 2 console for "📞 Incoming call received"
- If missing, check backend logs (see below)
- Verify both users are using different emails

### Issue: "User offline" error
**Solution:**
- The other user isn't registered
- Check their console for registration message
- Have them refresh their browser

### Issue: Call connects but no video/audio
**Solution:**
- Check for "📺 Received remote track" messages
- Verify camera/microphone permissions granted
- Check ICE connection state in console

## Backend Logs to Check

In the backend terminal, you should see:
```
User connected: [socket-id]
student user1@example.com registered
Sent 0 online users to user1@example.com

User connected: [socket-id]
mentor user2@example.com registered
Sent 1 online users to user2@example.com

[Call Initiated] From: user1@example.com (student) To: user2@example.com (mentor)
[Active Users]: user1@example.com, user2@example.com
✅ Receiver Found! Socket ID: [socket-id]
✅ Call initiated successfully, roomId: [room-id]

[Call Accepted] roomId: [room-id], caller: user1@example.com, receiver: user2@example.com
✅ Caller user1@example.com joined room [room-id]
✅ Receiver user2@example.com joined room [room-id]
```

## Quick Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5174
- [ ] Both users logged in with different accounts
- [ ] Both users see "✅ Registered as..." in console
- [ ] Online users list shows the other user
- [ ] Camera/microphone permissions granted
- [ ] Using Chrome/Edge browser (best WebRTC support)

## Still Not Working?

1. **Copy the console logs** from both windows
2. **Copy the backend terminal output**
3. Share them so I can see exactly what's happening

The detailed logs will show exactly where the call flow is breaking!
