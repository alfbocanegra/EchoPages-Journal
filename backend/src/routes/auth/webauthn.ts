import { Router, Request, Response, NextFunction } from 'express';
import { WebAuthnController } from '../../controllers/auth/WebAuthnController';
import { WebAuthnService } from '../../services/auth/WebAuthnService';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../../repositories/UserRepository';
import { requireAuth } from '../../middleware/auth';

const router = Router();

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Initialize WebAuthn service and controller
const webAuthnConfig = {
  rpName: process.env.WEBAUTHN_RP_NAME!,
  rpID: process.env.WEBAUTHN_RP_ID!,
  origin: process.env.WEBAUTHN_ORIGIN!,
  expectedOrigin: process.env.WEBAUTHN_EXPECTED_ORIGIN,
  timeout: process.env.WEBAUTHN_TIMEOUT ? parseInt(process.env.WEBAUTHN_TIMEOUT) : undefined
};

const userRepository = getCustomRepository(UserRepository);
const webAuthnService = new WebAuthnService(userRepository, webAuthnConfig);
const webAuthnController = new WebAuthnController(webAuthnService);

const wrapHandler = (handler: Function): AsyncRequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// Registration endpoints
router.post(
  '/register/start',
  requireAuth as AsyncRequestHandler,
  wrapHandler(webAuthnController.startRegistration.bind(webAuthnController))
);

router.post(
  '/register/complete',
  requireAuth as AsyncRequestHandler,
  wrapHandler(webAuthnController.completeRegistration.bind(webAuthnController))
);

// Authentication endpoints
router.post(
  '/authenticate/start',
  wrapHandler(webAuthnController.startAuthentication.bind(webAuthnController))
);

router.post(
  '/authenticate/complete',
  wrapHandler(webAuthnController.completeAuthentication.bind(webAuthnController))
);

export default router; 