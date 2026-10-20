export interface OwnerTechnicianAssignment {
  assignmentId: number;
  requestId: number;
  technicianName: string;
  customerName: string;
  customerPhone: string;
  carMakeModel: string;
  carPlateNumber: string;
  appliedPrice: number | null;
  status:
    | "ASSIGNED"
    | "ON_THE_WAY"
    | "ARRIVED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  latitude: number | null;
  longitude: number | null;
  assignedAt: string | null;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  lastLocationUpdate: string | null;
}