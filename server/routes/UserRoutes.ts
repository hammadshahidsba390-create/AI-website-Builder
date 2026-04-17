import express from 'express';
import { createUserProject, getusercredits, getUserProject, getUserProjects, purchaseCredits, togglePublish } from '../controllers/UserController.js';
import { protect } from '../middleware/auth.js';

const userRouter=express.Router();

userRouter.get('/credits', protect, getusercredits)
userRouter.post('/project', protect, createUserProject)
userRouter.get('/project/:projectId', protect, getUserProject)
userRouter.get('/projects',protect,getUserProjects)
userRouter.get('/publish-toggle/:projectId',protect,togglePublish)
userRouter.post('/purchase-credits',protect,purchaseCredits)

export default userRouter