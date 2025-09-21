import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const BACKEND_API = `${process.env.BACKEND_URL }/api/inspection-types`;
    const token = request.cookies.get("token")?.value;
    const res = await fetch(BACKEND_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Khi dùng Next.js server → tránh cache cứng
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
