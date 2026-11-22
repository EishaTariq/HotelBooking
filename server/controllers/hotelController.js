import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// POST /api/hotels
export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    const existingHotel = await Hotel.findOne({ owner });
    if (existingHotel) {
      return res.json({ success: false, message: "Hotel Already Registered" });
    }

    const hotel = await Hotel.create({ name, address, contact, city, owner });
    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    res.json({ success: true, message: "Hotel Registered Successfully", hotel });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
