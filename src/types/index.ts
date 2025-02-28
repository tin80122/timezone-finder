export interface Country {
  name: string;
  code: string;
  timezones: string[];
  capital: string;
  latlng: [number, number];
}

export interface TimeZoneOption {
  value: string;
  label: string;
  offset: string; // Format: "UTC+8:00"
  offsetValue: number; // Numeric value in hours
}

export interface TimeZoneRange {
  minOffset: number;
  maxOffset: number;
}
