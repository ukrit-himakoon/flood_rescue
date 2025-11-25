export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HelpRequest {
  id: string;
  name: string;
  phone: string;
  details: string;
  location: Coordinates;
  timestamp: number;
  urgency: UrgencyLevel;
  tags: string[]; // e.g., "Medical", "Food", "Evacuation"
}

export interface GeminiAnalysisResult {
  urgency: UrgencyLevel;
  tags: string[];
}