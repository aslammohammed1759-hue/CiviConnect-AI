export type IssueCategory =
  | 'Pothole & Roads'
  | 'Street Lighting'
  | 'Waste & Sanitation'
  | 'Water & Drainage'
  | 'Parks & Greenery'
  | 'Traffic & Signals'
  | 'Graffiti & Vandalism'
  | 'Public Safety';

export type IssueUrgency = 'Low' | 'Medium' | 'High' | 'Emergency';

export type IssueStatus = 'Submitted' | 'AI Triaged' | 'Assigned' | 'In Progress' | 'Resolved';

export interface LocationData {
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

export interface IssueUpdate {
  id: string;
  timestamp: string;
  status: string;
  author: string;
  role: 'Citizen' | 'AI Dispatch Engine' | 'Department Inspector' | 'Public Works Crew';
  message: string;
}

export interface IssueComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface AiAnalysis {
  summary: string;
  hazards: string[];
  actionSteps: string[];
  citizenNotice: string;
  triageConfidence: number;
  category?: IssueCategory;
  department?: string;
  severityScore?: number;
  urgency?: IssueUrgency;
  estimatedResolutionDays?: number;
}

export interface CivicIssue {
  id: string;
  trackingNumber: string;
  title: string;
  description: string;
  category: IssueCategory;
  department: string;
  urgency: IssueUrgency;
  status: IssueStatus;
  severityScore: number;
  location: LocationData;
  reporter: {
    name: string;
    email: string;
    isAnonymous: boolean;
  };
  imageUrl?: string;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
  updatedAt: string;
  estimatedResolutionDays: number;
  aiAnalysis?: AiAnalysis;
  updates: IssueUpdate[];
  comments: IssueComment[];
}

export interface AnalyticsData {
  metrics: {
    total: number;
    resolved: number;
    inProgress: number;
    emergencies: number;
    totalUpvotes: number;
    avgResolutionDays: number;
    aiTriageAccuracy: string;
  };
  departmentCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
}
