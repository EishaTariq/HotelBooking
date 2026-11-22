import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

// POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;
    const hotel = await Hotel.findOne({ owner: req.auth().userId });

    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found for this owner" });
    }

    if (!req.files || req.files.length === 0) {
      return res.json({ success: false, message: "Please upload at least one image" });
    }

    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    const images = await Promise.all(uploadImages);

    let parsedAmenities = [];
    try {
      parsedAmenities = Array.isArray(amenities)
        ? amenities
        : JSON.parse(amenities || "[]");
    } catch {
      parsedAmenities = [];
    }

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: Number(pricePerNight),
      amenities: parsedAmenities,
      images,
      isAvailable: true,
    });

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "image username email",
        },
      })
      .sort({ createdAt: -1 });

    // Filter out any rooms whose hotel reference is missing or null
    const validRooms = rooms.filter((r) => r.hotel !== null);

    res.json({ success: true, rooms: validRooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/rooms/owner
export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ owner: req.auth().userId });
    if (!hotelData) {
      return res.json({ success: false, message: "Hotel not found" });
    }
    const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");
    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/rooms/toggle-availability
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);
    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }
    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();

    res.json({ success: true, message: "Room availability updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/rooms/seed - Optional endpoint to populate database with demo rooms if empty
export const seedRooms = async (req, res) => {
  try {
    const roomCount = await Room.countDocuments();
    if (roomCount > 0) {
      return res.json({
        success: true,
        message: "Database already has rooms",
        count: roomCount,
      });
    }

    // Create or find a default demo owner
    let demoOwner = await User.findById("demo_owner_id");
    if (!demoOwner) {
      demoOwner = await User.create({
        _id: "demo_owner_id",
        username: "Urbanza Host",
        email: "demo@quickstay.com",
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
        role: "hotelOwner",
        recentSearchedCities: ["New York", "Dubai"],
      });
    }

    // Create demo hotels
    const hotelNY = await Hotel.create({
      name: "Urbanza Suites",
      address: "123 Broadway Avenue, Manhattan",
      contact: "+1 234 567 8900",
      city: "New York",
      owner: demoOwner._id,
    });

    const hotelDubai = await Hotel.create({
      name: "Grand Horizon Palace",
      address: "Marina Promenade, Dubai Marina",
      contact: "+971 4 123 4567",
      city: "Dubai",
      owner: demoOwner._id,
    });

    const defaultImages = [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800",
    ];

    await Room.create([
      {
        hotel: hotelNY._id,
        roomType: "Double Bed",
        pricePerNight: 399,
        amenities: ["Room Service", "Mountain View", "Pool Access"],
        images: defaultImages,
        isAvailable: true,
      },
      {
        hotel: hotelNY._id,
        roomType: "Double Bed",
        pricePerNight: 299,
        amenities: ["Room Service", "Free WiFi", "Free Breakfast"],
        images: [defaultImages[1], defaultImages[2], defaultImages[0], defaultImages[3]],
        isAvailable: true,
      },
      {
        hotel: hotelDubai._id,
        roomType: "Luxury Room",
        pricePerNight: 499,
        amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Room Service"],
        images: [defaultImages[2], defaultImages[3], defaultImages[0], defaultImages[1]],
        isAvailable: true,
      },
      {
        hotel: hotelDubai._id,
        roomType: "Single Bed",
        pricePerNight: 199,
        amenities: ["Free WiFi", "Room Service"],
        images: [defaultImages[3], defaultImages[0], defaultImages[1], defaultImages[2]],
        isAvailable: true,
      },
    ]);

    res.json({ success: true, message: "Database seeded successfully with demo rooms" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
