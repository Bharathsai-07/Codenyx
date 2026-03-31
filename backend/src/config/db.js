import mongoose from 'mongoose'

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to your .env file.')
  }

  await mongoose.connect(mongoUri)
  console.log('MongoDB connected')
}
