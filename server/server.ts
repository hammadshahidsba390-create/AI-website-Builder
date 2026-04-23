import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/UserRoutes.js';
 controllers-or-stripe-add
import projectRouter from './routes/ProjectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhooks.js';

import projectRouter from './routes/projectRoute.js';
 main

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: [...(process.env.TRUSTED_ORIGINS?.split(',') || []), 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
};

app.use(cors(corsOptions));
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhook); 

// Global middleware only after Stripe webhook
app.use(express.json({ limit: '50mb' }));

app.all('/api/auth/*', toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
    res.send('AI Website Builder Server is Live!');
});
 controllers-or-stripe-add

app.use('/api/user', userRouter);
app.use('/api/projects', projectRouter);

app.use('/api/user',userRouter);
app.use('/api/project', projectRouter);
 main

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});