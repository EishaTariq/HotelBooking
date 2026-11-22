import React, { useState } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const HotelReg = () => {
  const { setShowHotelReg, axios, getToken, setIsOwner, navigate } = useAppContext();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Please sign in first");
        return;
      }

      const { data } = await axios.post(
        "/api/hotels",
        { name, contact, address, city },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsOwner(true);
        setShowHotelReg(false);
        if (navigate) navigate("/owner");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowHotelReg(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex bg-white rounded-xl max-w-4xl w-full max-md:mx-2 overflow-hidden shadow-2xl"
      >
        <img
          src={assets.regImage}
          alt="reg-image"
          className="w-1/2 rounded-l-xl hidden md:block object-cover"
        />

        <div className="relative flex flex-col items-center w-full md:w-1/2 p-8 md:p-10">
          <img
            src={assets.closeIcon}
            alt="close-icon"
            className="absolute top-4 right-4 h-4 w-4 cursor-pointer hover:opacity-75"
            onClick={() => setShowHotelReg(false)}
          />
          <p className="text-2xl font-semibold mt-4">Register Your Hotel</p>

          {/* Hotel Name */}
          <div className="w-full mt-4">
            <label htmlFor="name" className="font-medium text-gray-700 text-sm">
              Hotel Name
            </label>
            <input
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="e.g. Grand Horizon Palace"
              className="border border-gray-200 rounded w-full px-3 py-2 mt-1 outline-blue-500 font-light text-sm"
              required
            />
          </div>

          {/* Phone */}
          <div className="w-full mt-3">
            <label htmlFor="contact" className="font-medium text-gray-700 text-sm">
              Phone
            </label>
            <input
              id="contact"
              onChange={(e) => setContact(e.target.value)}
              value={contact}
              type="text"
              placeholder="e.g. +1 234 567 8900"
              className="border border-gray-200 rounded w-full px-3 py-2 mt-1 outline-blue-500 font-light text-sm"
              required
            />
          </div>

          {/* Address */}
          <div className="w-full mt-3">
            <label htmlFor="address" className="font-medium text-gray-700 text-sm">
              Address
            </label>
            <input
              id="address"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              type="text"
              placeholder="e.g. 123 Luxury Boulevard"
              className="border border-gray-200 rounded w-full px-3 py-2 mt-1 outline-blue-500 font-light text-sm"
              required
            />
          </div>

          {/* Select City Drop Down */}
          <div className="w-full mt-3">
            <label htmlFor="city" className="font-medium text-gray-700 text-sm">
              City
            </label>
            <select
              id="city"
              onChange={(e) => setCity(e.target.value)}
              value={city}
              className="border border-gray-200 rounded w-full px-3 py-2 mt-1 outline-blue-500 font-light text-sm"
              required
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black hover:bg-neutral-800 transition-all text-white w-full py-2.5 rounded cursor-pointer mt-6 font-medium text-sm disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;
