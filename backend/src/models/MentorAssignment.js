import mongoose from 'mongoose'

const mentorAssignmentSchema = new mongoose.Schema(
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
      index: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
)

mentorAssignmentSchema.index({ studentId: 1, mentorId: 1, subject: 1 }, { unique: true })

export const MentorAssignment = mongoose.model('MentorAssignment', mentorAssignmentSchema)
