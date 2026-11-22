import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../configs/nodemailer.js";
import Stripe from "stripe";

// Helper function to check room availability
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });
    return bookings.length === 0;
  } catch (error) {
    console.error("checkAvailability error:", error.message);
    return false;
  }
};

// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/bookings/book
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
    if (!isAvailable) {
      return res.json({ success: false, message: "Room is not available for these dates" });
    }

    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData || !roomData.hotel) {
      return res.json({ success: false, message: "Selected room or hotel not found" });
    }

    let totalPrice = roomData.pricePerNight;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    totalPrice *= nights > 0 ? nights : 1;

    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: Number(guests) || 1,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    if (process.env.SENDER_EMAIL && req.user.email) {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: req.user.email,
        subject: "Hotel Booking Details - QuickStay",
        html: `
          <h2>Your Booking Details</h2>
          <p>Dear ${req.user.username},</p>
          <p>Thank you for your booking! Here are your details:</p>
          <ul>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
            <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
            <li><strong>Location:</strong> ${roomData.hotel.address}</li>
            <li><strong>Check-In:</strong> ${booking.checkInDate.toDateString()}</li>
            <li><strong>Check-Out:</strong> ${booking.checkOutDate.toDateString()}</li>
            <li><strong>Booking Amount:</strong> $${booking.totalPrice}</li>
          </ul>
          <p>We look forward to welcoming you!</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.warn("Email notification skipped/failed:", mailErr.message);
      }
    }

    res.json({ success: true, message: "Booking created successfully", bookingId: booking._id });
  } catch (error) {
    res.json({ success: false, message: error.message || "Failed to create booking" });
  }
};

// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    // Filter out corrupted bookings where room or hotel was deleted
    const validBookings = bookings.filter((b) => b.room && b.hotel);

    res.json({ success: true, bookings: validBookings });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

// GET /api/bookings/hotel
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth().userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }
    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.totalPrice || 0), 0);

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, bookings },
    });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

// POST /api/bookings/stripe-payment
export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    const roomData = await Room.findById(booking.room).populate("hotel");
    if (!roomData || !roomData.hotel) {
      return res.json({ success: false, message: "Room details not found" });
    }

    const totalPrice = booking.totalPrice;
    const origin = req.headers.origin || "http://localhost:5173";

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.json({ success: false, message: "Stripe key not configured on server" });
    }

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${roomData.hotel.name} - ${roomData.roomType}`,
          },
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      metadata: {
        bookingId,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message || "Payment Failed" });
  }
};
