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

/** Extracts a message from thrown values, including SvelteKit's `HttpError` thrown by remote functions */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'body' in error) {
    const body = (error as { body?: { message?: string } }).body;
    if (body?.message) {
      return body.message;
    }
  }
  return String(error);
}

export function getFriendlyTime(date: Date) {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 30 * 86400) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString();
}

export function canUpdateLocation(date: Date) {
  return minutesSince(date) <= 30;
}

export async function reverseGeocoding(pos: LngLat) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&zoom=18&layer=address&format=json`;
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

/** Lets the browser save the content as a file */
export function downloadFile(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // revoking right away can cancel the download before the browser started it
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
