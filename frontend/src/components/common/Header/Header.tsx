'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Loader2,
  LogOut,
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Users2,
  CalendarClock,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  GitBranch,
  FileText,
  CircuitBoard,
  CalendarCheck,
  GalleryHorizontal,
} from 'lucide-react';
import { RootState } from '@/store/store';
import { useMutation } from '@tanstack/react-query';
import { adminLogout } from '@/services/api/auth';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { vendorLogout } from '@/services/api/vendorAuth';
import { userLogout } from '@/services/api/userAuth';
import IndexHeader from './page';
import Footer from '../Footer/Footer';
import TopLayout from './top-layout';

interface HeaderProps {
  children: React.ReactNode;
}

export type RoleType = 'ADMIN' | 'VENDOR' | 'USER';

const pagesWithoutSidebar = ['/admin/settings/banner-edit'];

const navItemsByRole = {
  ADMIN: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Board', href: '/admin/kanban', icon: CircuitBoard },
    { name: 'Leads', href: '/admin/leads', icon: Users },
    { name: 'Pipeline', href: '/admin/pipeline', icon: GitBranch },
    { name: 'Proposals', href: '/admin/proposals', icon: FileText },
    { name: 'Projects', href: '/admin/projects', icon: Briefcase },
    { name: 'Vendors', href: '/admin/vendors', icon: Building2 },
    { name: 'Team', href: '/admin/team', icon: Users2 },
    { name: 'Timeline', href: '/admin/timeline', icon: CalendarClock },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  VENDOR: [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Team', href: '/vendor/team', icon: Building2 },
    { name: 'Events', href: '/vendor/events', icon: CalendarCheck },
    { name: 'Gallery', href: '/vendor/gallery', icon: GalleryHorizontal },
    { name: 'Settings', href: '/vendor/settings', icon: Settings },
  ],
  USER: [
    { name: 'Home', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/user/leads', icon: Users },
    { name: 'Settings', href: '/user/settings', icon: Settings },
  ],
};

const Header = ({ children }: HeaderProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const auth = useSelector((state: RootState) => state.auth.user);
  const role = auth?.role as RoleType | null;
  const navItems = role ? navItemsByRole[role] : [];
  const [collapsed, setCollapsed] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const { mutate: logoutMutate } = useMutation({
    mutationFn: async () => {
      if (role === 'ADMIN') return adminLogout();
      if (role === 'VENDOR') return vendorLogout();
      if (role === 'USER') return userLogout();
      return Promise.resolve();
    },
    onSuccess: () => {
      dispatch(logout());
      toast.success('Logged out successfully.');
      if (role === 'ADMIN') router.push('/admin/login');
      else if (role === 'VENDOR') router.push('/vendor/login');
      else if (role === 'USER') router.push('/user/login');
      else router.push('/');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Logout failed');
    },
  });

  const handleLogout = () => {
    if (loadingLogout) return;
    setLoadingLogout(true);
    logoutMutate();
    setLoadingLogout(false);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) setCollapsed(true);
  };

  return (
    <div className="flex h-screen w-full">
      {role && !pathname.includes('login') && !pagesWithoutSidebar.includes(pathname) ? (
        <>
          <>
            {!collapsed && (
              <div
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={() => setCollapsed(true)}
              />
            )}
            <motion.aside
              animate={{ width: collapsed ? 60 : 260 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="fixed top-16 left-0 h-[calc(100vh-4rem)]  black-bg z-40 flex flex-col pt-[10px]"
            >
              <nav className="flex-1 flex flex-col p-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-gold transition-colors',
                        pathname === item.href ? 'bg-gold text-white' : 'text-white'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <motion.span
                        initial={false}
                        animate={{
                          opacity: collapsed ? 0 : 1,
                          width: collapsed ? 0 : 'auto',
                          marginLeft: collapsed ? 0 : 12,
                        }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <TopLayout
              invisibleSidebar={false}
              collapsed={collapsed}
              auth={auth}
              setCollapsed={setCollapsed}
              handleLogout={handleLogout}
              loadingLogout={loadingLogout}
            />
            <motion.main
              animate={{ marginLeft: collapsed ? 60 : 260 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="mt-16 flex-1 max-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] p-6 space-y-4 dark-bg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            >
              {children}
            </motion.main>
          </div>
        </>
      ) : pagesWithoutSidebar.includes(pathname) ? (
        <div className="mt-16 flex-1 max-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] p-6 space-y-4 dark-bg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <TopLayout
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            invisibleSidebar={true}
            handleLogout={handleLogout}
            loadingLogout={loadingLogout}
          />
          {children}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <IndexHeader />
          {children}
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Header;
