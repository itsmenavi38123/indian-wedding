export interface NavItem {
  name: string;
  href: string;
}

export const leftNav: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Venues', href: '/venues' },
  { name: 'Vendors', href: '/vendors' },
  { name: 'Weddings', href: '/weddings' },
];

export const rightNav: NavItem[] = [
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export const logo = {
  src: '/logo.png',
  alt: 'Logo',
  width: 190,
  height: 82,
};
