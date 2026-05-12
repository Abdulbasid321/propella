import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface JwtPayload {
  id: string
  email: string
  plan: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed authorization header' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload
    req.user = { id: payload.id, email: payload.email, plan: payload.plan }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token' })
  }
}
