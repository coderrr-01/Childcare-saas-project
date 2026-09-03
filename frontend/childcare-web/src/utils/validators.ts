import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const childSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED']),
  roomId: z.string().min(1, 'Room is required'),
});

export const incidentSchema = z.object({
  childId: z.string().min(1, 'Child is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(10, 'Please provide a detailed description'),
  actions: z.string().min(5, 'Please describe the actions taken'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
});

export const invoiceSchema = z.object({
  familyId: z.string().min(1, 'Family is required'),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    childId: z.string().min(1, 'Child is required'),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).min(1, 'At least one item is required'),
});