
export interface GarageServiceOption {
  garageOptionId: number;
  garageId: number;
  serviceOptionId: number;
  serviceName: string;
  optionType: string;
  optionSize: string;
  optionBrand: string;
  price: number;
  isAvailable: boolean;
}

export interface GarageServiceOptionRequest {
  serviceOptionId: number;
  price: number;
  isAvailable: boolean;
}

