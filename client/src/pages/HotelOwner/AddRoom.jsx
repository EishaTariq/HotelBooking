import React, { useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

const AddRoom = () => {
  const { axios, getToken, fetchRooms, navigate } = useAppContext();

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [inputs, setInputs] = useState({
    roomType: "",
    pricePerNight: "",
    amenities: {
      "Free WiFi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (
      !inputs.roomType ||
      !inputs.pricePerNight ||
      !Object.values(images).some((image) => image)
    ) {
      toast.error("Please fill in all details and upload at least one image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("roomType", inputs.roomType);
      formData.append("pricePerNight", inputs.pricePerNight);

      const selectedAmenities = Object.keys(inputs.amenities).filter(
        (key) => inputs.amenities[key]
      );
      formData.append("amenities", JSON.stringify(selectedAmenities));

      Object.keys(images).forEach((key) => {
        if (images[key]) {
          formData.append("images", images[key]);
        }
      });

      const token = await getToken();
      const { data } = await axios.post("/api/rooms", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message);
        // Refresh global rooms state so Home and Rooms pages show the newly created room immediately!
        if (fetchRooms) fetchRooms();
        setInputs({
          roomType: "",
          pricePerNight: "",
          amenities: {
            "Free WiFi": false,
            "Free Breakfast": false,
            "Room Service": false,
            "Mountain View": false,
            "Pool Access": false,
          },
        });
        setImages({ 1: null, 2: null, 3: null, 4: null });
        if (navigate) navigate("/owner/list-room");
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
    <form onSubmit={onSubmitHandler}>
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in the details carefully and provide accurate room details, pricing, and amenities to enhance the user booking experience."
      />

      {/* Upload Area For Images */}
      <p className="text-gray-800 mt-10 font-medium">Images</p>
      <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key} className="cursor-pointer">
            {images[key] ? (
              <img
                className="h-24 w-32 object-cover rounded border border-gray-300"
                src={URL.createObjectURL(images[key])}
                alt="Preview"
              />
            ) : (
              <div className="h-24 w-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-black transition-colors">
                <img src={assets.uploadArea} alt="Upload" className="w-8 h-8 opacity-60" />
                <span className="text-xs mt-1">Upload</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              id={`roomImage${key}`}
              hidden
              onChange={(e) => setImages({ ...images, [key]: e.target.files[0] })}
            />
          </label>
        ))}
      </div>

      <div className="w-full flex max-sm:flex-col sm:gap-4 mt-4">
        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4 font-medium">Room Type</p>
          <select
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
            className="border border-gray-300 mt-1 rounded p-2 w-full outline-none"
            required
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div>
          <p className="mt-4 text-gray-800 font-medium">
            Price <span className="text-xs">/night</span>
          </p>
          <input
            type="number"
            min="1"
            placeholder="0"
            className="border border-gray-300 mt-1 rounded p-2 w-28 outline-none"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({ ...inputs, pricePerNight: e.target.value })
            }
            required
          />
        </div>
      </div>

      <p className="text-gray-800 mt-6 font-medium">Amenities</p>
      <div className="flex flex-col flex-wrap mt-2 text-gray-500 max-w-sm gap-2">
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`amenities${index + 1}`}
              checked={inputs.amenities[amenity]}
              onChange={() =>
                setInputs({
                  ...inputs,
                  amenities: {
                    ...inputs.amenities,
                    [amenity]: !inputs.amenities[amenity],
                  },
                })
              }
            />
            <label htmlFor={`amenities${index + 1}`} className="cursor-pointer select-none">
              {amenity}
            </label>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="bg-black text-white px-8 py-2.5 rounded mt-8 cursor-pointer disabled:opacity-60 transition-all hover:bg-neutral-800"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Room"}
      </button>
    </form>
  );
};

export default AddRoom;
