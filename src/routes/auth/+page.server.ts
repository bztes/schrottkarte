export async function load({ url }) {
  const redirect = url.searchParams.get('redirect');
  return { redirect };
}
