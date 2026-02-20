import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeInstance;
}

// Named export for convenience — only use in server contexts where STRIPE_SECRET_KEY is set
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get webhooks() { return getStripe().webhooks; },
  get billingPortal() { return getStripe().billingPortal; },
};
