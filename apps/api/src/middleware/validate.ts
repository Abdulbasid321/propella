import type { Request, Response, NextFunction, RequestHandler } from 'express'
import type { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const error = result.error as ZodError
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))

      res.status(400).json({
        error: 'Validation failed',
        details,
      })
      return
    }

    req.body = result.data
    next()
  }
}
