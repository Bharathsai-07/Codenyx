import mongoose from 'mongoose'

const mentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    subjects: {
      type: [String],
      default: [],
    },
    students: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
)

export const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema)
