import express from 'express';
import { getusercredits, purchaseCredits } from '../controllers/UserController.js';
import { protect } from '../middleware/auth.js';
const userRouter = express.Router();
userRouter.get('/credits', protect, getusercredits);
userRouter.post('/purchase-credits', protect, purchaseCredits);
export default userRouter;
