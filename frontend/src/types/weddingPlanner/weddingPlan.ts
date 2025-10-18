export interface CreateWeddingPlanPayload {
  destinationId?: string | null;
  totalBudget: number;
  minBudget?: number;
  maxBudget?: number;
  weddingDate?: {
    startDate: string;
    endDate: string;
  };
  guestCount?: number;
  selectedVendors?: {
    photographer?: string;
    planner?: string;
  };
  events?: {
    name: string;
    date: string;
    location?: string;
  }[];
  services?: {
    vendorServiceId: string;
    quantity?: number;
    notes?: string;
  }[];
}
