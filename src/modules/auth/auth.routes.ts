import { Router } from 'express';
import {
  registerController,
  loginController,
  googleAuthController,
  googleCallbackController,
} from './auth.controller';

const router = Router();

router.post('/regiter/', registerController);
router.post('/login', loginController);
router.get('/google', googleAuthController);
router.get('/google/callback', ...googleCallbackController);
