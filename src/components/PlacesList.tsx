import React from 'react';
import { Check, MapPin, Plus } from 'lucide-react';
import type { FoodPlace } from '../types';
import {
  SLICE_PALETTE,
  formatDistance,
  formatPriceLevel,
} from '../utils/geo';

interface PlacesListProps {
  places: FoodPlace[];
  winner: FoodPlace | null;
  isLoading: boolean;
  onTogglePlace: (placeId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onFilterTopRated: () => void;
  onInspectPlace: (place: FoodPlace) => void;
}

export const PlacesList: React.FC<PlacesListProps> = ({
  places,
  winner,
  isLoading,
  onTogglePlace,
  onSelectAll,
  onClearAll,
  onFilterTopRated,
  onInspectPlace,
}) => {
  const includedCount = places.filter((p) => p.includedOnWheel).length;

  let activeSliceCounter = 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      {/* Header & Quick Selection Controls */}
      <div className="px-4 py-3 border-b border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2 bg-[#F7F5F0]/60">
        <div>
          <h2 className="font-display font-bold text-base text-[#181615]">
            Nearby Places
          </h2>
          <p className="text-xs text-[#6B655E] tabular-nums">
            {includedCount} of {places.length} on the wheel
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={places.length === 0}
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E5E0D8] text-[#181615] hover:bg-[#EFECE5] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
          >
            All
          </button>
          <button
            type="button"
            onClick={onFilterTopRated}
            disabled={places.length === 0}
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E5E0D8] text-[#181615] hover:bg-[#EFECE5] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
          >
            4.0+ ★
          </button>
          <button
            type="button"
            onClick={onClearAll}
            disabled={includedCount === 0}
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E5E0D8] text-[#6B655E] hover:text-[#181615] hover:bg-[#EFECE5] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Places Tap List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#EFECE5]">
        {isLoading && places.length === 0 && (
          <div className="p-8 text-center text-sm text-[#6B655E]">
            Searching for places to eat in your radius...
          </div>
        )}

        {!isLoading && places.length === 0 && (
          <div className="p-8 text-center">
            <p className="font-display font-bold text-base text-[#181615]">
              No spots found in this radius
            </p>
            <p className="text-xs text-[#6B655E] mt-1">
              Try widening your search radius or switching dining categories.
            </p>
          </div>
        )}

        {places.map((place) => {
          const isWinner = winner?.id === place.id;
          const priceLabel = formatPriceLevel(place.priceLevel);
          const sliceColor = place.includedOnWheel
            ? SLICE_PALETTE[activeSliceCounter++ % SLICE_PALETTE.length].bg
            : '#E5E0D8';

          const metaParts = [
            place.primaryTypeDisplayName,
            priceLabel,
            place.rating !== null
              ? `${place.rating.toFixed(1)} ★${
                  place.userRatingCount ? ` (${place.userRatingCount})` : ''
                }`
              : null,
            formatDistance(place.distanceMeters),
            place.isOpenNow === true
              ? 'Open'
              : place.isOpenNow === false
                ? 'Closed'
                : null,
          ].filter(Boolean);

          return (
            <div
              key={place.id}
              className={`flex items-center gap-3 px-4 py-3 min-h-[64px] transition-colors ${
                isWinner ? 'bg-[#FFF3EE]' : 'hover:bg-[#FAF8F4]'
              }`}
            >
              {/* Color swatch matching wheel slice */}
              <span
                aria-hidden="true"
                className="w-3 h-8 rounded-full shrink-0 transition-colors"
                style={{ backgroundColor: sliceColor }}
              />

              {/* Main row click inspects on map */}
              <button
                type="button"
                onClick={() => onInspectPlace(place)}
                className="flex-1 min-w-0 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-[#181615] truncate">
                    {place.displayName}
                  </p>
                  {isWinner && (
                    <span className="text-[11px] font-bold text-[#E84826] shrink-0">
                      Winner
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B655E] truncate mt-0.5 tabular-nums">
                  {metaParts.join(' · ')}
                </p>
              </button>

              {/* Map inspect icon */}
              <button
                type="button"
                onClick={() => onInspectPlace(place)}
                aria-label={`Locate ${place.displayName} on map`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#6B655E] hover:text-[#181615] hover:bg-[#EFECE5] shrink-0 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
              </button>

              {/* Include/Exclude on wheel toggle */}
              <button
                type="button"
                onClick={() => onTogglePlace(place.id)}
                aria-label={
                  place.includedOnWheel
                    ? `Remove ${place.displayName} from wheel`
                    : `Add ${place.displayName} to wheel`
                }
                aria-pressed={place.includedOnWheel}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-colors shrink-0 cursor-pointer ${
                  place.includedOnWheel
                    ? 'bg-[#181615] border-[#181615] text-white hover:bg-[#2C2826]'
                    : 'bg-white border-[#E5E0D8] text-[#6B655E] hover:border-[#181615] hover:text-[#181615]'
                }`}
              >
                {place.includedOnWheel ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
