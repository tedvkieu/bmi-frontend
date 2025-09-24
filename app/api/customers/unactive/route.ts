import { NextRequest, NextResponse } from "next/server";

const BACKEND_API = `${process.env.BACKEND_URL}/api/customers/unactive`;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    const response = await fetch(BACKEND_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Spring Boot error:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch customers (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
