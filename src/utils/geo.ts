import type { DiningCategoryOption, LatLngPoint } from '../types';

// All types verified against Google Maps Places API Table A
export const DINING_CATEGORIES: DiningCategoryOption[] = [
  {
    id: 'all',
    label: 'All Eats',
    includedPrimaryTypes: [
      'restaurant',
      'cafe',
      'bakery',
      'fast_food_restaurant',
      'brunch_restaurant',
      'bar',
    ],
  },
  {
    id: 'sit_down',
    label: 'Sit-Down',
    includedPrimaryTypes: [
      'restaurant',
      'fine_dining_restaurant',
      'steak_house',
      'italian_restaurant',
      'mexican_restaurant',
      'japanese_restaurant',
      'thai_restaurant',
      'seafood_restaurant',
      'indian_restaurant',
    ],
  },
  {
    id: 'quick',
    label: 'Quick Bites',
    includedPrimaryTypes: [
      'fast_food_restaurant',
      'sandwich_shop',
      'hamburger_restaurant',
      'pizza_restaurant',
      'deli',
      'ramen_restaurant',
    ],
  },
  {
    id: 'coffee',
    label: 'Coffee & Sweet',
    includedPrimaryTypes: [
      'cafe',
      'coffee_shop',
      'bakery',
      'ice_cream_shop',
      'dessert_shop',
      'tea_house',
      'breakfast_restaurant',
    ],
  },
  {
    id: 'drinks',
    label: 'Drinks & Pub',
    includedPrimaryTypes: [
      'bar',
      'pub',
      'sports_bar',
      'brewery',
      'cocktail_bar',
      'wine_bar',
    ],
  },
];

export const RADIUS_PRESETS = [
  { label: '0.5 mi', meters: 805 },
  { label: '1 mi', meters: 1609 },
  { label: '2 mi', meters: 3219 },
  { label: '5 mi', meters: 8047 },
  { label: '10 mi', meters: 16093 },
];

// Curated high-contrast appetizing slice palette (background + text color)
export const SLICE_PALETTE: Array<{ bg: string; text: string }> = [
  { bg: '#E84826', text: '#FFFFFF' }, // Vermilion
  { bg: '#F2A922', text: '#181615' }, // Saffron
  { bg: '#2A7B6F', text: '#FFFFFF' }, // Verdigris
  { bg: '#2D4B73', text: '#FFFFFF' }, // Indigo Slate
  { bg: '#D96B27', text: '#FFFFFF' }, // Burnt Apricot
  { bg: '#7D3C5A', text: '#FFFFFF' }, // Plum
  { bg: '#4E7A44', text: '#FFFFFF' }, // Olive Sage
  { bg: '#EDE7DC', text: '#181615' }, // Warm Linen
];

export function haversineDistanceMeters(a: LatLngPoint, b: LatLngPoint): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistance(meters: number, unit: 'mi' | 'km' = 'mi'): string {
  if (unit === 'km') {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }
  const miles = meters / 1609.344;
  if (miles < 0.1) {
    const feet = Math.round(meters * 3.28084);
    return `${feet} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

export function formatRadiusLabel(meters: number, unit: 'mi' | 'km' = 'mi'): string {
  if (unit === 'km') {
    const km = meters / 1000;
    return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
  }
  const miles = meters / 1609.344;
  return `${miles.toFixed(miles < 1 ? 1 : 1).replace(/\.0$/, '')} mi`;
}

export function formatPriceLevel(priceLevel: string | null): string | null {
  if (!priceLevel) return null;
  switch (priceLevel) {
    case 'FREE':
      return 'Free';
    case 'INEXPENSIVE':
      return '$';
    case 'MODERATE':
      return '$$';
    case 'EXPENSIVE':
      return '$$$';
    case 'VERY_EXPENSIVE':
      return '$$$$';
    default:
      return null;
  }
}

export function toLatLngLiteral(
  loc: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
): LatLngPoint | null {
  if (!loc) return null;
  if (typeof (loc as google.maps.LatLng).lat === 'function') {
    const ll = loc as google.maps.LatLng;
    return { lat: ll.lat(), lng: ll.lng() };
  }
  const lit = loc as google.maps.LatLngLiteral;
  if (typeof lit.lat === 'number' && typeof lit.lng === 'number') {
    return { lat: lit.lat, lng: lit.lng };
  }
  return null;
}

export function getZoomForRadius(meters: number): number {
  if (meters <= 600) return 15.5;
  if (meters <= 1200) return 14.5;
  if (meters <= 2500) return 13.5;
  if (meters <= 5000) return 12.5;
  if (meters <= 10000) return 11.5;
  return 10.5;
}
