'use client';
import { Feature } from '@/app/(components)/landingPage/CollectionSlider';

export const landingContent = {
  heroSectionTitle: 'Plan Your Dream Indian Wedding in 15 Minutes.',
  heroSectionVideoUrl: '/landing/video-bg.mp4',
  heroSectionButton1Text: 'Start Planning Now',
  heroSectionButton2Text: 'Explore Real Weddings',

  carouselSectionTitle: 'Everything You Need, One Platform',

  howItWorksHeading: 'How It Works',
  howItWorksStep1Title: 'Create your site',
  howItWorksStep1Desc:
    'Launch your personalized wedding website in minutes. Choose from elegant, modern, and traditional Indian-inspired designs to showcase your love story, share event details, and keep everything beautifully organized in one place.',
  howItWorksStep2Title: 'Configure Your Wedding',
  howItWorksStep2Desc:
    'Plan every detail with ease—from selecting certified vendors to designing your décor and scheduling events. Our AI-powered planner adapts to your traditions, rituals, and preferences, helping you create a wedding that’s uniquely yours.',
  howItWorksStep3Title: 'Manage Guests',
  howItWorksStep3Desc:
    'Simplify invitations, RSVPs, and seating charts. Send digital or printed invites, track responses in real time, and manage dietary needs or travel plans—all with tools that make guest management effortless.',
  howItWorksBgImage: '/landing/how-it-bg.png',

  blogSectionHeading: 'From The IndianWeddings Journal',
  blogSectionButtonLabel: 'View All Real Weddings & Articles',
  blogSectionButtonLink: '/blogs',

  reviewHeading: 'What Couples Are Saying',

  sectionHeading: 'From The IndianWeddings Journal',
  mainButtonLabel: 'View All Real Weddings & Articles',
  mainButtonLink: '/all-blogs',

  weddingWebsiteSectionHeading:
    'Already Planned your Wedding? Create your beautiful Wedding Website',
  weddingWebsiteSectionDescription:
    'Easily design a stunning wedding website to showcase your story...',
  weddingWebsiteSectionButtonLabel: 'Create Your Website',
  weddingWebsiteSectionButtonLink: '#',
  weddingWebsiteSectionBgImage: '/landing/create-webiste-bg.png' as string | File | null,
  weddingWebsiteSectionBrandsHeading: 'As Seen In',
  weddingWebsiteSectionBrandsParagraph: `Trusted by the world's leading wedding & lifestyle publications.`,
};

export const initialFeatures: Feature[] = [
  { title: 'All in One Planning', img: '/landing/collection-one.png', alt: 'All in One Planning' },
  { title: 'Guest Management', img: '/landing/collection-two.png', alt: 'Guest Management' },
  { title: 'Certified Vendors', img: '/landing/collection-three.png', alt: 'Certified Vendors' },
  { title: 'AI Powered', img: '/landing/collection-four.png', alt: 'AI Powered' },
  { title: 'Guest Management', img: '/landing/collection-two.png', alt: 'Guest Management' },
];

export const blogs = [
  {
    id: 1,
    category: 'Trends & Inspiration',
    title: "Inside Arjun & Priya's SIM Dubai Celebration",
    description: `From floating floral canopies to modern glass mandaps—discover the season's most breathtaking setups...`,
    image: '/landing/postone.png',
    link: '/blog/1',
  },
  {
    id: 2,
    category: 'Trends & Inspiration',
    title: 'Top Mandap Designs for 2025',
    description: `From floating floral canopies to modern glass mandaps—discover the season's most breathtaking setups...`,
    image: '/landing/posttwo.png',
    link: '/blog/1',
  },
  {
    id: 3,
    category: 'Trends & Inspiration',
    title: '5 Destinations Perfect for Gujarati Weddings',
    description: `From Udaipur's regal palaces to Lake Como's timeless charm, explore handpicked destinations...`,
    image: '/landing/postthree.png',
    link: '/blog/1',
  },
];
