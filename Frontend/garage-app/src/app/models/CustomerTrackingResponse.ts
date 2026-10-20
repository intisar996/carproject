export interface CustomerTrackingResponse {
    requestId: number;
    assignmentId: number;
    garageName: string;
    technicianName: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
}