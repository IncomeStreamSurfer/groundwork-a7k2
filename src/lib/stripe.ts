import Stripe from 'stripe';

const stripeKey = import.meta.env.STRIPE_SECRET_KEY as string;

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
});
