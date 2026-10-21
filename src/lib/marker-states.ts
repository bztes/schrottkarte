import { markerStates, type MarkerState } from '#lib/types.js';

export const stateColors: Record<MarkerState, string> = {
  new: '#e11d48',
  marked: '#eab308',
  done: '#16a34a',
};

/** outline of markers that are not synced to the server yet */
export const unsyncedColor = '#f97316';

export const stateNames: Record<MarkerState, string> = {
  new: 'New',
  marked: 'Marked',
  done: 'Done',
};

export const stateOptions = markerStates.map((state) => ({
  value: state,
  label: stateNames[state],
}));
