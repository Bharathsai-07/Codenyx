// Shared in-memory state for active socket users and call rooms.
export const activeUsers = new Map()
export const callRooms = new Map()
export const chatUsersBySocketId = new Map()
export const socketIdsByChatUserId = new Map()
