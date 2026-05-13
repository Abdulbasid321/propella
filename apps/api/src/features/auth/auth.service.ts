import crypto from 'crypto'
// import bcrypt from 'bcrypt'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { SignupInput } from '@propella/shared'
import { UserModel, type IUser } from '../../models/User'
import { StreakModel } from '../../models/Streak'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import { AppError } from '../../middleware/error-handler'

const BCRYPT_ROUNDS = 12
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '30d'
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

export interface JwtTokenPayload {
  id: string
  email: string
  plan: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export async function signup(data: SignupInput): Promise<IUser> {
  const existing = await UserModel.findOne({ email: data.email }).lean()
  if (existing) {
    throw new AppError(409, 'An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

  const user = await UserModel.create({
    email: data.email,
    name: data.name,
    passwordHash,
  })

  await StreakModel.create({
    userId: user._id,
    lastActiveDate: new Date(),
  })

  return user
}

export async function login(email: string, password: string): Promise<IUser> {
  const user = await UserModel.findOne({ email }).select('+passwordHash')
  if (!user) {
    throw new AppError(401, 'Invalid email or password')
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isMatch) {
    throw new AppError(401, 'Invalid email or password')
  }

  return user
}

export function generateTokens(userId: string, email: string, plan: string): AuthTokens {
  const payload: JwtTokenPayload = { id: userId, email, plan }

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  })

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  })

  return { accessToken, refreshToken }
}

export function verifyRefreshToken(token: string): JwtTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtTokenPayload
    return { id: payload.id, email: payload.email, plan: payload.plan }
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token')
  }
}

export async function getUserForRefresh(userId: string): Promise<Omit<IUser, 'passwordHash'> | null> {
  return UserModel.findById(userId).lean() as Promise<Omit<IUser, 'passwordHash'> | null>
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await UserModel.findOne({ email }).select(
    '+resetPasswordToken +resetPasswordExpires',
  )

  if (!user) {
    // Silently return — do not reveal whether the email exists
    return
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  user.resetPasswordToken = hashedToken
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS)
  await user.save()

  if (env.NODE_ENV !== 'production') {
    logger.info({ resetToken: rawToken, email }, 'Password reset token (dev only)')
    return
  }

  // In production, send via Resend
  // The email integration is handled by a dedicated email service module.
  // Import and call it here when implemented.
  logger.info({ email }, 'Password reset email would be sent in production')
}
