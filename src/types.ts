export interface LatLngPoint {
  lat: number;
  lng: number;
}

export type DiningCategoryId =
  | 'all'
  | 'sit_down'
  | 'quick'
  | 'coffee'
  | 'drinks';

export interface DiningCategoryOption {
  id: DiningCategoryId;
  label: string;
  includedPrimaryTypes: string[];
}

export interface PlaceAttributionInfo {
  provider: string;
  providerURI?: string;
}

export interface PhotoAttributionInfo {
  displayName: string;
  uri?: string;
}

export interface FoodPlace {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: LatLngPoint;
  primaryType: string | null;
  primaryTypeDisplayName: string;
  types: string[];
  rating: number | null;
  userRatingCount: number | null;
  priceLevel: string | null;
  isOpenNow: boolean | null;
  businessStatus: string | null;
  distanceMeters: number;
  googleMapsURI: string | null;
  attributions: PlaceAttributionInfo[];
  includedOnWheel: boolean;
  // On-demand enriched fields for the winner / inspected place
  photoUri?: string | null;
  photoAttributions?: PhotoAttributionInfo[];
  editorialSummary?: string | null;
  websiteURI?: string | null;
  nationalPhoneNumber?: string | null;
  isEnriched?: boolean;
  placeInstance?: google.maps.places.Place;
}

export type GpsStatus =
  | 'idle'
  | 'locating'
  | 'ready'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error'
  | 'manual';

export type MobileTab = 'wheel' | 'map' | 'places';
