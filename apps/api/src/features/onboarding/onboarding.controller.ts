import type { Request, Response, NextFunction } from 'express'
import type {
  OnboardingStep1Input,
  OnboardingStep2JambInput,
  OnboardingStep2WaecInput,
  OnboardingStep3Input,
  OnboardingStep4Input,
  OnboardingStep5Input,
  OnboardingStep6Input,
} from '@propella/shared'
import * as onboardingService from './onboarding.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const status = await onboardingService.getStatus(userId)
    res.status(200).json({ data: status })
  } catch (err) {
    next(err)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypedBodyRequest<T> = Request<Record<string, any>, any, T>

export async function step1(
  req: TypedBodyRequest<OnboardingStep1Input>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await onboardingService.saveStep1(userId, req.body)
    res.status(200).json({ data: { step: 1 } })
  } catch (err) {
    next(err)
  }
}

export async function step2Jamb(
  req: TypedBodyRequest<OnboardingStep2JambInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await onboardingService.saveStep2Jamb(userId, req.body)
    res.status(200).json({ data: { step: 2 } })
  } catch (err) {
    next(err)
  }
}

export async function step2Waec(
  req: TypedBodyRequest<OnboardingStep2WaecInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await onboardingService.saveStep2Waec(userId, req.body)
    res.status(200).json({ data: { step: 2 } })
  } catch (err) {
    next(err)
  }
}

export async function step3(
  req: TypedBodyRequest<OnboardingStep3Input>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await onboardingService.saveStep3(userId, req.body)
    res.status(200).json({ data: { step: 3 } })
  } catch (err) {
    next(err)
  }
}

export async function step4(
  req: TypedBodyRequest<OnboardingStep4Input>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await onboardingService.saveStep4(userId, req.body)
    res.status(200).json({ data: { step: 4 } })
  } catch (err) {
    next(err)
  }
}

export async function step5(
  req: TypedBodyRequest<OnboardingStep5Input>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await onboardingService.saveStep5(userId, req.body)
    res.status(200).json({ data: { step: 5 } })
  } catch (err) {
    next(err)
  }
}

export async function step6(
  req: TypedBodyRequest<OnboardingStep6Input>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await onboardingService.saveStep6(userId, req.body)
    res.status(200).json({ data: { step: 6 } })
  } catch (err) {
    next(err)
  }
}

export async function complete(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const result = await onboardingService.completeOnboarding(userId)
    res.status(200).json({ data: result })
  } catch (err) {
    next(err)
  }
}
