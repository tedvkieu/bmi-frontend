import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string; month: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value;
    
    const { year, month } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dossiers/analytics/status-by-month/${year}/${month}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ message: "API error", error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ message: "Internal Error", error }, { status: 500 });
  }
}
