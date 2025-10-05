import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string}> }
) {
  try {
    const { year } = await params;
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.BACKEND_URL}/api/dossiers/analytics/monthly-chart/${year}`, {
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
