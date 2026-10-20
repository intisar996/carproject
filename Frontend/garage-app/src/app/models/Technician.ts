export interface Technician {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  specialization: string | null;
  salary: number | null;
  isAvailable: boolean | null;
  isActive: boolean | null;
}

export interface TechnicianRequest {
  fullName: string;
  email: string;
  phone: string;
  specialization?: string;
  salary: number;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
}
