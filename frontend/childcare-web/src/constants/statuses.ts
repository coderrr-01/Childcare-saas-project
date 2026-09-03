export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  EXPECTED: '#94A3B8',
  PRESENT: '#22C55E',
  ABSENT: '#EF4444',
  LATE: '#F59E0B',
  LEFT_EARLY: '#F97316',
};

export const INCIDENT_STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94A3B8',
  REPORTED: '#3B82F6',
  PARENT_NOTIFIED: '#F59E0B',
  ACKNOWLEDGED: '#8B5CF6',
  FOLLOW_UP: '#F97316',
  CLOSED: '#22C55E',
};

export const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#22C55E',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  CRITICAL: '#EF4444',
};

export const ENROLMENT_STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94A3B8',
  PENDING_APPROVAL: '#F59E0B',
  ACTIVE: '#22C55E',
  COMPLETED: '#3B82F6',
  CANCELLED: '#EF4444',
};

export const WAITLIST_STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#3B82F6',
  OFFERED: '#F59E0B',
  ENROLLED: '#22C55E',
  EXPIRED: '#94A3B8',
  CANCELLED: '#EF4444',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94A3B8',
  PENDING: '#F59E0B',
  PAID: '#22C55E',
  OVERDUE: '#EF4444',
  CANCELLED: '#6B7280',
};

export const CONSENT_STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#22C55E',
  DECLINED: '#EF4444',
  EXPIRED: '#94A3B8',
};

export const MEDICATION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: '#3B82F6',
  DUE: '#F59E0B',
  ADMINISTERED: '#22C55E',
  MISSED: '#EF4444',
  SKIPPED: '#94A3B8',
};
