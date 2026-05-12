import { Router, type IRouter } from 'express'
import { validate } from '../../middleware/validate'
import {
  OnboardingStep1Schema,
  OnboardingStep2JambSchema,
  OnboardingStep2WaecSchema,
  OnboardingStep3Schema,
  OnboardingStep4Schema,
  OnboardingStep5Schema,
  OnboardingStep6Schema,
} from '@propella/shared'
import * as onboardingController from './onboarding.controller'

const router: IRouter = Router()

// GET /api/onboarding/status
router.get('/status', onboardingController.getStatus)

// POST /api/onboarding/step/1
router.post(
  '/step/1',
  validate(OnboardingStep1Schema),
  onboardingController.step1,
)

// POST /api/onboarding/step/2 — JAMB path
router.post(
  '/step/2/jamb',
  validate(OnboardingStep2JambSchema),
  onboardingController.step2Jamb,
)

// POST /api/onboarding/step/2 — WAEC/NECO path
router.post(
  '/step/2/waec',
  validate(OnboardingStep2WaecSchema),
  onboardingController.step2Waec,
)

// POST /api/onboarding/step/3
router.post(
  '/step/3',
  validate(OnboardingStep3Schema),
  onboardingController.step3,
)

// POST /api/onboarding/step/4
router.post(
  '/step/4',
  validate(OnboardingStep4Schema),
  onboardingController.step4,
)

// POST /api/onboarding/step/5
router.post(
  '/step/5',
  validate(OnboardingStep5Schema),
  onboardingController.step5,
)

// POST /api/onboarding/step/6
router.post(
  '/step/6',
  validate(OnboardingStep6Schema),
  onboardingController.step6,
)

// POST /api/onboarding/complete
router.post('/complete', onboardingController.complete)

export default router
