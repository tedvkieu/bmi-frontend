import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL  =
  process.env.NEXT_PUBLIC_BACKEND_URL  || "http://localhost:8080";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const springResponse = await fetch(
      `${BACKEND_URL}/api/stats`,
      {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!springResponse.ok) {
      const errorText = await springResponse.text();
      return NextResponse.json(
        { error: errorText },
        { status: springResponse.status }
      );
    }

    const data = await springResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
