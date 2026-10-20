// Mirrors the Backend enums (enums/Role, RequestStatus, GarageStatus, AssignmentStatus).
// `const` objects + union types are used because `erasableSyntaxOnly` forbids TS enums.

export const Role = {
  ADMIN: "ADMIN",
  GARAGE_OWNER: "GARAGE_OWNER",
  TECHNICIAN: "TECHNICIAN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const RequestStatus = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const GarageStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type GarageStatus = (typeof GarageStatus)[keyof typeof GarageStatus];

export const AssignmentStatus = {
  ASSIGNED: "ASSIGNED",
  PREPARING: "PREPARING",
  ON_THE_WAY: "ON_THE_WAY",
  ARRIVED: "ARRIVED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus];

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && (Object.values(Role) as string[]).includes(value);
