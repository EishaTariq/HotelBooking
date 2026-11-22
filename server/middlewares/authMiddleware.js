import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

export const protect = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    let user = await User.findById(userId);

    // Auto-sync user if authenticated in Clerk but not yet saved in MongoDB (e.g. if webhook wasn't triggered)
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
        const username =
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.username ||
          "Guest";
        const image = clerkUser.imageUrl || "";

        user = await User.create({
          _id: userId,
          email,
          username,
          image,
          role: "user",
          recentSearchedCities: [],
        });
      } catch (clerkErr) {
        console.warn("Could not fetch user details from Clerk, creating placeholder user:", clerkErr.message);
        user = await User.create({
          _id: userId,
          email: "",
          username: "Guest",
          image: "",
          role: "user",
          recentSearchedCities: [],
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
