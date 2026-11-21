import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  /*User website par signup karta hai.
Clerk user create karta hai.
Clerk user.created event generate karta hai.
Clerk tumhare Node.js backend ko user ki details send karta hai.
Backend MongoDB mein user save kar deta hai. */
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    /**1. Webhook — Svix library ki ek class hai.
2. new Webhook(...) — is class ka naya object (instance) create karta hai.
3. process.env.CLERK_WEBHOOK_SECRET — Clerk se milne wala secret key hai.
4. whook — us object ka variable/reference hai jiske through hum methods use karte hain.
Instance kya hota hai? */
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = req.body.toString();
    const evt = whook.verify(payload, headers);
    const { data, type } = evt;

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Guest",
      image: data.image_url,
    };

    switch (type) {
      case "user.created": {
        await User.create(userData);
        break;
      }
      case "user.updated": {
        await User.findByIdAndUpdate(data.id, userData);
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }
      default:
        break;
    }

    res.json({ success: true, message: "Webhook Received" });
  } catch (error) {
    console.error("Clerk Webhook Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;