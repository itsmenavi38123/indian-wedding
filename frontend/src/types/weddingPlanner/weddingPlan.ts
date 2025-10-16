export interface CreateWeddingPlanPayload {
  destinationId?: string | null;
  totalBudget: number;
  minBudget?: number;
  maxBudget?: number;
  weddingDate?: string;
  guestCount?: number;
  selectedVendors?: {
    photographer?: string;
    venue?: string;
    planner?: string;
  };
  events?: {
    name: string;
    date: string;
    location?: string;
  }[];
  services?: {
    serviceId: string;
    notes?: string;
  }[];
}
