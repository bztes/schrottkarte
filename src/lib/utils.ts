import { LngLat, type LngLatLike } from 'maplibre-gl';
import { getContext, setContext } from 'svelte';

export function debounce<T extends unknown[]>(func: (...args: T) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export function watch(...args: unknown[]) {}

export function noop() {}

export function createContext<T>(key: string) {
  return {
    get: () => getContext<T>(key),
    set: (ctx: T) => setContext(key, ctx),
  };
}

export function minutesSince(date: Date) {
  return (Date.now() - date.getTime()) / 1000 / 60;
}

export function postgresTimestampToDate(timestamp: string) {
  return new Date(timestamp + 'Z');
}

export function getFriendlyTime(date: Date) {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `vor ${diffInSeconds} Sekunde${diffInSeconds !== 1 ? 'n' : ''}`;
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `vor ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `vor ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
  }

  return date.toLocaleString();
}

export function canUpdateLocation(date: Date) {
  return minutesSince(date) <= 30;
}

export async function reverseGeocoding(pos: LngLat) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`;
  const response = await fetch(url);
  return response.json();
}

export function stringifyLngLat(lngLat: LngLat) {
  return `${lngLat.lat.toFixed(3)},${lngLat.lng.toFixed(3)}`;
}

export function parserLngLat(value: string): LngLatLike | undefined {
  const split = value.split(',');
  if (split.length !== 2) {
    return undefined;
  }

  const lat = Number.parseFloat(split[0]);
  if (Number.isNaN(lat)) {
    return undefined;
  }

  const lng = Number.parseFloat(split[1]);
  if (Number.isNaN(lng)) {
    return undefined;
  }

  return { lng: lng, lat };
}

export function stringifyZoom(zoom: number) {
  return zoom.toFixed(2);
}

export function parserZoom(value: string): number | undefined {
  const zoom = Number.parseFloat(value);
  if (Number.isNaN(zoom)) {
    return undefined;
  }

  return zoom;
}
