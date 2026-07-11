/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  FAN = "Fan",
  VOLUNTEER = "Volunteer",
  STAFF = "Stadium Staff",
  ORGANIZER = "Organizer"
}

export enum FacilityType {
  SEAT = "Seat",
  WASHROOM = "Washroom",
  ACCESSIBLE_WASHROOM = "Accessible Washroom",
  FOOD_COURT = "Food Court",
  FOOD_STALL = "Food Stall",
  BEVERAGE_STALL = "Beverage Stall",
  ENTRANCE = "Entrance",
  EXIT = "Exit",
  PARKING = "Parking",
  TAXI = "Taxi Pickup",
  BUS = "Bus Pickup",
  MEDICAL = "Medical Room",
  FIRST_AID = "First Aid",
  INFO = "Information Desk",
  LOST_FOUND = "Lost and Found",
  PRAYER = "Prayer Room",
  BABY_CARE = "Baby Care Room",
  CHARGING = "Charging Station",
  MERCHANDISE = "Merchandise Store",
  VIP = "VIP Lounge",
  SECURITY = "Security Office",
  EMERGENCY_EXIT = "Emergency Exit",
  WHEELCHAIR_ROUTE = "Wheelchair Route",
  ELEVATOR = "Elevator",
  ESCALATOR = "Escalator",
  MEDIA_ZONE = "Media Zone",
  PRESS_ROOM = "Press Room"
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  description: string;
  capacity: number;
  crowdLevel: "Low" | "Medium" | "High" | "Critical";
  crowdPercent: number; // 0 to 100
  isOpen: boolean;
  waitTime: number; // in minutes
  x: number; // 0-100 on canvas grid
  y: number; // 0-100 on canvas grid
  level: number; // Floor level (e.g. 1, 2, 3)
  block?: string; // Block A to L
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  locationId: string;
  locationName: string;
  severity: "Low" | "Medium" | "High" | "Emergency";
  status: "Open" | "Dispatched" | "Resolved";
  reportedAt: string;
  reportedBy: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  status: "Available" | "Busy" | "Offline";
  currentLocationId: string;
  locationName: string;
  tasksCompleted: number;
  avatarUrl?: string;
}

export interface Alert {
  id: string;
  type: "goal" | "reminder" | "emergency" | "parking" | "weather" | "crowd" | "gate" | "lost_found" | "transport";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  imageUrl?: string;
  voiceMode?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferredLanguage: "English" | "Spanish" | "French" | "Portuguese" | "Arabic" | "Hindi";
  ticketCode?: string;
  seatNo?: string;
  gateNo?: string;
  accessibilityEnabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  textToSpeech: boolean;
}

export interface StadiumState {
  occupancy: number; // current people inside
  maxCapacity: number; // total capacity
  parkingAvailable: number; // available slots
  parkingTotal: number;
}
