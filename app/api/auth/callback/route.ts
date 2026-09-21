import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const search = requestUrl.search;
  const origin = requestUrl.origin;

  return NextResponse.redirect(`${origin}/auth/callback${search}`);
}

