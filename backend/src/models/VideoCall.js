import mongoose from 'mongoose'

const videCallSchema = new mongoose.Schema(
  {
    initiatorId: {
      type: String,
      required: true,
    },
    initiatorRole: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    receiverRole: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'ended', 'rejected'],
      default: 'pending',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
    callType: {
      type: String,
      enum: ['mentor-student', 'admin-mentor', 'peer'],
      required: true,
    },
  },
  { timestamps: true }
)

export const VideoCall = mongoose.model('VideoCall', videCallSchema)
