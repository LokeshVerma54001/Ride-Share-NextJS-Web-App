import React, { useState } from 'react'


interface Location {
  lng: number;
  lat: number;
  place_name?: string;
}

interface Key {
  id: number;
  place_name: string;
  center: [number, number];
}

const PassangerDetails = ({onLocationSelect}: { onLocationSelect: (location: Location) => void;}) => {

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Key[]>([]);
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);

    if (query.length > 2) {
      const apiKey = process.env.NEXT_PUBLIC_MAP_TILER_API;
      if (apiKey) {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${query}.json?key=${apiKey}`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowDropdown(true); // Show dropdown when suggestions are available
      }
    } else {
      setSuggestions([]);
      setShowDropdown(false); // Hide dropdown when input is too short
    }
  };

  const handleSelect = (place: Key) => {
    setInputValue(place.place_name); // Set selected place name as input value
    onLocationSelect({
      lng: place.center[0],
      lat: place.center[1],
    });
    setSuggestions([]); // Clear suggestions
    setShowDropdown(false); // Hide dropdown
  };

  return (
<div className='pt-20 pb-20 md:justify-center md:pt-0 flex flex-col items-center w-full relative gap-5'>
  <h1 className='font-bold text-xl w-[90%] text-center'>Enter Your Location So We Can Find Passangers Near You</h1>
      <div className='w-full flex flex-col items-center gap-2'>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter Your Location"
        className="p-2 border rounded w-[90%] text-center"
      />
      {showDropdown && suggestions.length > 2 && (
        <ul className='absolute z-10 bg-white border border-gray-300 w-[90%] mt-[3rem]'>
          {suggestions.map((place: Key, index) => (
            <li
              key={index}
              onClick={() => handleSelect(place)} // Select place on click
              className='p-2 hover:bg-gray-200 cursor-pointer'
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      )}
      <button className="p-3 bg-black w-[90%] text-white rounded-lg">Search</button>
      </div>
    </div>
  )
}

export default PassangerDetails