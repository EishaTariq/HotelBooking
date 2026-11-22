import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (req, res) => {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey) {
      return res.status(400).json({ success: false, message: "Stripe key not configured" });
    }

    const stripe = new Stripe(stripeKey);
    let event;

    if (endpointSecret) {
      const sig = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error("Stripe signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      // Fallback if STRIPE_WEBHOOK_SECRET is not configured
      try {
        event = JSON.parse(req.body.toString());
      } catch (err) {
        return res.status(400).send("Invalid webhook payload");
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          status: "confirmed",
        });
        console.log(`Booking ${bookingId} payment confirmed via Stripe`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
