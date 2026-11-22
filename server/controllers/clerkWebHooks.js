import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("CLERK_WEBHOOK_SECRET not defined in environment variables");
      return res.status(400).json({ success: false, message: "Webhook secret missing" });
    }

    const whook = new Webhook(webhookSecret);
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = req.body.toString();
    whook.verify(payload, headers);

    const evt = JSON.parse(payload);
    const { data, type } = evt;

    console.log("Clerk Event type:", type);

    switch (type) {
      case "user.created":
      case "user.updated": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          username:
            `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
            data.username ||
            "Guest",
          image: data.image_url || "",
        };
        // Use upsert to avoid duplicate key errors on retry
        await User.findByIdAndUpdate(data.id, userData, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        });
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
