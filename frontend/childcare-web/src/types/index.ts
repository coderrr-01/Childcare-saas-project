// Roles and permissions
export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'CENTRE_ADMIN' | 'EDUCATOR' | 'PARENT';

export type Permission =
  | 'children:read' | 'children:write' | 'children:delete'
  | 'families:read' | 'families:write' | 'families:delete'
  | 'enrolments:read' | 'enrolments:write' | 'enrolments:delete'
  | 'attendance:read' | 'attendance:write'
  | 'dailyCare:read' | 'dailyCare:write'
  | 'health:read' | 'health:write'
  | 'medication:read' | 'medication:write'
  | 'incidents:read' | 'incidents:write' | 'incidents:delete'
  | 'learning:read' | 'learning:write' | 'learning:delete'
  | 'media:read' | 'media:write' | 'media:delete'
  | 'messages:read' | 'messages:write'
  | 'documents:read' | 'documents:write' | 'documents:delete'
  | 'consent:read' | 'consent:write'
  | 'billing:read' | 'billing:write'
  | 'reports:read'
  | 'settings:read' | 'settings:write'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'centres:read' | 'centres:write';

// User
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  centreId?: string;
  organisationId?: string;
  isActive: boolean;
  lastLogin?: string;
}

// Centre
export interface Centre {
  id: string;
  name: string;
  organisationId: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  rooms: Room[];
  timezone: string;
}

export interface Room {
  id: string;
  name: string;
  centreId: string;
  capacity: number;
  ageRange: { min: number; max: number };
}

// Child
export type ChildStatus = 'ENROLLED' | 'WAITLISTED' | 'WITHDRAWN' | 'TRANSFERRED';
export type ChildGender = 'male' | 'female' | 'other' | 'unspecified';

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: ChildGender;
  roomId: string;
  familyIds: string[];
  enrolmentStatus: string;
  allergies: string[];
  medicalConditions: string[];
  emergencyContact: string;
  emergencyPhone: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Family
