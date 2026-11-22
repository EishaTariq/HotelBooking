import React, { useState } from 'react';
import { useAppContext } from "../context/AppContext";
import { assets, cities } from "../assets/assets";

const Hero = () => {
  const { navigate, getToken, axios, setSearchedCities } = useAppContext();
  const [destination, setDestination] = useState("");

  const onSearch = async (e) => {
    e.preventDefault();
    navigate(`/rooms?destination=${encodeURIComponent(destination)}`);

    try {
      const token = await getToken();
      if (token && destination) {
        await axios.post(
          "/api/user/store-recent-search",
          { recentSearchedCity: destination },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchedCities((prevSearchedCities) => {
          const updated = [...prevSearchedCities, destination];
          if (updated.length > 3) {
            updated.shift();
          }
          return updated;
        });
      }
    } catch (error) {
      console.warn("Could not save recent search:", error.message);
    }
  };

  return (
    <div className='flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url("/src/assets/heroImage.png")] bg-no-repeat bg-cover bg-center h-screen'>
      <p className='bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20 text-sm'>
        The Ultimate Hotel Experience
      </p>
      <h1 className='font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4'>
        Discover Your Perfect Getaway Destination
      </h1>
      <p className='max-w-130 mt-2 text-sm md:text-base'>
        Unparalleled luxury and comfort await at the world's most exclusive hotels and resorts. Start your journey today.
      </p>

      <form
        onSubmit={onSearch}
        className='bg-white text-gray-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto shadow-lg'
      >
        <div>
          <div className='flex items-center gap-2'>
            <img src={assets.locationIcon} alt="Destination" className="h-4" />
            <label htmlFor="destinationInput" className="text-sm font-medium">Destination</label>
          </div>
          <input
            list='destinations'
            id="destinationInput"
            onChange={(e) => setDestination(e.target.value)}
            value={destination}
            type="text"
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none text-gray-800"
            placeholder="Type city here"
            required
          />
          <datalist id='destinations'>
            {cities.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </div>

        <div>
          <div className='flex items-center gap-2'>
            <img src={assets.calenderIcon} alt="Calendar" className="h-4" />
            <label htmlFor="checkIn" className="text-sm font-medium">Check in</label>
          </div>
          <input
            id="checkIn"
            type="date"
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none text-gray-800"
          />
        </div>

        <div>
          <div className='flex items-center gap-2'>
            <img src={assets.calenderIcon} alt="Calendar" className="h-4" />
            <label htmlFor="checkOut" className="text-sm font-medium">Check out</label>
          </div>
          <input
            id="checkOut"
            type="date"
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none text-gray-800"
          />
        </div>

        <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
          <label htmlFor="guests" className="text-sm font-medium">Guests</label>
          <input
            min={1}
            max={6}
            id="guests"
            type="number"
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16 text-gray-800"
            placeholder="1"
            defaultValue={1}
          />
        </div>

        <button
          type="submit"
          className='flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-2 hover:bg-neutral-800 transition-all'
        >
          <img src={assets.searchIcon} alt="Search" className="h-5" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default Hero;
