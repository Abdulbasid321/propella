import type { Request, Response, NextFunction } from 'express'
import type { SignupInput, LoginInput, ForgotPasswordInput } from '@propella/shared'
import * as authService from './auth.service'
import { env } from '../../config/env'
import { AppError } from '../../middleware/error-handler'

const REFRESH_COOKIE_NAME = 'refresh_token'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: THIRTY_DAYS_MS,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  })
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  })
}

export async function signup(
  req: Request<object, object, SignupInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.signup(req.body)
    const tokens = authService.generateTokens(
      user._id.toString(),
      user.email,
      user.plan,
    )

    setRefreshCookie(res, tokens.refreshToken)

    res.status(201).json({
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          plan: user.plan,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          theme: user.theme,
          timezone: user.timezone,
          avatarUrl: user.avatarUrl,
        },
        accessToken: tokens.accessToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function login(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.login(req.body.email, req.body.password)
    const tokens = authService.generateTokens(
      user._id.toString(),
      user.email,
      user.plan,
    )

    setRefreshCookie(res, tokens.refreshToken)

    res.status(200).json({
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          plan: user.plan,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          theme: user.theme,
          timezone: user.timezone,
          avatarUrl: user.avatarUrl,
        },
        accessToken: tokens.accessToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    clearRefreshCookie(res)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME] as string | undefined

    if (!token) {
      throw new AppError(401, 'No refresh token provided')
    }

    const payload = authService.verifyRefreshToken(token)
    const tokens = authService.generateTokens(payload.id, payload.email, payload.plan)
    const user = await authService.getUserForRefresh(payload.id)

    setRefreshCookie(res, tokens.refreshToken)

    res.status(200).json({
      data: {
        accessToken: tokens.accessToken,
        user: user
          ? {
              id: (user as { _id: { toString(): string } })._id.toString(),
              name: user.name,
              email: user.email,
              plan: user.plan,
              onboardingCompleted: user.onboardingCompleted,
              onboardingStep: user.onboardingStep,
              theme: user.theme,
              timezone: user.timezone,
              avatarUrl: user.avatarUrl,
            }
          : null,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(
  req: Request<object, object, ForgotPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.forgotPassword(req.body.email)
    // Always return 200 — do not reveal whether the email exists
    res.status(200).json({
      data: { message: 'If that email is registered, a reset link has been sent' },
    })
  } catch (err) {
    next(err)
  }
}
