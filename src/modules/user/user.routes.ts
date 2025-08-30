// src/modules/user/user.routes.ts
import { Router } from 'express';
import {
  getMeController,
  getUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
} from './user.controller';
import { requireAuth } from '../../core/middleware/requireAuth';

const router = Router();

router.get('/me', requireAuth, getMeController);
router.get('/', requireAuth, getUsersController);
router.post('/', requireAuth, createUserController);
router.put('/:id', requireAuth, updateUserController);
router.delete('/:id', requireAuth, deleteUserController);

export default router;
