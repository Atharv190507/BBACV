export enum UserRole {
  ADMIN = 'ADMIN', // System Super Admin
  INSTITUTION = 'INSTITUTION',
  STUDENT = 'STUDENT',
  VERIFIER = 'VERIFIER'
}

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  studentId?: string; // System generated or provided
  mobileNumber?: string; // Added for OTP auth
  status?: AccountStatus;
  institutionDetails?: {
    website: string;
    foundedYear: string;
  }
}

export interface FraudAnalysisResult {
  score: number; // 0-100 (0 is safe, 100 is fraud)
  reasons: string[];
  isSuspicious: boolean;
  aiConfidence: number;
}

export interface CertificateData {
  id: string;
  studentName: string;
  studentId: string;
  university: string;
  degree: string;
  program: string;
  gpa?: string;
  graduationDate: string;
  issueDate: string;
  verifiedBy?: string; // Name or ID of the verifying entity
  additionalData?: { key: string; value: string }[]; // Custom metadata pairs
  hash: string; // SHA-256 blockchain hash
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
  issuerId: string;
  fraudAnalysis?: FraudAnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalIssued: number;
  verifiedToday: number;
  revoked: number;
  fraudAlerts: number;
}