import { useCallback, useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import type {
  DiningCategoryId,
  FoodPlace,
  LatLngPoint,
  PhotoAttributionInfo,
  PlaceAttributionInfo,
} from '../types';
import {
  DINING_CATEGORIES,
  haversineDistanceMeters,
  toLatLngLiteral,
} from '../utils/geo';

function checkQuotaError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'status' in err
        ? String((err as { status?: unknown }).status)
        : String(err);
  const full = `${msg} ${String(err)}`;
  return (
    full.includes('429') ||
    full.includes('RESOURCE_EXHAUSTED') ||
    full.includes('OVER_QUERY_LIMIT') ||
    full.includes('QuotaExceeded')
  );
}

export interface UseNearbyPlacesParams {
  center: LatLngPoint | null;
  radiusMeters: number;
  categoryId: DiningCategoryId;
  openNowOnly: boolean;
}

export interface UseNearbyPlacesReturn {
  places: FoodPlace[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  togglePlaceOnWheel: (placeId: string) => void;
  setAllIncluded: (included: boolean) => void;
  applyQuickFilter: (mode: 'open' | 'top_rated') => void;
  excludePlace: (placeId: string) => void;
  enrichPlace: (placeId: string) => Promise<FoodPlace | null>;
}

export function useNearbyPlaces({
  center,
  radiusMeters,
  categoryId,
  openNowOnly,
}: UseNearbyPlacesParams): UseNearbyPlacesReturn {
  const placesLib = useMapsLibrary('places');
  const [places, setPlaces] = useState<FoodPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const requestCounterRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!placesLib || !center) return;

    const requestId = ++requestCounterRef.current;
    let cancelled = false;

    const runSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { Place, SearchNearbyRankPreference } = placesLib;
        const category =
          DINING_CATEGORIES.find((c) => c.id === categoryId) ??
          DINING_CATEGORIES[0];

        const clampedRadius = Math.min(Math.max(radiusMeters, 200), 50000);

        const request: google.maps.places.SearchNearbyRequest = {
          fields: [
            'id',
            'displayName',
            'location',
            'formattedAddress',
            'primaryType',
            'primaryTypeDisplayName',
            'types',
            'rating',
            'userRatingCount',
            'priceLevel',
            'openingHours',
            'utcOffsetMinutes',
            'businessStatus',
            'googleMapsURI',
          ],
          locationRestriction: {
            center: { lat: center.lat, lng: center.lng },
            radius: clampedRadius,
          },
          includedPrimaryTypes: category.includedPrimaryTypes,
          maxResultCount: 20,
          rankPreference: SearchNearbyRankPreference.POPULARITY,
        };

        const response = await Place.searchNearby(request);
        if (cancelled || requestId !== requestCounterRef.current) return;

        const rawPlaces = response?.places ?? [];

        const mapped = await Promise.all(
          rawPlaces.map(async (p): Promise<FoodPlace | null> => {
            const loc = toLatLngLiteral(p.location);
            if (!loc || !p.displayName) return null;
            if (p.businessStatus === 'CLOSED_PERMANENTLY') return null;

            let openStatus: boolean | null = null;
            try {
              if (typeof p.isOpen === 'function') {
                const res = await p.isOpen();
                if (typeof res === 'boolean') openStatus = res;
              }
            } catch {
              openStatus = null;
            }

            const attributions: PlaceAttributionInfo[] = (
              p.attributions ?? []
            )
              .filter((a) => Boolean(a?.provider))
              .map((a) => ({
                provider: a.provider ?? '',
                providerURI: a.providerURI ?? undefined,
              }));

            return {
              id: p.id,
              displayName: p.displayName,
              formattedAddress: p.formattedAddress ?? '',
              location: loc,
              primaryType: p.primaryType ?? null,
              primaryTypeDisplayName:
                p.primaryTypeDisplayName ?? 'Restaurant',
              types: p.types ?? [],
              rating: typeof p.rating === 'number' ? p.rating : null,
              userRatingCount:
                typeof p.userRatingCount === 'number'
                  ? p.userRatingCount
                  : null,
              priceLevel: p.priceLevel ? String(p.priceLevel) : null,
              isOpenNow: openStatus,
              businessStatus: p.businessStatus
                ? String(p.businessStatus)
                : null,
              distanceMeters: haversineDistanceMeters(center, loc),
              googleMapsURI: p.googleMapsURI ?? null,
              attributions,
              includedOnWheel: true,
              placeInstance: p,
            };
          })
        );

