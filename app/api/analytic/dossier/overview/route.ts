import { NextRequest, NextResponse } from "next/server";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/dossiers/analytics/overview`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ message: "API error", error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Internal Error", error }, { status: 500 });
  }
}
