export type Stage = 'INQUIRY' | 'PROPOSAL' | 'BOOKED' | 'COMPLETED';

export const STAGES: Stage[] = ['INQUIRY', 'PROPOSAL', 'BOOKED', 'COMPLETED'];

export const stageIndex: Record<Stage, number> = {
  INQUIRY: 0,
  PROPOSAL: 1,
  BOOKED: 2,
  COMPLETED: 3,
};

export const stageDisplayNames: Record<Stage, string> = {
  INQUIRY: 'Inquiry',
  PROPOSAL: 'Proposal',
  BOOKED: 'Booked',
  COMPLETED: 'Completed',
};

export type Lead = {
  id: string;
  couple: string;
  weddingDate: string; // ISO
  budget: number;
  stage: Stage;
  dateInStage: string; // ISO
  assignee?: { name: string };
  archived?: boolean;
};

export function daysInStage(lead: Lead): number {
  const then = new Date(lead.dateInStage).getTime();
  const diff = Date.now() - then;
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}
