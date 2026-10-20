export interface CustomerGarage {
  garageId: number;
  garageName: string;
  governorate: string;
  state: string;
  latitude: number;
  longitude: number;

  garageOptionId: number;
  serviceOptionId: number;

  optionType: string;
  optionSize: string | null;
  optionBrand: string | null;

  price: number;
}