import React from "react";
import {assets} from "../assets/assets";


const StarRating = ({ rating = 4 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array(5)
        .fill("")
        .map((_, index) => (
          <img  src={index < rating ? assets.starIconFilled : assets.starIconEmpty}
            alt={index < rating ? "Filled Star" : "Empty Star"}
            
            className="w-4 h-4"
          />
        ))}
    </div>
  );
};

export default StarRating;