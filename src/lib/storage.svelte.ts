import { browser } from '$app/environment';
import type { z, ZodSchema } from 'zod';

export function createStorage<T extends ZodSchema>(key: string, schema: T) {
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
    setValue: (newValue: z.input<typeof schema>) => (value = newValue),
  };
}
