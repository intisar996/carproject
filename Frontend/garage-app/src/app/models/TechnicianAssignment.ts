export interface TechnicianAssignment {
  assignmentId: number;
  requestId: number;
  guestName: string;
  guestPhone: string;
  carMakeModel: string;
  carPlateNumber: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  currentLatitude: number | null;
  currentLongitude: number | null;

}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
}