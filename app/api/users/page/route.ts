import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";

    const params = new URLSearchParams({
      page,
      size,
    });

    console.log("BACKEND_URL  =", process.env.BACKEND_URL);
    const token = request.cookies.get("token")?.value;

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/users/page?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store", // Disable caching for real-time data
      }
    );

    console.log("Response from Spring Boot API:", response);

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
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
