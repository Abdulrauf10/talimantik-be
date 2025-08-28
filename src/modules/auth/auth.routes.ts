import { Router } from 'express';
import {
  registerController,
  loginController,
  googleAuthController,
  googleCallbackController,
  forgotPasswordController,
  resetPasswordController,
} from './auth.controller';

const router = Router();

router.post('/regiter/', registerController);
router.post('/login', loginController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.get('/google', googleAuthController);
router.get('/google/callback', ...googleCallbackController);
