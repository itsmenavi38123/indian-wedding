import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#222] text-gray-300 px-[15px] md:px-[20px] xl:px-[60px]">
      <div className="w-full mx-auto px-0 xl:px-6 py-12 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
        {/* Logo & About */}
        <div className="logo-side">
          <div className=" mb-3">
            <Image
              src="/logo.png"
              alt="Indian Weddings"
              className="max-w-[160px] md:max-w-[204px]"
              width={204}
              height={60}
            />
          </div>
          <p className="text-[14px] text-white mt-2 leading-[22px] font-montserrat">
            This platform serves as a trusted space for Indian wedding couples and vendors to
            connect, collaborate, and create unforgettable celebrations. While we strive to feature
            verified vendors and authentic reviews, we recommend users conduct their own due
            diligence before finalizing bookings. We are not responsible for any independent
            agreements made outside the platform.
          </p>
          <div className="flex gap-3 mt-4">
            <Image
              src="/landing/appstore.svg"
              alt="App Store"
              className="cursor-pointer"
              width={135}
              height={40}
            />
            <Image
              src="/landing/googleplay.svg"
              alt="Google Play"
              className="cursor-pointer"
              width={135}
              height={40}
            />
          </div>
        </div>

        {/* Our Services */}
        <div className="custom-link  xl:pl-28">
          <h3 className="text-white text-[24px] mb-4">Our Services</h3>
          <ul>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Personal Wedding Website
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Wedding Configurator
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Venue Discovery
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Vendor Matching & Booking
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Guest Management
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Flights + Hotels for Guests
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Live Wedding App
              </Link>
            </li>
          </ul>
        </div>

        {/* Useful Links */}
        <div className="usefull-link  xl:pl-28">
          <h3 className="text-white text-[24px] mb-4">Use Full Links</h3>
          <ul>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                About
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Terms and Condition
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white text-[16px] leading-[32px]">
                Refund and Returns Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="say-update">
          <h3 className="text-white text-[24px] mb-4">Stay update</h3>
          <p className="text-[15px] text-white mt-2 leading-[22px] font-montserrat mb-4">
            Sign up to our newsletter to receive exclusive offers.
          </p>
          <form className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full px-3 text-[16px] py-2 bg-[#222] rounded-[6px] h-[45px] border border-[rgba(252,251,246,0.65)] box-border text-white focus:outline-none focus:border-[rgba(255,255,255,0.32)]"
            />
            <button
              type="submit"
              className="bg-gold text-[18px] hover:bg-white hover:text-gold text-white py-2 rounded-[6px] tracking-[0.42px] flex justify-center items-center h-[45px] cursor-pointer"
            >
              SUBSCRIBE
            </button>
          </form>
          <div className="flex gap-2 mt-5">
            <p className="text-[15px] text-white mt-2 leading-[22px] font-montserrat">
              Follow Us On:
            </p>
            <div className="flex gap-4 mt-2 text-gray-400">
              <Link href="#" className="hover:text-white">
                <Image src="landing/fb.svg" alt="fb" width={16} height={16} />
              </Link>
              <Link href="#" className="hover:text-white">
                <Image src="landing/insta.svg" alt="insta" width={16} height={16} />
              </Link>
              <Link href="#" className="hover:text-white">
                <Image src="landing/tiktok.svg" alt="tiktok" width={16} height={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[rgba(255,255,255,0.32)] text-center py-4 text-[14px] text-white">
        Copyright © 2024 Power By Indian Weddings.
      </div>
    </footer>
  );
};

export default Footer;
