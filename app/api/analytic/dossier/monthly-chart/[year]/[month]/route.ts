import { NextRequest, NextResponse } from "next/server";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string; month: string }> }
) {
  try {
    const { year, month } = await params;
    const token = req.cookies.get("token")?.value;

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/dossiers/analytics/status-by-month/${year}/${month}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      // Attempt to parse error message from backend, defaulting to an empty object
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: "API error from backend", error }, // Added more specific message
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Catch any unexpected errors during the process (e.g., network issues, JSON parsing errors)
    return NextResponse.json(
      { message: "Internal server error", error: String(error) }, // Added more specific message
      { status: 500 }
    );
  }
}