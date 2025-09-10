export const runtime = 'edge'

export function GET() {
  return new Response(
    JSON.stringify({ runtime: 'edge', now: new Date().toISOString() }),
    { headers: { 'content-type': 'application/json' } },
  )
}

