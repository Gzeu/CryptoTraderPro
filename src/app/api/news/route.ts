import { NextRequest, NextResponse } from 'next/server'

const CRYPTOPANIC_BASE = 'https://cryptopanic.com/api/v1/posts/'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const currency = searchParams.get('currency') ?? ''
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50)

  const apiKey = process.env.CRYPTOPANIC_API_KEY ?? 'free'

  const params = new URLSearchParams({
    auth_token: apiKey,
    public: 'true',
    kind: 'news',
    ...(currency && { currencies: currency.toUpperCase() }),
  })

  try {
    const res = await fetch(`${CRYPTOPANIC_BASE}?${params}`, {
      next: { revalidate: 300 }, // cache 5 min
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `CryptoPanic API error: ${res.status}` },
        { status: res.status }
      )
    }
    const data = await res.json()
    // Return only `limit` results
    return NextResponse.json({
      ...data,
      results: (data.results ?? []).slice(0, limit),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
