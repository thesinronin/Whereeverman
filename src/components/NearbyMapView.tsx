import React, { useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, Navigation } from 'lucide-react';
import type { FoodPlace, LatLngPoint } from '../types';
import {
  formatDistance,
  formatPriceLevel,
  getZoomForRadius,
} from '../utils/geo';

interface RadiusCircleOverlayProps {
  center: LatLngPoint;
  radiusMeters: number;
}

const RadiusCircleOverlay: React.FC<RadiusCircleOverlayProps> = ({
  center,
  radiusMeters,
}) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    const circle = new mapsLib.Circle({
      map,
      center,
      radius: radiusMeters,
      strokeColor: '#E84826',
      strokeOpacity: 0.75,
      strokeWeight: 2,
      fillColor: '#E84826',
      fillOpacity: 0.08,
      clickable: false,
    });
    circleRef.current = circle;

    return () => {
      circle.setMap(null);
      circleRef.current = null;
    };
  }, [map, mapsLib]);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setCenter(center);
    circleRef.current.setRadius(radiusMeters);
  }, [center, radiusMeters]);

  return null;
};

interface MapCameraControllerProps {
  center: LatLngPoint;
  radiusMeters: number;
  focusedPlace: FoodPlace | null;
}

const MapCameraController: React.FC<MapCameraControllerProps> = ({
  center,
  radiusMeters,
  focusedPlace,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (focusedPlace) {
      map.panTo(focusedPlace.location);
      const currentZoom = map.getZoom() ?? 14;
      if (currentZoom < 14) {
        map.setZoom(15);
      }
      return;
    }
    map.panTo(center);
    map.setZoom(getZoomForRadius(radiusMeters));
  }, [map, center, radiusMeters, focusedPlace]);

  return null;
};

interface PlaceMarkerItemProps {
  place: FoodPlace;
  isWinner: boolean;
  isSelected: boolean;
  onSelect: (place: FoodPlace) => void;
  onCloseInfo: () => void;
  onToggleWheel: (placeId: string) => void;
}

const PlaceMarkerItem: React.FC<PlaceMarkerItemProps> = ({
  place,
  isWinner,
  isSelected,
  onSelect,
  onCloseInfo,
  onToggleWheel,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const priceLabel = formatPriceLevel(place.priceLevel);

  const pinColors = isWinner
    ? { background: '#E84826', borderColor: '#181615', glyphColor: '#FFFFFF' }
    : place.includedOnWheel
      ? { background: '#2A7B6F', borderColor: '#174A43', glyphColor: '#FFFFFF' }
      : { background: '#B4ADA3', borderColor: '#7C756C', glyphColor: '#FFFFFF' };

  const directionsUrl =
    place.googleMapsURI ||
    `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}&destination_place_id=${encodeURIComponent(place.id)}`;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={place.location}
        title={place.displayName}
        zIndex={isWinner ? 50 : isSelected ? 40 : place.includedOnWheel ? 20 : 10}
        onClick={() => onSelect(place)}
      >
        <Pin
          background={pinColors.background}
          borderColor={pinColors.borderColor}
          glyphColor={pinColors.glyphColor}
          scale={isWinner ? 1.25 : isSelected ? 1.1 : 0.92}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={onCloseInfo}
        >
          <div className="p-1 text-[#181615] font-sans">
            <p className="font-bold text-sm leading-snug">{place.displayName}</p>
            <p className="text-xs text-[#6B655E] mt-0.5 tabular-nums">
              {[
                place.primaryTypeDisplayName,
                priceLabel,
                place.rating ? `${place.rating.toFixed(1)} ★` : null,
                formatDistance(place.distanceMeters),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => onToggleWheel(place.id)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#E5E0D8] bg-[#F7F5F0] hover:bg-[#EFECE5] text-[#181615] cursor-pointer"
              >
                {place.includedOnWheel ? 'Remove from Wheel' : 'Add to Wheel'}
              </button>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#E84826] text-white hover:bg-[#D53E1E]"
              >
                <span>Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface NearbyMapViewProps {
  center: LatLngPoint | null;
  radiusMeters: number;
  places: FoodPlace[];
  winner: FoodPlace | null;
  focusedPlace: FoodPlace | null;
  onSelectPlace: (place: FoodPlace | null) => void;
  onTogglePlace: (placeId: string) => void;
}

export const NearbyMapView: React.FC<NearbyMapViewProps> = ({
  center,
  radiusMeters,
  places,
  winner,
  focusedPlace,
  onSelectPlace,
  onTogglePlace,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (focusedPlace) {
      setSelectedId(focusedPlace.id);
    }
  }, [focusedPlace]);

  if (!center) {
    return (
      <div className="w-full h-full min-h-[340px] rounded-2xl bg-[#EFECE5] border border-[#E5E0D8] flex flex-col items-center justify-center p-6 text-center">
        <Navigation className="w-8 h-8 text-[#E84826] mb-3" />
        <p className="font-display font-bold text-base text-[#181615]">
          Waiting for your location
        </p>
        <p className="text-sm text-[#6B655E] mt-1 max-w-xs">
          Enable GPS or pick a neighborhood to see places to eat inside your radius.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-[#E5E0D8] bg-[#EFECE5] relative">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={center}
        defaultZoom={getZoomForRadius(radiusMeters)}
        gestureHandling="greedy"
        disableDefaultUI={false}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
      >
        <RadiusCircleOverlay center={center} radiusMeters={radiusMeters} />
        <MapCameraController
          center={center}
          radiusMeters={radiusMeters}
          focusedPlace={focusedPlace}
        />

        {/* User GPS Origin Beacon */}
        <AdvancedMarker position={center} title="Your Location" zIndex={60}>
          <div className="w-5 h-5 rounded-full bg-[#2563EB] border-[3px] border-white shadow-md" />
        </AdvancedMarker>

        {places.map((place) => (
          <PlaceMarkerItem
            key={place.id}
            place={place}
            isWinner={winner?.id === place.id}
            isSelected={selectedId === place.id}
            onSelect={(p) => {
              setSelectedId(p.id);
              onSelectPlace(p);
            }}
            onCloseInfo={() => {
              setSelectedId(null);
              onSelectPlace(null);
            }}
            onToggleWheel={onTogglePlace}
          />
        ))}
      </GoogleMap>

      {/* Compact legend strip */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-[#E5E0D8] rounded-xl px-3 py-1.5 text-[11px] font-medium text-[#181615] shadow-sm flex items-center gap-3 pointer-events-none">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          You
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2A7B6F]" />
          On wheel
        </span>
        {winner && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E84826]" />
            Pick
          </span>
        )}
      </div>
    </div>
  );
};
