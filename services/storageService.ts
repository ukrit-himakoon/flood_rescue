import { HelpRequest, UrgencyLevel } from "../types";

const STORAGE_KEY = 'flood_rescue_requests';

// Mock initial data for demonstration
const MOCK_DATA: HelpRequest[] = [
  {
    id: '1',
    name: 'Somchai Jaidee',
    phone: '081-234-5678',
    details: 'Grandmother trapped on 2nd floor, needs insulin.',
    location: { lat: 7.0083, lng: 100.4767 }, // Central Hat Yai
    timestamp: Date.now() - 1000000,
    urgency: UrgencyLevel.CRITICAL,
    tags: ['Medical', 'Elderly', 'Evacuation']
  },
  {
    id: '2',
    name: 'Jane Doe',
    phone: '089-987-6543',
    details: 'Need drinking water and dry food for 3 people.',
    location: { lat: 7.0200, lng: 100.4600 },
    timestamp: Date.now() - 500000,
    urgency: UrgencyLevel.MEDIUM,
    tags: ['Food', 'Water']
  }
];

export const getRequests = (): HelpRequest[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Initialize with mock data if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
    return MOCK_DATA;
  }
  return JSON.parse(stored);
};

export const saveRequest = (request: HelpRequest): HelpRequest[] => {
  const current = getRequests();
  const updated = [request, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};