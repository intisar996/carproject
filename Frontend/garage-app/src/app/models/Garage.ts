import type { GarageStatus } from "./enums";

export interface Garage {
  id: number;
  ownerId: number;
  name: string;
  governorate: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  status: GarageStatus;
}

export interface NewGarageRequest {
  garageName: string;
  commercialRegisterNumber: string;
  certificateFile: File;
  governorate: string;
  state: string;
  latitude: number;
  longitude: number;
}