export interface FamilyAddress {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

export interface ParentGuardian {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email: string;
  phone: string;
  mobile?: string;
  occupation?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface PickupAuthorisedPerson {
  name: string;
  relationship: string;
}

export interface Family {
  id: string;
  primaryContact: ParentGuardian;
  secondaryContact?: ParentGuardian;
  address: FamilyAddress;
  emergencyContacts: EmergencyContact[];
  pickupAuthorisedPersons: PickupAuthorisedPerson[];
  childIds: string[];
  organisationId: string;
  centreId: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enrolment
export type EnrolmentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface EnrolmentSchedule {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Enrolment {
  id: string;
  childId: string;
  familyId: string;
  roomId: string;
  startDate: string;
  endDate?: string | null;
  status: EnrolmentStatus;
  schedule: EnrolmentSchedule;
  hoursPerWeek: number;
  dailyRate: number;
  subsidyPercentage: number;
  organisationId: string;
  centreId: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

// Waitlist
export type WaitlistStatus = 'ACTIVE' | 'OFFERED' | 'ENROLLED' | 'EXPIRED' | 'CANCELLED';
export type WaitlistPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface WaitlistEntry {
  id: string;
  childId: string;
  familyId: string;
  preferredRoomId?: string;
  preferredStartDate: string;
  status: WaitlistStatus;
  priority: WaitlistPriority;
  notes?: string;
  organisationId: string;
  centreId: string;
  addedAt: string;
  updatedAt: string;
}

// Attendance
export type AttendanceStatus = 'EXPECTED' | 'PRESENT' | 'ABSENT' | 'LATE' | 'LEFT_EARLY';

export interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkedInBy?: string;
  checkedOutBy?: string | null;
  notes?: string;
  roomId: string;
}

// Daily Care
export type CareType = 'MEAL' | 'SLEEP' | 'NAPPY' | 'TOILETING' | 'WATER' | 'BOTTLE' | 'ACTIVITY' | 'NOTE';

export interface DailyCareRecord {
  id: string;
  childId: string;
  centreId: string;
  date: string;
  type: CareType;
  time: string;
  endTime?: string;
  details: string;
  educatorId: string;
  createdAt: string;
}

// Health
export type HealthSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' | 'CRITICAL';

export interface HealthRecord {
  id: string;
  childId: string;
  type: 'ALLERGY' | 'MEDICAL_CONDITION' | 'DIETARY' | 'NOTE';
  title: string;
  description: string;
  severity: HealthSeverity;
  status: string;
  dateIdentified?: string;
  medication?: string | null;
  actionPlan?: string;
  diagnosedBy?: string;
  diagnosedDate?: string;
  documents: string[];
  centreId: string;
  createdAt: string;
  updatedAt: string;
}

// Medication
export type MedicationStatus = 'ACTIVE' | 'SCHEDULED' | 'DUE' | 'ADMINISTERED' | 'MISSED' | 'SKIPPED' | 'COMPLETED';
export type MedicationFrequency = 'DAILY' | 'TWICE_DAILY' | 'THREE_TIMES_DAILY' | 'WEEKLY' | 'AS_NEEDED' | 'MONTHLY';
export type MedicationType = 'TABLET' | 'CAPSULE' | 'LIQUID' | 'CREAM' | 'INHALER' | 'DROPS' | 'INJECTION' | 'OTHER';

export interface MedicationRecord {
  id: string;
  childId: string;
  name: string;
  type: MedicationType;
  dosage: string;
  frequency: MedicationFrequency;
  scheduledTimes: string[];
  startDate: string;
  endDate?: string | null;
  prescribedBy?: string;
  instructions: string;
  status: MedicationStatus;
  centreId: string;
  administeredBy?: string;
  lastAdministered?: string | null;
  nextDue?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Incident
export type IncidentStatus = 'DRAFT' | 'REPORTED' | 'PARENT_NOTIFIED' | 'ACKNOWLEDGED' | 'FOLLOW_UP' | 'CLOSED';
export type IncidentSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE' | 'CRITICAL';

export interface Incident {
  id: string;
  childId: string;
  reportedBy: string;
  reportedAt: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string;
  description: string;
  actionTaken: string;
  parentNotified: boolean;
  followUpRequired: boolean;
  followUpNotes?: string;
  centreId: string;
  roomId: string;
  witnesses: string[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Learning Story
export type LearningStoryStatus = 'DRAFT' | 'PUBLISHED';

export interface LearningStory {
  id: string;
  childId: string;
  educatorId: string;
  title: string;
  story: string;
  observations: string;
  learningOutcomes: string[];
  photoUrls: string[];
  status: LearningStoryStatus;
  publishedAt?: string;
  centreId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

// Media
export interface MediaItem {
  id: string;
  type: 'PHOTO' | 'VIDEO';
  url: string;
  thumbnailUrl: string;
  title: string;
  description?: string;
  childId: string;
  roomId: string;
  uploadedBy: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number | null;
  centreId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Messages
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface Conversation {
  id: string;
  participantIds: string[];
  subject: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  centreId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  attachments?: string[];
}

// Notifications
export type NotificationType = 'ATTENDANCE' | 'MEDICATION' | 'INCIDENT' | 'MESSAGE' | 'CONSENT' | 'ENROLMENT' | 'SYSTEM';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  priority: NotificationPriority;
  centreId: string;
  link?: string;
  childId?: string;
  createdAt: string;
}

// Documents
export type DocumentCategory = 'ENROLMENT' | 'MEDICAL' | 'CHILD' | 'FAMILY' | 'CENTRE' | 'POLICY';

export interface Document {
  id: string;
  name: string;
  type: DocumentCategory;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  childId?: string;
  familyId?: string;
  centreId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Consent
export type ConsentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED';

export interface ConsentRecord {
  id: string;
  childId: string;
  familyId: string;
  type: string;
  title: string;
  description: string;
  status: ConsentStatus;
  approvedAt?: string;
  expiresAt?: string;
  signedBy?: string;
  signedAt?: string;
  centreId: string;
  documentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Billing
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  familyId: string;
  childIds: string[];
  centreId: string;
  organisationId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string | null;
  subtotal: number;
  gst: number;
  total: number;
  amountPaid: number;
  amountOwing: number;
  lineItems: InvoiceLineItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Reports
export type ReportType = 'attendance' | 'children' | 'enrolments' | 'waitlist' | 'incidents' | 'dailyCare' | 'learning' | 'communication';

export interface ReportConfig {
  type: string;
  dateRange: { start: string; end: string };
  centreId?: string;
  roomId?: string;
  format: 'TABLE' | 'CHART' | 'BOTH';
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  centre?: Centre;
}
