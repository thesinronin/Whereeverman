import React, { useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Crosshair, MapPin, Search, X } from 'lucide-react';
import { useAutocompleteSuggestions } from '../hooks/useAutocompleteSuggestions';
import type { GpsStatus, LatLngPoint } from '../types';
import { toLatLngLiteral } from '../utils/geo';

interface LocationPickerSheetProps {
  isOpen: boolean;
  gpsStatus: GpsStatus;
  gpsError: string | null;
  currentLabel: string;
  onClose: () => void;
  onRequestGps: () => void;
  onSelectManualLocation: (coords: LatLngPoint, label: string) => void;
}

export const LocationPickerSheet: React.FC<LocationPickerSheetProps> = ({
  isOpen,
  gpsStatus,
  gpsError,
  currentLabel,
  onClose,
  onRequestGps,
  onSelectManualLocation,
}) => {
  const placesLib = useMapsLibrary('places');
  const [query, setQuery] = useState('');
  const [resolving, setResolving] = useState(false);

  const { suggestions, isLoading, resetSession } =
    useAutocompleteSuggestions(query);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!placesLib || !suggestion.placePrediction) return;
    setResolving(true);
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });
      const coords = toLatLngLiteral(place.location);
      if (coords) {
        const label =
          place.displayName ||
          suggestion.placePrediction.mainText?.text ||
          place.formattedAddress ||
          'Custom Location';
        onSelectManualLocation(coords, label);
        resetSession();
        onClose();
      }
    } finally {
      setResolving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose your location"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#F7F5F0] rounded-t-3xl sm:rounded-3xl border border-[#E5E0D8] shadow-2xl overflow-hidden pb-safe"
      >
        <div className="w-10 h-1.5 bg-[#D5CFC6] rounded-full mx-auto mt-3 sm:hidden" />

        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#E5E0D8]">
          <div>
            <h2 className="font-display font-bold text-lg text-[#181615]">
              Set Search Location
            </h2>
            <p className="text-xs text-[#6B655E]">
              Active: {currentLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location picker"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-[#EFECE5] text-[#181615] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Live GPS Trigger */}
          <button
            type="button"
            onClick={() => {
              onRequestGps();
              onClose();
            }}
            className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#181615] hover:bg-[#2C2826] text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-[#F2A922]" />
            <span>
              {gpsStatus === 'locating'
                ? 'Detecting Live GPS...'
                : 'Use My Live GPS Location'}
            </span>
          </button>

          {gpsError && (
            <p className="text-xs text-[#B91C1C] bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-3.5 py-2.5">
              {gpsError}
            </p>
          )}

          {/* Address / City Search via Places AutocompleteSuggestion */}
          <div>
            <label
              htmlFor="location-search-input"
              className="block text-xs font-semibold text-[#6B655E] mb-1.5"
            >
              Or search a city, neighborhood, or address
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B655E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="location-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. SoHo New York, Austin TX, 94107..."
                autoFocus
                className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E5E0D8] text-sm text-[#181615] placeholder:text-[#9A938A] focus:outline-none focus:border-[#E84826]"
              />
            </div>
          </div>

          {/* Suggestions List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#E5E0D8] rounded-2xl bg-white border border-[#E5E0D8] empty:hidden">
            {(isLoading || resolving) && (
              <div className="px-4 py-3 text-xs text-[#6B655E]">
                {resolving ? 'Setting location...' : 'Searching places...'}
              </div>
            )}

            {!isLoading &&
              !resolving &&
              suggestions.map((s, index) => {
                const main =
                  s.placePrediction?.mainText?.text ||
                  s.placePrediction?.text?.text ||
                  'Location';
                const secondary = s.placePrediction?.secondaryText?.text;
                return (
                  <button
                    key={s.placePrediction?.placeId || index}
                    type="button"
                    onClick={() => void handleSelectSuggestion(s)}
                    className="w-full min-h-[52px] px-4 py-2.5 text-left hover:bg-[#F7F5F0] flex items-start gap-3 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#E84826] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#181615] truncate">
                        {main}
                      </p>
                      {secondary && (
                        <p className="text-xs text-[#6B655E] truncate">
                          {secondary}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}

            {!isLoading &&
              !resolving &&
              query.trim().length > 1 &&
              suggestions.length === 0 && (
                <div className="px-4 py-3 text-xs text-[#6B655E]">
                  No matching locations found. Try a street, neighborhood, or city.
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
