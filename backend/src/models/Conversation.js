import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    mentorId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastMessageText: {
      type: String,
      default: '',
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
)

conversationSchema.index({ studentId: 1, mentorId: 1 }, { unique: true })

export const Conversation = mongoose.model('Conversation', conversationSchema)