        if (cancelled || requestId !== requestCounterRef.current) return;

        const validPlaces = mapped
          .filter((item): item is FoodPlace => item !== null)
          .filter((item) => (!openNowOnly ? true : item.isOpenNow !== false))
          .sort((a, b) => a.distanceMeters - b.distanceMeters);

        setPlaces(validPlaces);
      } catch (err) {
        if (cancelled || requestId !== requestCounterRef.current) return;
        if (checkQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setPlaces([]);
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load nearby places to eat.'
        );
      } finally {
        if (!cancelled && requestId === requestCounterRef.current) {
          setIsLoading(false);
        }
      }
    };

    void runSearch();

    return () => {
      cancelled = true;
    };
  }, [placesLib, center, radiusMeters, categoryId, openNowOnly, refreshTick]);

  const togglePlaceOnWheel = useCallback((placeId: string) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, includedOnWheel: !p.includedOnWheel } : p
      )
    );
  }, []);

  const excludePlace = useCallback((placeId: string) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, includedOnWheel: false } : p
      )
    );
  }, []);

  const setAllIncluded = useCallback((included: boolean) => {
    setPlaces((prev) => prev.map((p) => ({ ...p, includedOnWheel: included })));
  }, []);

  const applyQuickFilter = useCallback((mode: 'open' | 'top_rated') => {
    setPlaces((prev) =>
      prev.map((p) => {
        if (mode === 'open') {
          return { ...p, includedOnWheel: p.isOpenNow === true };
        }
        return {
          ...p,
          includedOnWheel: p.rating !== null && p.rating >= 4.0,
        };
      })
    );
  }, []);

  const enrichPlace = useCallback(
    async (placeId: string): Promise<FoodPlace | null> => {
      const target = places.find((p) => p.id === placeId);
      if (!target) return null;
      if (target.isEnriched || !target.placeInstance) return target;

      try {
        await target.placeInstance.fetchFields({
          fields: [
            'photos',
            'editorialSummary',
            'websiteURI',
            'nationalPhoneNumber',
          ],
        });

        const firstPhoto = target.placeInstance.photos?.[0];
        const photoUri = firstPhoto
          ? firstPhoto.getURI({ maxWidth: 800, maxHeight: 520 })
          : null;
        const photoAttributions: PhotoAttributionInfo[] = (
          firstPhoto?.authorAttributions ?? []
        ).map((a) => ({
          displayName: a.displayName ?? 'Google Maps Contributor',
          uri: a.uri ?? undefined,
        }));

        const enriched: FoodPlace = {
          ...target,
          photoUri,
          photoAttributions,
          editorialSummary: target.placeInstance.editorialSummary ?? null,
          websiteURI: target.placeInstance.websiteURI ?? null,
          nationalPhoneNumber:
            target.placeInstance.nationalPhoneNumber ?? null,
          isEnriched: true,
        };

        setPlaces((prev) =>
          prev.map((p) => (p.id === placeId ? enriched : p))
        );
        return enriched;
      } catch (err) {
        if (checkQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        return target;
      }
    },
    [places]
  );

  return {
    places,
    isLoading,
    error,
    refresh,
    togglePlaceOnWheel,
    setAllIncluded,
    applyQuickFilter,
    excludePlace,
    enrichPlace,
  };
}
