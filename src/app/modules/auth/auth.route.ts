import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

router.post('/register', AuthController.registerUser);
router.post('/verify-email', AuthController.verifyPatient);

router.post('/login', AuthController.loginUser);
router.post('/forget-password', AuthController.forgetPassword);
router.post(
  '/reset-password',
  // ValidateRequest(userValidation.PasswordResetZodSchema),
  AuthController.resetPassword
);

export const AuthRoutes = router;
