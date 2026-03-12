import { Router, Request, Response, NextFunction } from 'express';
import { WebAuthnController } from '../../controllers/auth/WebAuthnController';
import { WebAuthnService } from '../../services/auth/WebAuthnService';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../../repositories/UserRepository';
import { requireAuth } from '../../middleware/auth';

const router = Router();

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Lazy initialization of WebAuthn services
let webAuthnController: WebAuthnController;

const getWebAuthnController = (): WebAuthnController => {
  if (!webAuthnController) {
    const webAuthnConfig = {
      rpName: process.env.WEBAUTHN_RP_NAME || 'EchoPages Journal',
      rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
      origin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
      expectedOrigin: process.env.WEBAUTHN_EXPECTED_ORIGIN,
      timeout: process.env.WEBAUTHN_TIMEOUT ? parseInt(process.env.WEBAUTHN_TIMEOUT) : undefined,
    };

    const userRepository = getCustomRepository(UserRepository);
    const webAuthnService = new WebAuthnService(userRepository, webAuthnConfig);
    webAuthnController = new WebAuthnController(webAuthnService);
  }
  return webAuthnController;
};

const wrapHandler = (
  handler: (req: Request, res: Response) => Promise<unknown>
): AsyncRequestHandler => {
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
  wrapHandler((req: Request, res: Response) => getWebAuthnController().startRegistration(req, res))
);

router.post(
  '/register/complete',
  requireAuth as AsyncRequestHandler,
  wrapHandler((req: Request, res: Response) =>
    getWebAuthnController().completeRegistration(req, res)
  )
);

// Authentication endpoints
router.post(
  '/authenticate/start',
  wrapHandler((req: Request, res: Response) =>
    getWebAuthnController().startAuthentication(req, res)
  )
);

router.post(
  '/authenticate/complete',
  wrapHandler((req: Request, res: Response) =>
    getWebAuthnController().completeAuthentication(req, res)
  )
);

export default router;
