import React from "react";
import {assets} from "../assets/assets";

const Footer = () => {
  return (
    <div className="bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-wrap justify-between gap-12 md:gap-6">
        {/* Brand & Socials */}
        <div className="max-w-80">
          
            <img src={assets.logo} alt="QuickStay Logo" className="mb-4 h-8 md:h-10 text-primary invert opacity-80" />
           
          </div>
          <p className="text-sm">
            Discover the world&apos;s most extraordinary places to stay, from
            boutique hotels to luxury villas and private islands.
          </p>

          {/* Social Icons (Instagram, Facebook, Twitter, LinkedIn) */}
          <div className="flex items-center gap-3 mt-4">
            {/* Instagram */}
            <a href="#" aria-label="Instagram" className="hover:text-gray-800 transition-colors">
              <img src={assets.instagramIcon} alt="Instagram" className="w-6 h-6" />
            </a>
            {/* Facebook */}
            <a href="#" aria-label="Facebook" className="hover:text-gray-800 transition-colors">
              <img src={assets.facebookIcon} alt="Facebook" className="w-6 h-6" />
              
            </a>
            {/* Twitter */}
            <a href="#" aria-label="Twitter" className="hover:text-gray-800 transition-colors">
              <img src={assets.twitterIcon} alt="Twitter" className="w-6 h-6" />
            </a>
            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn" className="hover:text-gray-800 transition-colors">
              <img src={assets.linkedInIcon} alt="LinkedIn" className="w-6 h-6" />
            </a>
          
        </div>

        {/* Company Links */}
        <div>
          <p className="font-playfair text-lg text-gray-800">COMPANY</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li><a href="#" className="hover:text-gray-800">About</a></li>
            <li><a href="#" className="hover:text-gray-800">Careers</a></li>
            <li><a href="#" className="hover:text-gray-800">Press</a></li>
            <li><a href="#" className="hover:text-gray-800">Blog</a></li>
            <li><a href="#" className="hover:text-gray-800">Partners</a></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <p className="font-playfair text-lg text-gray-800">SUPPORT</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li><a href="#" className="hover:text-gray-800">Help Center</a></li>
            <li><a href="#" className="hover:text-gray-800">Safety Information</a></li>
            <li><a href="#" className="hover:text-gray-800">Cancellation Options</a></li>
            <li><a href="#" className="hover:text-gray-800">Contact Us</a></li>
            <li><a href="#" className="hover:text-gray-800">Accessibility</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="max-w-80">
          <p className="font-playfair text-lg text-gray-800">STAY UPDATED</p>
          <p className="mt-3 text-sm">
            Subscribe to our newsletter for inspiration and special offers.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center mt-4">
            <input
              type="email"
              className="bg-white rounded-l border border-gray-300 h-9 px-3 outline-none text-sm text-gray-700 w-full"
              placeholder="Your email"
              required
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r text-white cursor-pointer hover:bg-gray-800 transition-colors"
            >
              <img src={assets.arrowIcon} alt="arrow" className="w-4 h-4 invert" />
               
               
            
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <hr className="border-gray-300 mt-8" />
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-5 text-sm">
        <p>© {new Date().getFullYear()} QuickStay. All rights reserved.</p>
        <ul className="flex items-center gap-4">
          <li><a href="#" className="hover:text-gray-800">Privacy</a></li>
          <li><a href="#" className="hover:text-gray-800">Terms</a></li>
          <li><a href="#" className="hover:text-gray-800">Sitemap</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;