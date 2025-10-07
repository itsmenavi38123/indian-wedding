export type LeadStatus = 'INQUIRY' | 'PROPOSAL' | 'BOOKED' | 'COMPLETED';

export const LEAD_STATUS_VALUES: LeadStatus[] = [
  'INQUIRY',
  'PROPOSAL',
  'BOOKED',
  'COMPLETED',
] as const;

export type LeadSource = 'WEBSITE' | 'INSTAGRAM' | 'REFERRAL' | 'WEDDING_FAIR' | 'OTHER';

export const LEAD_SOURCE_VALUES: LeadSource[] = [
  'WEBSITE',
  'INSTAGRAM',
  'REFERRAL',
  'WEDDING_FAIR',
  'OTHER',
] as const;

export type SaveStatus = 'DRAFT' | 'SUBMITTED' | 'ARCHIVED';

export const SAVED_STATUS_VALUES: SaveStatus[] = ['DRAFT', 'SUBMITTED', 'ARCHIVED'] as const;

export type Lead = {
  id: string;
  partner1Name: string;
  partner2Name?: string | null;
  primaryContact: string;
  phoneNumber: string;
  whatsappNumber: string | null;
  email: string;
  weddingDate: Date;
  flexibleDates: boolean | null;
  guestCountMin: number | null;
  guestCountMax: number | null;
  budgetMin: number;
  budgetMax: number;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  preferredLocations: string[];
  status: LeadStatus;
  leadSource: LeadSource;
  serviceTypes: ServiceType;
  saveStatus: SaveStatus;
  referralDetails: string | null;
  initialNotes: string | null;
  createdById: string | null;
  createdBy: string | { id: string; name: string; email?: string } | null;
};

export type ServiceType =
  | 'Photography'
  | 'Videography'
  | 'DJ'
  | 'Live Band'
  | 'Florist'
  | 'Catering'
  | 'Baker/Cake Designer'
  | 'Makeup Artist'
  | 'Hair Stylist'
  | 'Event Planner'
  | 'Decor Rentals'
  | 'Lighting'
  | 'Sound System'
  | 'Transport / Limousine'
  | 'Venue'
  | 'Officiant'
  | 'Security'
  | 'Bartender'
  | 'Waitstaff'
  | 'Furniture Rentals'
  | 'Photobooth'
  | 'Invitation / Stationery'
  | 'Favors / Gifts'
  | 'Dress / Attire Rental'
  | 'Entertainment / Performers'
  | 'Video Streaming / Live Broadcast'
  | 'Drone Photography'
  | 'Caricature Artist'
  | 'Children’s Entertainment'
  | 'Valet Parking'
  | 'Fireworks / Special Effects'
  | 'Other';

export const SERVICE_TYPE_VALUES: ServiceType[] = [
  'Photography',
  'Videography',
  'DJ',
  'Live Band',
  'Florist',
  'Catering',
  'Baker/Cake Designer',
  'Makeup Artist',
  'Hair Stylist',
  'Event Planner',
  'Decor Rentals',
  'Lighting',
  'Sound System',
  'Transport / Limousine',
  'Venue',
  'Officiant',
  'Security',
  'Bartender',
  'Waitstaff',
  'Furniture Rentals',
  'Photobooth',
  'Invitation / Stationery',
  'Favors / Gifts',
  'Dress / Attire Rental',
  'Entertainment / Performers',
  'Video Streaming / Live Broadcast',
  'Drone Photography',
  'Caricature Artist',
  'Children’s Entertainment',
  'Valet Parking',
  'Fireworks / Special Effects',
  'Other',
] as const;

export const SERVICE_IMAGES = {
  Photography:
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  Lighting:
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  DecorRentals:
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80',
  EventPlanner:
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80',
};

export const serviceTypeToImageMap: Record<ServiceType, string> = {
  Photography: SERVICE_IMAGES.Photography,
  Videography: SERVICE_IMAGES.Photography,
  DJ: SERVICE_IMAGES.Lighting,
  'Live Band': SERVICE_IMAGES.Lighting,
  Florist: SERVICE_IMAGES.DecorRentals,
  Catering: SERVICE_IMAGES.DecorRentals,
  'Baker/Cake Designer': SERVICE_IMAGES.DecorRentals,
  'Makeup Artist': SERVICE_IMAGES.EventPlanner,
  'Hair Stylist': SERVICE_IMAGES.EventPlanner,
  'Event Planner': SERVICE_IMAGES.EventPlanner,
  'Decor Rentals': SERVICE_IMAGES.DecorRentals,
  Lighting: SERVICE_IMAGES.Lighting,
  'Sound System': SERVICE_IMAGES.Lighting,
  'Transport / Limousine': SERVICE_IMAGES.EventPlanner,
  Venue: SERVICE_IMAGES.EventPlanner,
  Officiant: SERVICE_IMAGES.EventPlanner,
  Security: SERVICE_IMAGES.Lighting,
  Bartender: SERVICE_IMAGES.EventPlanner,
  Waitstaff: SERVICE_IMAGES.EventPlanner,
  'Furniture Rentals': SERVICE_IMAGES.DecorRentals,
  Photobooth: SERVICE_IMAGES.DecorRentals,
  'Invitation / Stationery': SERVICE_IMAGES.DecorRentals,
  'Favors / Gifts': SERVICE_IMAGES.DecorRentals,
  'Dress / Attire Rental': SERVICE_IMAGES.Photography,
  'Entertainment / Performers': SERVICE_IMAGES.Lighting,
  'Video Streaming / Live Broadcast': SERVICE_IMAGES.Lighting,
  'Drone Photography': SERVICE_IMAGES.Photography,
  'Caricature Artist': SERVICE_IMAGES.Lighting,
  'Children’s Entertainment': SERVICE_IMAGES.Lighting,
  'Valet Parking': SERVICE_IMAGES.EventPlanner,
  'Fireworks / Special Effects': SERVICE_IMAGES.Lighting,
  Other: SERVICE_IMAGES.Photography,
};
