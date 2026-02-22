import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        userId: session.metadata.userId,
        customerId: session.customer,
        subscriptionId: session.subscription,
      });
    }

    return res.status(200).json({ success: false });
  } catch (error) {
    console.error('Verify session error:', error);
    return res.status(500).json({ error: error.message });
  }
}
