import prisma from '../lib/prisma.js';
import Stripe from 'stripe';
// Get user credits 
export const getusercredits = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized user' });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        res.json({ credits: user?.credits });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};
// controller function to purchase credits
export const purchaseCredits = async (req, res) => {
    try {
        const plans = {
            basic: { credits: 100, amount: 5 },
            pro: { credits: 400, amount: 19 },
            Enterprise: { credits: 1000, amount: 49 }
        };
        const userId = req.userId;
        const { planId } = req.body;
        const origin = req.headers.origin;
        const plan = plans[planId];
        if (!plan) {
            return res.status(400).json({ message: 'Plan not found' });
        }
        const transaction = await prisma.transaction.create({
            data: {
                userId: userId,
                planId: req.body.planId,
                amount: plan.amount,
                credits: plan.credits
            }
        });
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `AiSiteBuilder-${plan.credits} Credits`
                        },
                        unit_amount: Math.floor(transaction.amount * 100)
                    },
                    quantity: 1
                },
            ],
            mode: 'payment',
            metadata: {
                transactionId: transaction.id,
                appId: 'AiSiteBuilder'
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60 //Expires in 30 minutes
        });
        res.json({ payment_link: session.url });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};
