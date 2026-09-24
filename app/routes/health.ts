export async function loader() {
  return Response.json(
    {
      status: 'ok',
      service: 'aki-docs',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
