# 🔥 URGENT: Test Connection Now

## Current Setup
✅ Backend: Running on http://localhost:5002
✅ Frontend: Should connect to http://localhost:5002
✅ Socket service: Updated to use port 5002

## CRITICAL: Refresh Your Browser!

The frontend code has changed. You MUST:

1. **Close ALL browser tabs** with the app
2. **Hard refresh** or clear cache
3. **Open fresh**: http://localhost:5174
4. **Open DevTools (F12)** BEFORE logging in
5. **Login** and watch the console

## What You Should See

### Successful Connection:
```
🎬 VideoCallWidget rendered
✅ Initializing socket connection (first time only)
🔌 Connecting to socket...
🔌 SocketService.connect() called - socket exists? false
🔌 Creating new socket connection to http://localhost:5002
✅ Socket connected! Socket ID: abc123xyz
📡 Setting up event listeners
📝 registerUser called: {userId: "your-email@gmail.com", role: "admin"}
📤 Emitting register-user event with normalized email: your-email@gmail.com
```

### Backend Should Show:
```
User connected: abc123xyz
admin your-email@gmail.com registered
Sent 0 online users to your-email@gmail.com
```

## If You Don't See This

### Problem 1: No socket connection logs
**Solution**: Hard refresh (Ctrl+Shift+R) or clear browser cache

### Problem 2: Connection error
**Solution**: Check if backend is running on port 5002

### Problem 3: "Socket already initialized"
**Solution**: The component is preventing re-initialization (this is good!)

## Test With Two Users

1. **Window 1**: Login as User A
   - Should see: "✅ Socket connected!"
   - Should see: "📋 Received online users list: []"

2. **Window 2** (incognito): Login as User B
   - Should see: "✅ Socket connected!"
   - Should see: "📋 Received online users list: [{userId: 'user-a@gmail.com', ...}]"
   - Window 1 should see: "👤 User online event: user-b@gmail.com"

3. **Click video call button (📞)** in Window 1
   - Should see list of online users
   - Should see User B's email

4. **Click on User B's email**
   - Console: "📞 Initiating call to: user-b@gmail.com"
   - Backend: "[Call Initiated] From: user-a To: user-b"
   - Window 2: "📞 Incoming call received"
   - Window 2: Should see "Incoming Call" popup!

## Quick Backend Test

Run this in a new terminal to test if backend is accessible:
```bash
curl http://localhost:5002
```

Should return: `{"message":"Edutech backend API is running"}`

## If Call Still Doesn't Go Through

Share these logs:
1. **Window 1 console** (all logs from login to call attempt)
2. **Window 2 console** (all logs)
3. **Backend terminal** (all output)

The logs will show EXACTLY where it's failing!

---

**IMPORTANT: You MUST refresh the browser for the new code to load!**
