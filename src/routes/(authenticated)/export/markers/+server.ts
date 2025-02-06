import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Papa from 'papaparse';
import type { Point } from 'geojson';

export const GET: RequestHandler = async ({ locals }) => {
  const { data, error } = await locals.supabase
    .from('markers')
    .select('id, name, description, state, location, created_at, updated_at');

  if (error) {
    return json({ error: 'Error fetching data' }, { status: 500 });
  }

  const csvContent = Papa.unparse(
    data.map((r) => {
      const location = r.location as Point;
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        state: r.state,
        lng: location.coordinates[0],
        lat: location.coordinates[1],
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    }),
  );

  // Create a Response with CSV content
  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="markers.csv"',
    },
  });
};
