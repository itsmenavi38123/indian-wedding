export interface LeadFilters {
  search?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface LeadFiltersAPI {
  search?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface Filters {
  searchQuery: string;
  selectedLocations: string[];
  budgetRange: [number, number];
  dateRange: { from?: Date; to?: Date };
}

export interface LeadFiltersProps {
  initialFilters: Filters;
  onApplyFilters: (filters: LeadFilters) => void;
  locations: string[];
}

export interface LeadBoardResponse {
  boards: LeadBoardColumn[];
  budgetRange: [number, number];
}

export interface LeadBoardColumn {
  id: string;
  name: string;
  order: number;
  cards: LeadCard[];
}

export interface LeadCard {
  id: string;
  title: string;
  description: string;
  kanbanBoardId: string;
  leadData: {
    partner1Name: string;
    partner2Name?: string;
    weddingDate?: string;
    budgetMin?: number;
    budgetMax?: number;
    budget?: number;
    phoneNumber?: string;
    email?: string;
    status?: string;
    stage?: string;
    daysInStage?: number;
    guestCountMin?: number;
    guestCountMax?: number;
    leadSource?: string;
    preferredLocations?: string[];
  };
  assignedUser?: { id: string; name: string; email: string } | null;
  teamMembers: any[];
  createdAt: string;
  updatedAt: string;
}
