import mongoose from 'mongoose'

const studentMentorSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mentorId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
)

const studentMentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    mentors: {
      type: [studentMentorSchema],
      default: [],
    },
  },
  { timestamps: true },
)

export const StudentMentorProfile = mongoose.model('StudentMentorProfile', studentMentorProfileSchema)
