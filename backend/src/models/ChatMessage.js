import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    mentorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      trim: true,
    },
    senderRole: {
      type: String,
      required: true,
      enum: ['student', 'mentor'],
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
)

chatMessageSchema.index({ conversationId: 1, createdAt: 1 })

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
