export type RepairPhotoType = "BEFORE" | "DURING" | "AFTER";

export interface OwnerRepairPhoto {
  photoId: number;
  requestId: number;
  photoType: RepairPhotoType;
  imageUrl: string;
  capturedAt: string | null;
}