import { useCallback, useEffect, useState } from 'react';
import type { GpsStatus, LatLngPoint } from '../types';

export interface GeolocationState {
  coords: LatLngPoint | null;
  accuracyMeters: number | null;
  locationLabel: string;
  status: GpsStatus;
  errorMessage: string | null;
  requestGps: () => void;
  setManualLocation: (coords: LatLngPoint, label: string) => void;
}

export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<LatLngPoint | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>('Detecting GPS...');
  const [status, setStatus] = useState<GpsStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      setLocationLabel('GPS unavailable');
      setErrorMessage(
        'Geolocation is not supported by this browser. Search a city or address to spin.'
      );
      return;
    }

    setStatus('locating');
    setErrorMessage(null);
    setLocationLabel('Locating GPS...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(nextCoords);
        setAccuracyMeters(Math.round(position.coords.accuracy));
        setStatus('ready');
        setLocationLabel('Current GPS');
        setErrorMessage(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setLocationLabel('GPS blocked');
          setErrorMessage(
            'Location permission was denied. Allow GPS access or search an address instead.'
          );
        } else if (err.code === err.TIMEOUT) {
          setStatus('timeout');
          setLocationLabel('GPS timed out');
          setErrorMessage(
            'GPS signal timed out. Try refreshing or pick a neighborhood manually.'
          );
        } else {
          setStatus('error');
          setLocationLabel('Location unavailable');
          setErrorMessage(
            'Unable to read GPS coordinates. Search a city or address to continue.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    requestGps();
  }, [requestGps]);

  const setManualLocation = useCallback(
    (nextCoords: LatLngPoint, label: string) => {
      setCoords(nextCoords);
      setAccuracyMeters(null);
      setLocationLabel(label);
      setStatus('manual');
      setErrorMessage(null);
    },
    []
  );

  return {
    coords,
    accuracyMeters,
    locationLabel,
    status,
    errorMessage,
    requestGps,
    setManualLocation,
  };
}
