export interface Station {
  id: number;
  lat: number;
  lon: number;
  name: string;
  brand: string | null;
  address: string | null;
  city: string | null;
  openingHours: string | null;
  hasUnleaded: boolean;
  hasDiesel: boolean;
  hasCompressedAir: boolean;
  wheelchair: boolean;
  selfService: boolean | null;
  payment: {
    cash: boolean | null;
    creditCards: boolean | null;
    debitCards: boolean | null;
  };
  website: string | null;
  operator: string | null;
}