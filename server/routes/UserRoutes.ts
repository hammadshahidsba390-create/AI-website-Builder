import express from 'express';
import { getusercredits, purchaseCredits } from '../controllers/UserController.js';
import { protect } from '../middleware/auth.js';

const userRouter = express.Router();

 for-live-into-vercel

controllers-or-stripe-add
userRouter.get('/credits', protect, getusercredits);
userRouter.post('/purchase-credits', protect, purchaseCredits);

 main
userRouter.get('/credits', protect, getusercredits)
userRouter.post('/project', protect, createUserProject)
userRouter.get('/project/:projectId', protect, getUserProject)
userRouter.get('/projects',protect,getUserProjects)
userRouter.get('/publish-toggle/:projectId',protect,togglePublish)
userRouter.post('/purchase-credits',protect,purchaseCredits)
 main

export default userRouter;