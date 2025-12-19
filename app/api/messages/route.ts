import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'fr';

  try {
    // Dynamic import of messages
    const messages = await import(`@/messages/${locale}.json`);
    return NextResponse.json(messages.default);
  } catch {
    // Fallback to French
    const messages = await import('@/messages/fr.json');
    return NextResponse.json(messages.default);
  }
}
