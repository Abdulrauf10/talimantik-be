// import { Router } from 'express';
// import { requireAuth } from '../middleware/requireAuth';
// import { requireRole } from '../middleware/requireRole';
// import {
//   meController,
//   getAllUsersController,
//   updateUserController,
// } from './user.controller';

// const router = Router();

// router.get('/me', requireAuth, meController);
// router.get(
//   '/users',
//   requireAuth,
//   requireRole('user_admin'),
//   getAllUsersController,
// );
// router.put(
//   '/users/:id',
//   requireAuth,
//   requireRole('user_admin'),
//   updateUserController,
// );

// export default router;
