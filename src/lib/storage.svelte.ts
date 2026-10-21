import { browser } from '$app/env';
import { z, type ZodType } from 'zod';

export function createStorage<T extends ZodType>(key: string, schema: T) {
  let value = $state<z.output<typeof schema>>(schema.parse({}));

  if (browser) {
    const stringValue = window.localStorage.getItem(key);
    if (stringValue !== null) {
      const parsed = schema.safeParse(JSON.parse(stringValue));
      if (parsed.success) {
        value = parsed.data;
      }
    }
  }

  $effect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  });

  return {
    getValue: () => value,
    setValue: (newValue: z.input<typeof schema>) => (value = schema.parse(newValue)),
  };
}

/** The last map position, shared by the map and the editor */
export function createMapViewStorage() {
  return createStorage(
    'map',
    z.object({
      center: z
        .object({
          lat: z.number().default(52.516246),
          lng: z.number().default(13.37721),
        })
        .prefault({}),
      zoom: z.number().default(14),
    }),
  );
}
