import mongoose from 'mongoose'
import { env } from './env'
import { logger } from './logger'

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    logger.info({ uri: env.DATABASE_URL.replace(/\/\/[^@]+@/, '//***@') }, 'MongoDB connected')
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed')
    process.exit(1)
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected')
  })

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected')
  })

  mongoose.connection.on('error', (err: Error) => {
    logger.error({ err }, 'MongoDB error')
  })
}
