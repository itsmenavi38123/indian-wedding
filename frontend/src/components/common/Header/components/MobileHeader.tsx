'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { leftNav, rightNav, logo } from '../data';

const MobileHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden w-full h-[90px] px-[15px]  pt-[27px] pb-[20px] bg-[image:var(--primary-gradient)] fixed top-0 left-0 z-50 shadow-sm">
      <div className="h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className="object-contain max-w-[150px]"
            priority
          />
        </Link>

        {/* Hamburger */}
        <button
          className="  text-white"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-[30px] w-[30px]" /> : <Menu className="h-[30px] w-[30px]" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="absolute top-[90px] left-0 w-full bg-gold shadow-md z-40">
          <nav className="flex flex-col p-4 gap-4">
            {[...leftNav, ...rightNav].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium hover:text-primary text-white text-[18px] transition-colors "
              >
                {item.name}
              </Link>
            ))}
            <Button
              size="sm"
              className="mt-2 px-[30px] py-[16px] text-[16px] h-[50px]"
              onClick={() => setOpen(false)}
            >
              Login
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;
