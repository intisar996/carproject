export type RepairPhoto = {
  photoId: number;
  requestId: number;
  photoType: "BEFORE" | "DURING" | "AFTER";
  imageUrl: string;
  capturedAt: string;
};