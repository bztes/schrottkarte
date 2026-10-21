import type { UserRole } from '#lib/types.js';

export const roles: Record<
  UserRole,
  { label: string; description: string; tone: 'pink' | 'primary' | 'neutral' | 'blue' | 'amber' }
> = {
  admin: { label: 'Admin', description: 'All permissions, manages users', tone: 'pink' },
  editor: {
    label: 'Editor',
    description: 'Edits drawings and all markers, export',
    tone: 'primary',
  },
  street: { label: 'Street', description: 'Creates and edits markers', tone: 'blue' },
  spotter: { label: 'Spotter', description: 'Edits markers', tone: 'amber' },
  viewer: { label: 'Viewer', description: 'Read only', tone: 'neutral' },
};
