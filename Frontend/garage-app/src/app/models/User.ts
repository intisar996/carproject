import type { Role } from "./enums";

export interface LoginResponse {
  email: string;
  fullName: string;
  role: string;
  token: string;
}

export interface User {
  token: string;
  email: string;
  fullName: string;
  role: Role;
  userId: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRequest {
  phone: string;
  email: string;
  password: string;
  fullName: string;
  role?: Role;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailValidationResponse {
  exists: boolean;
  available: boolean;
}


export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}
