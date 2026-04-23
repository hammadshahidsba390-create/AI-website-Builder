import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/UserRoutes.js';
import projectRouter from './routes/ProjectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhooks.js';
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials: true,
};
app.use(cors(corsOptions));
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
// Global middleware only after Stripe webhook
app.use(express.json({ limit: '50mb' }));
app.all('/api/auth/*', toNodeHandler(auth));
app.get('/', (req, res) => {
    res.send('AI Website Builder Server is Live!');
});
app.use('/api/user', userRouter);
app.use('/api/projects', projectRouter);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
