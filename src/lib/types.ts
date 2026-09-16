export type TicketCategory = 'HR' | 'IT' | 'Operations' | 'Finance';
export type TicketTone = 'Friendly' | 'Professional' | 'Urgent' | 'Immediate';
export type TicketSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'Resolved' | 'Pending';

export interface Ticket {
  id: string;
  ticketId: string;
  userName: string;
  content: string;
  categories: TicketCategory[];
  department: string; // Legacy support or primary department
  severity: TicketSeverity;
  tone: TicketTone;
  templateStyle?: string;
  aiResponse: string;
  status: TicketStatus;
  assignedStaff: string[];
  confidenceScore: number;
  submittedAt: string;
  processedAt: string;
  resolvedAt?: string;
  responseTimeSeconds: number;
  resolutionTimeSeconds?: number;
  createdAt: string;
}

export interface WeeklyInsight {
  id: string;
  generatedAt: string;
  totalTickets: number;
  summary: string;
  trends: string[];
  concerns: string[];
  recommendations: string[];
  recurringIssuesByDept?: Record<string, string[]>;
  efficiencyScore?: number;
}
