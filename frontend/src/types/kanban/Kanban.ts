export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  phone: string;
  cardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  kanbanBoardId: string;
  createdAt: string;
  updatedAt: string;
  assignedUser: AssignedUser;
  teamMembers: TeamMember[];
}

export interface KanbanColumn {
  id: string;
  name: string;
  cards: Card[];
}

export interface KanbanResponse {
  statusCode: number;
  success: boolean;
  message: string;
  errorMessage: string | null;
  data: KanbanColumn[];
}
