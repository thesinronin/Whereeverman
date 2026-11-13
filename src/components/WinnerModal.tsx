import React, { useEffect } from 'react';
import {
  Dices,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import type { FoodPlace } from '../types';
import { formatDistance, formatPriceLevel } from '../utils/geo';

interface WinnerModalProps {
  winner: FoodPlace | null;
  canSpinAgain: boolean;
  canDropAndSpin: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onDropAndSpin: (placeId: string) => void;
  onEnrichPlace: (placeId: string) => Promise<FoodPlace | null>;
  onViewOnMap: (place: FoodPlace) => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  canSpinAgain,
  canDropAndSpin,
  onClose,
  onSpinAgain,
  onDropAndSpin,
  onEnrichPlace,
  onViewOnMap,
}) => {
  useEffect(() => {
    if (winner && !winner.isEnriched) {
      void onEnrichPlace(winner.id);
    }
  }, [winner, onEnrichPlace]);

  if (!winner) return null;

  const priceLabel = formatPriceLevel(winner.priceLevel);
  const metaParts = [
    winner.primaryTypeDisplayName,
    priceLabel,
    winner.rating !== null
      ? `${winner.rating.toFixed(1)} ★${
          winner.userRatingCount ? ` (${winner.userRatingCount})` : ''
        }`
      : null,
    `${formatDistance(winner.distanceMeters)} away`,
    winner.isOpenNow === true
      ? 'Open now'
      : winner.isOpenNow === false
        ? 'Closed now'
        : null,
  ].filter(Boolean);

  const directionsUrl =
    winner.googleMapsURI ||
    `https://www.google.com/maps/dir/?api=1&destination=${winner.location.lat},${winner.location.lng}&destination_place_id=${encodeURIComponent(winner.id)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Selected restaurant: ${winner.displayName}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#F7F5F0] rounded-t-3xl sm:rounded-3xl border border-[#E5E0D8] shadow-2xl overflow-hidden pb-safe"
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-[#D5CFC6] rounded-full mx-auto mt-3 sm:hidden" />

        {/* Place Photo Hero with CSS Fallback */}
        <div className="relative h-44 w-full bg-[#EFECE5] mt-2 sm:mt-0 overflow-hidden">
          {winner.photoUri ? (
            <img
              src={winner.photoUri}
              alt={winner.displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F2A922]/25 via-[#E84826]/15 to-[#2A7B6F]/20">
              <Utensils className="w-9 h-9 text-[#E84826] mb-1.5" />
              <span className="text-xs font-medium text-[#6B655E]">
                {winner.primaryTypeDisplayName}
              </span>
            </div>
          )}

          {/* Measured scrim for close button legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close result"
            className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 backdrop-blur-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
              Tonight&apos;s Pick
            </p>
            <h2 className="font-display font-extrabold text-2xl leading-tight text-balance">
              {winner.displayName}
            </h2>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs sm:text-sm font-medium text-[#6B655E] tabular-nums">
            {metaParts.join(' · ')}
          </p>

          {winner.editorialSummary && (
            <p className="text-sm text-[#181615] leading-relaxed">
              {winner.editorialSummary}
            </p>
          )}

          <div className="space-y-2 text-xs text-[#6B655E] border-t border-[#E5E0D8] pt-3">
            {winner.formattedAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E84826] shrink-0 mt-0.5" />
                <span className="text-[#181615]">{winner.formattedAddress}</span>
              </div>
            )}
            {winner.nationalPhoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#6B655E] shrink-0" />
                <a
                  href={`tel:${winner.nationalPhoneNumber}`}
                  className="text-[#181615] underline decoration-[#D5CFC6] hover:decoration-[#181615]"
                >
                  {winner.nationalPhoneNumber}
                </a>
              </div>
            )}
          </div>

          {/* Primary Actions */}
          <div className="space-y-2.5 pt-1">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#E84826] hover:bg-[#D53E1E] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#E84826]/20 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Open Directions in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onViewOnMap(winner)}
                className="min-h-[44px] px-3 py-2.5 rounded-xl bg-white border border-[#E5E0D8] hover:bg-[#EFECE5] text-xs font-semibold text-[#181615] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Show on Map</span>
              </button>

              <button
                type="button"
                disabled={!canSpinAgain}
                onClick={onSpinAgain}
                className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#181615] hover:bg-[#2C2826] disabled:opacity-40 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5 text-[#F2A922]" />
                <span>Spin Again</span>
              </button>
            </div>

            {canDropAndSpin && (
              <button
                type="button"
                onClick={() => onDropAndSpin(winner.id)}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#6B655E] hover:text-[#181615] hover:bg-[#EFECE5] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Not feeling this — drop &amp; spin again</span>
              </button>
            )}
          </div>

          {/* Required Google Maps Photo & Place Attributions */}
          {((winner.photoAttributions && winner.photoAttributions.length > 0) ||
            winner.attributions.length > 0) && (
            <div className="pt-2 border-t border-[#E5E0D8] text-[11px] text-[#6B655E] space-y-1">
              {winner.photoAttributions &&
                winner.photoAttributions.length > 0 && (
                  <p>
                    Photo:{' '}
                    {winner.photoAttributions.map((attr, i) => (
                      <React.Fragment key={`${attr.displayName}-${i}`}>
                        {i > 0 && ', '}
                        {attr.uri ? (
                          <a
                            href={attr.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {attr.displayName}
                          </a>
                        ) : (
                          attr.displayName
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                )}
              {winner.attributions.length > 0 && (
                <p>
                  Data:{' '}
                  {winner.attributions.map((attr, i) => (
                    <React.Fragment key={`${attr.provider}-${i}`}>
                      {i > 0 && ', '}
                      {attr.providerURI ? (
                        <a
                          href={attr.providerURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {attr.provider}
                        </a>
                      ) : (
                        attr.provider
                      )}
                    </React.Fragment>
                  ))}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
