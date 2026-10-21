export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  locationName: string;
  formattedAddress: string;
  landmark: string;
  timestamp: string;
}

export type MeetingType = 'Physical' | 'Call';
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

export interface VisitRecord {
  id: string;
  serialNo: string;
  date: string;
  time: string;
  salespersonName: string;
  clientName: string;
  meetingType: MeetingType;
  scheduleDone: boolean;
  followUpDate: string;
  businessLumpsum: number; // in INR
  businessSip: number; // monthly in INR
  remarks: string;
  location: GeoLocation;
  verifiedAt: string;
  status: 'Verified & Synced' | 'Pending Sync' | 'GPS Flagged';
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'Authorised Manager' | 'Super Admin';
  avatar?: string;
  authenticatedAt: string;
}

export type ActiveTab = 'field-entry' | 'visit-records' | 'performance-analytics' | 'individual-dashboard';
