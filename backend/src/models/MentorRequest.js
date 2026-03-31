import mongoose from 'mongoose'

const mentorRequestSchema = new mongoose.Schema(
  {
    applicantUserId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    experience: {
      type: String,
      default: '',
      trim: true,
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedAt: {
      type: Date,
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true },
)

mentorRequestSchema.index({ applicantUserId: 1, subject: 1, status: 1 })

export const MentorRequest = mongoose.model('MentorRequest', mentorRequestSchema)
