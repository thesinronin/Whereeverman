import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  Clock,
  Crosshair,
  Disc3,
  ListChecks,
  Map as MapIcon,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { LocationPickerSheet } from './components/LocationPickerSheet';
import { NearbyMapView } from './components/NearbyMapView';
import { PlacesList } from './components/PlacesList';
import { RouletteWheel } from './components/RouletteWheel';
import { WinnerModal } from './components/WinnerModal';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyPlaces } from './hooks/useNearbyPlaces';
import type { DiningCategoryId, FoodPlace, MobileTab } from './types';
import {
  DINING_CATEGORIES,
  RADIUS_PRESETS,
  formatRadiusLabel,
} from './utils/geo';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function WhereEverWorkspace() {
  const {
    coords,
    locationLabel,
    status: gpsStatus,
    errorMessage: gpsError,
    requestGps,
    setManualLocation,
  } = useGeolocation();

  const [radiusMeters, setRadiusMeters] = useState<number>(1609); // 1 mile default
  const [categoryId, setCategoryId] = useState<DiningCategoryId>('all');
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('wheel');
  const [desktopRightTab, setDesktopRightTab] = useState<'map' | 'places'>(
    'map'
  );
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  const [winner, setWinner] = useState<FoodPlace | null>(null);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [focusedPlace, setFocusedPlace] = useState<FoodPlace | null>(null);
  const [spinRequestCount, setSpinRequestCount] = useState(0);
  const [shuffledIds, setShuffledIds] = useState<string[]>([]);

  const {
    places,
    isLoading: placesLoading,
    error: placesError,
    refresh: refreshPlaces,
    togglePlaceOnWheel,
    setAllIncluded,
    applyQuickFilter,
    excludePlace,
    enrichPlace,
  } = useNearbyPlaces({
    center: coords,
    radiusMeters,
    categoryId,
    openNowOnly,
  });

  // Reset shuffle order whenever the underlying places list changes
  useEffect(() => {
    setShuffledIds(places.map((p) => p.id));
  }, [places]);

  // Keep winner synced with enriched data when places array updates
  const activeWinner = useMemo(() => {
    if (!winner) return null;
    return places.find((p) => p.id === winner.id) ?? winner;
  }, [winner, places]);

  const wheelSlices = useMemo(() => {
    const byId: Record<string, FoodPlace> = {};
    for (const p of places) {
      byId[p.id] = p;
    }
    const ordered: FoodPlace[] = [];
    for (const id of shuffledIds) {
      const item = byId[id];
      if (item && item.includedOnWheel) {
        ordered.push(item);
      }
    }
    // Include any new items not yet in shuffledIds
    for (const p of places) {
      if (p.includedOnWheel && !ordered.some((o) => o.id === p.id)) {
        ordered.push(p);
      }
    }
    return ordered;
  }, [places, shuffledIds]);

  const handleShuffle = useCallback(() => {
    setShuffledIds((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
  }, []);

  const handleSpinStart = useCallback(() => {
    setWinnerModalOpen(false);
  }, []);

  const handleSpinComplete = useCallback((picked: FoodPlace) => {
    setWinner(picked);
    setFocusedPlace(picked);
    setWinnerModalOpen(true);
  }, []);

  const handleSpinAgain = useCallback(() => {
    setWinnerModalOpen(false);
    setTimeout(() => {
      setSpinRequestCount((c) => c + 1);
    }, 120);
  }, []);

  const handleDropAndSpin = useCallback(
    (placeId: string) => {
      excludePlace(placeId);
      setWinnerModalOpen(false);
      setTimeout(() => {
        setSpinRequestCount((c) => c + 1);
      }, 160);
    },
    [excludePlace]
  );

  const handleInspectPlace = useCallback((place: FoodPlace) => {
    setFocusedPlace(place);
    setDesktopRightTab('map');
    setMobileTab('map');
  }, []);

  const handleViewWinnerOnMap = useCallback((place: FoodPlace) => {
    setWinnerModalOpen(false);
    setFocusedPlace(place);
    setDesktopRightTab('map');
    setMobileTab('map');
  }, []);

  const needsLocationAction =
    !coords &&
    (gpsStatus === 'denied' ||
      gpsStatus === 'unavailable' ||
      gpsStatus === 'timeout' ||
      gpsStatus === 'error');

  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F5F0] text-[#181615]">
      {/* Compact Sticky Top Bar (52px height to stay well under mobile sticky cap) */}
      <header className="sticky top-0 z-30 h-13 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto h-full px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Zone 1: Single-line Brand Wordmark */}
          <span className="font-display font-extrabold text-xl tracking-tight text-[#181615] whitespace-nowrap shrink-0">
            where ever
          </span>

          {/* Zone 2 (Desktop): Quick Summary */}
          <p className="hidden md:block text-xs text-[#6B655E] tabular-nums truncate">
            {coords
              ? `${places.length} places found within ${formatRadiusLabel(radiusMeters)}`
              : 'Waiting for location'}
          </p>

          {/* Zone 3: Single Primary Location Action */}
          <button
            type="button"
            onClick={() => setLocationSheetOpen(true)}
            className="min-h-[40px] max-w-[200px] sm:max-w-[260px] px-3 py-1.5 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#181615] text-xs font-semibold text-[#181615] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#E84826] shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-4 lg:py-6 pb-20 lg:pb-8">
        {/* GPS Prompt Banner if permission denied or failed */}
        {needsLocationAction && (
          <div className="mb-4 p-4 rounded-2xl bg-white border border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold text-base text-[#181615]">
                Share your location to load nearby food spots
              </p>
              <p className="text-xs text-[#6B655E] mt-0.5">
                {gpsError ||
                  'Allow browser GPS or search a neighborhood to fill the roulette wheel.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={requestGps}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#181615] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5 text-[#F2A922]" />
                <span>Retry GPS</span>
              </button>
              <button
                type="button"
                onClick={() => setLocationSheetOpen(true)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E84826] text-white text-xs font-semibold cursor-pointer"
              >
                Search Address
              </button>
            </div>
          </div>
        )}

        {placesError && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center justify-between gap-3">
            <span>{placesError}</span>
            <button
              type="button"
              onClick={refreshPlaces}
              className="min-h-[36px] px-3 py-1 rounded-lg bg-white text-[#991B1B] font-semibold shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Controls + Roulette Wheel */}
          <section
            className={`lg:col-span-5 space-y-4 ${
              mobileTab === 'wheel' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Radius & Food Filter Card */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-4">
              {/* Radius Header + Slider */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label
                    htmlFor="radius-range"
                    className="text-xs font-semibold text-[#6B655E]"
                  >
                    Search Radius
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm text-[#181615] tabular-nums">
                      {formatRadiusLabel(radiusMeters)}
                    </span>
                    <button
                      type="button"
                      onClick={refreshPlaces}
                      disabled={!coords || placesLoading}
                      aria-label="Refresh nearby places"
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-[#EFECE5] text-[#6B655E] disabled:opacity-40 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          placesLoading ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <input
                  id="radius-range"
                  type="range"
                  min={400}
                  max={16093}
                  step={100}
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full radius-slider"
                />

                {/* Quick Radius Preset Buttons */}
                <div className="grid grid-cols-5 gap-1.5 mt-2.5">
                  {RADIUS_PRESETS.map((preset) => {
                    const active = Math.abs(radiusMeters - preset.meters) < 120;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setRadiusMeters(preset.meters)}
                        className={`min-h-[36px] py-1 px-1 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-[#181615] text-white'
                            : 'bg-[#F7F5F0] text-[#6B655E] hover:bg-[#EFECE5] hover:text-[#181615]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter Strip + Open Now Toggle */}
              <div className="pt-3 border-t border-[#EFECE5] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#6B655E]">
                    Craving
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenNowOnly((prev) => !prev)}
                    aria-pressed={openNowOnly}
                    className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      openNowOnly
                        ? 'bg-[#2A7B6F] border-[#2A7B6F] text-white'
                        : 'bg-[#F7F5F0] border-[#E5E0D8] text-[#6B655E] hover:text-[#181615]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Open Now</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {DINING_CATEGORIES.map((cat) => {
                    const active = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#E84826] text-white'
                            : 'bg-[#F7F5F0] text-[#6B655E] hover:bg-[#EFECE5] hover:text-[#181615]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Roulette Wheel Card */}
            <div className="bg-white rounded-3xl border border-[#E5E0D8] p-4 sm:p-5">
              <RouletteWheel
                slices={wheelSlices}
                winner={activeWinner}
                isLoading={placesLoading}
                spinRequestCount={spinRequestCount}
                onSpinStart={handleSpinStart}
                onSpinComplete={handleSpinComplete}
                onShuffle={handleShuffle}
              />

              {/* Mobile quick switch to edit slices */}
              <div className="mt-4 pt-3 border-t border-[#EFECE5] flex items-center justify-between text-xs text-[#6B655E] lg:hidden">
                <span className="tabular-nums">
                  {wheelSlices.length} of {places.length} spots active
                </span>
                <button
                  type="button"
                  onClick={() => setMobileTab('places')}
                  className="font-semibold text-[#E84826] hover:underline py-1 cursor-pointer"
                >
                  Customize places
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Map & Places Roster */}
          <section
            className={`lg:col-span-7 ${
              mobileTab === 'map' || mobileTab === 'places'
                ? 'block'
                : 'hidden lg:block'
            }`}
          >
            {/* Desktop Right-Panel Switcher */}
            <div className="hidden lg:flex items-center justify-between mb-3">
              <div className="inline-flex items-center p-1 bg-[#EFECE5] rounded-xl border border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setDesktopRightTab('map')}
                  className={`min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    desktopRightTab === 'map'
                      ? 'bg-white text-[#181615] shadow-xs'
                      : 'text-[#6B655E] hover:text-[#181615]'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Live Radius Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopRightTab('places')}
                  className={`min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    desktopRightTab === 'places'
                      ? 'bg-white text-[#181615] shadow-xs'
                      : 'text-[#6B655E] hover:text-[#181615]'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span className="tabular-nums">
                    Places ({wheelSlices.length}/{places.length})
                  </span>
                </button>
              </div>

              {activeWinner && (
                <button
                  type="button"
                  onClick={() => setWinnerModalOpen(true)}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#181615] text-xs font-semibold text-[#181615] cursor-pointer"
                >
                  View Pick: {activeWinner.displayName}
                </button>
              )}
            </div>

            {/* Map Panel */}
            <div
              className={`h-[calc(100dvh-165px)] min-h-[380px] lg:h-[640px] ${
                mobileTab === 'map'
                  ? 'block lg:block'
                  : desktopRightTab === 'map'
                    ? 'hidden lg:block'
                    : 'hidden'
              }`}
            >
              <NearbyMapView
                center={coords}
                radiusMeters={radiusMeters}
                places={places}
                winner={activeWinner}
                focusedPlace={focusedPlace}
                onSelectPlace={setFocusedPlace}
                onTogglePlace={togglePlaceOnWheel}
              />
            </div>

            {/* Places List Panel */}
            <div
              className={`h-[calc(100dvh-165px)] min-h-[380px] lg:h-[640px] ${
                mobileTab === 'places'
                  ? 'block lg:hidden'
                  : desktopRightTab === 'places'
                    ? 'hidden lg:block'
                    : 'hidden'
              }`}
            >
              <PlacesList
                places={places}
                winner={activeWinner}
                isLoading={placesLoading}
                onTogglePlace={togglePlaceOnWheel}
                onSelectAll={() => setAllIncluded(true)}
                onClearAll={() => setAllIncluded(false)}
                onFilterTopRated={() => applyQuickFilter('top_rated')}
                onInspectPlace={handleInspectPlace}
              />
            </div>
          </section>
        </div>

        {/* Quiet Legal & Google Maps Attribution Footer */}
        <footer className="mt-8 pt-4 border-t border-[#E5E0D8] text-[11px] text-[#6B655E] flex flex-wrap items-center justify-between gap-2">
          <span>where ever · Powered by Google Maps Platform</span>
          <div className="flex items-center gap-3">
            <a
              href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Google Maps Terms
            </a>
            <a
              href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Google Privacy Policy
            </a>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Thumb Navigation Bar (56px height) */}
      <nav
        aria-label="Primary navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] pb-safe"
      >
        <div className="grid grid-cols-3 h-14">
          <button
            type="button"
            onClick={() => setMobileTab('wheel')}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              mobileTab === 'wheel' ? 'text-[#E84826]' : 'text-[#6B655E]'
            }`}
          >
            <Disc3 className="w-5 h-5" />
            <span className="text-[11px] font-semibold tracking-tight">
              Wheel
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              mobileTab === 'map' ? 'text-[#E84826]' : 'text-[#6B655E]'
            }`}
          >
            <MapIcon className="w-5 h-5" />
            <span className="text-[11px] font-semibold tracking-tight">
              Map
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('places')}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              mobileTab === 'places' ? 'text-[#E84826]' : 'text-[#6B655E]'
            }`}
          >
            <ListChecks className="w-5 h-5" />
            <span className="text-[11px] font-semibold tracking-tight tabular-nums">
              Places ({wheelSlices.length})
            </span>
          </button>
        </div>
      </nav>

      {/* Modals / Bottom Sheets */}
      <LocationPickerSheet
        isOpen={locationSheetOpen}
        gpsStatus={gpsStatus}
        gpsError={gpsError}
        currentLabel={locationLabel}
        onClose={() => setLocationSheetOpen(false)}
        onRequestGps={requestGps}
        onSelectManualLocation={setManualLocation}
      />

      {winnerModalOpen && (
        <WinnerModal
          winner={activeWinner}
          canSpinAgain={wheelSlices.length >= 2}
          canDropAndSpin={wheelSlices.length >= 3}
          onClose={() => setWinnerModalOpen(false)}
          onSpinAgain={handleSpinAgain}
          onDropAndSpin={handleDropAndSpin}
          onEnrichPlace={enrichPlace}
          onViewOnMap={handleViewWinnerOnMap}
        />
      )}
    </div>
  );
}

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  if (!MAPS_API_KEY) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#F7F5F0] p-6 text-center">
        <div className="max-w-md bg-white border border-[#E5E0D8] rounded-3xl p-6 space-y-2">
          <h1 className="font-display font-bold text-xl text-[#181615]">
            where ever
          </h1>
          <p className="text-sm text-[#6B655E]">
            Google Maps API key is not configured. Enable Google Maps Platform
            in AI Studio or set <code>VITE_GOOGLE_MAPS_API_KEY</code> to load
            nearby restaurants.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <APIProvider apiKey={MAPS_API_KEY} language="en" region="US">
        <WhereEverWorkspace />
      </APIProvider>
    </>
  );
}
