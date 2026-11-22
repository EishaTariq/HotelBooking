import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/react";
import toast from "react-hot-toast";
import { roomsDummyData } from "../assets/assets";

// Normalize backend URL by removing any trailing slash
const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
if (backendBaseUrl) {
  axios.defaults.baseURL = backendBaseUrl;
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  // Initialize with roomsDummyData so Featured Destination & Recommended Hotels always show
  const [rooms, setRooms] = useState(roomsDummyData);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data && data.success && Array.isArray(data.rooms) && data.rooms.length > 0) {
        setRooms(data.rooms);
      } else {
        // Fallback to dummy data if DB is empty so the site displays content
        setRooms(roomsDummyData);
      }
    } catch (error) {
      console.warn("Could not fetch live rooms, displaying demo rooms:", error.message);
      setRooms(roomsDummyData);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities || []);
      }
    } catch (error) {
      console.error("fetchUser error:", error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUser();
    }
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
    fetchRooms,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
