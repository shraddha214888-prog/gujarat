export type CategoryType = 'all' | 'rivers' | 'mountains' | 'cities';

export type RegionType = 'all' | 'saurashtra' | 'kachchh' | 'north' | 'central' | 'south';

export interface River {
  id: string;
  nameGu: string;
  nameEn: string;
  lengthKm: number;
  origin: string;
  destination: string;
  majorDams: string[];
  majorCities: string[];
  significanceGu: string;
  descriptionGu: string;
  region: RegionType;
  color: string;
  // 3D coordinates on map plane [-10 to 10]
  pathCoords3D: [number, number, number][];
  markerCoord3D: [number, number, number];
  geoCoords: { lat: number; lng: number };
}

export interface Mountain {
  id: string;
  nameGu: string;
  nameEn: string;
  heightM: number;
  heightFt: number;
  districtGu: string;
  rangeGu: string;
  mythologyGu: string;
  attractionsGu: string[];
  descriptionGu: string;
  region: RegionType;
  coord3D: [number, number, number];
  geoCoords: { lat: number; lng: number };
}

export interface City {
  id: string;
  nameGu: string;
  nameEn: string;
  districtGu: string;
  nicknameGu: string;
  populationGu: string;
  areaKm2: number;
  famousForGu: string[];
  landmarksGu: string[];
  descriptionGu: string;
  region: RegionType;
  coord3D: [number, number, number];
  geoCoords: { lat: number; lng: number };
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  conditionGu: string;
  conditionEn: string;
  windSpeed: number;
  windDirectionDeg: number;
  windDirectionGu: string;
  surfacePressure: number;
  precipitation: number;
  isDay: boolean;
  time: string;
  cachedAt: number;
  landmarkNameGu: string;
  landmarkNameEn: string;
  lat: number;
  lng: number;
}

export interface StateSymbol {
  labelGu: string;
  nameGu: string;
  scientificName: string;
  descriptionGu: string;
  iconName: string;
}

export interface StateFacts {
  foundationDate: string;
  capitalGu: string;
  largestCityGu: string;
  coastlineKm: number;
  districtsCount: number;
  talukasCount: number;
  areaKm2: number;
  populationGu: string;
  officialLanguageGu: string;
  stateSongGu: string;
  symbols: StateSymbol[];
  unescoSites: {
    nameGu: string;
    year: number;
    descriptionGu: string;
  }[];
}

export interface QuizQuestion {
  id: number;
  questionGu: string;
  optionsGu: string[];
  correctIndex: number;
  explanationGu: string;
}
