'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { leftNav, rightNav, logo } from '../data';
import LoginSelectModal from './LoginSelectModal';

const DesktopHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const pathname = usePathname(); // get current path

  const isActive = (href: string) => pathname === href;

  return (
    <header className="hidden h-[172px] md:flex w-full pt-[27px] pb-[60px] fixed top-0 left-0 z-50 items-center justify-between px-[15px] md:px-[20px] lg:px-[20px] xl:px-[60px] bg-[image:var(--primary-gradient)]">
      {/* Left Nav */}
      <nav className="flex items-center md:gap-[10px] lg:gap-[15px] xl:gap-8">
        {leftNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium leading-1.5 text-[16px] md:text-[14px] lg:text-[16px] xl:text-[18px] transition-colors ${
              isActive(item.href) ? 'text-gold' : 'text-white hover:text-gold'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Logo Center */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link href="/">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className="object-contain md:max-w-[120px] lg:max-w-[190px] xl:max-w-[209px]"
            priority
          />
        </Link>
      </div>

      {/* Right Nav */}
      <div className="flex items-center md:gap-[10px] lg:gap-[15px] xl:gap-8">
        {rightNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium leading-1.5 text-[16px] md:text-[14px] lg:text-[16px] xl:text-[18px] transition-colors ${
              isActive(item.href) ? 'text-gold' : 'text-white hover:text-gold'
            }`}
          >
            {item.name}
          </Link>
        ))}
        <Button
          size="sm"
          className="ml-2 h-[45px] flex justify-center items-center bg-gold text-white font-normal tracking-[1px] hover:text-gold hover:bg-white transition-colors cursor-pointer md:px-[16px] md:py-[8px] lg:px-[22px] lg:py-[10px] xl:px-[36px] xl:py-[12px]"
          onClick={() => setIsModalOpen(true)}
        >
          Login
        </Button>
      </div>

      <LoginSelectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </header>
  );
};

export default DesktopHeader;