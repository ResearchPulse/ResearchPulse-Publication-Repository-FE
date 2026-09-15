import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth-server';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  return NextResponse.json({ user });
}
