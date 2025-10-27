'use client';

import React from 'react';
import Image from 'next/image';
import { Menu, LogOut, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationDropdown from '@/app/(components)/notifications/NotificationDropdown';

interface TopLayoutProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  invisibleSidebar?: boolean;
  auth?: { name?: string | null };
  handleLogout: () => void;
  loadingLogout: boolean;
}

const TopLayout: React.FC<TopLayoutProps> = ({
  collapsed,
  setCollapsed,
  invisibleSidebar,
  auth,
  handleLogout,
  loadingLogout,
}) => {
  return (
    <header className="w-full h-16 black-bg fixed top-0 left-0 z-50 flex items-center justify-between px-4 shadow-sm">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`p-2 rounded-md hover:bg-gold cursor-pointer ${invisibleSidebar ? 'invisible' : ''}`}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      <div className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={120} height={50} className="object-contain" />
      </div>

      <div className="flex space-x-4">
        <NotificationDropdown />

        <div className="flex items-center">
          {auth && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 focus:outline-none">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{auth?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block font-medium text-white">{auth?.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="overflow-visible ">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  {loadingLogout && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopLayout;
