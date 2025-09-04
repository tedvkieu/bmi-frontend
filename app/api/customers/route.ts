import { NextRequest, NextResponse } from "next/server";

const SPRINGBOOT_API =
  process.env.SPRINGBOOT_API_URL || "http://localhost:8080/api/customers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(SPRINGBOOT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: "Spring Boot API error", error },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Error", error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const search = searchParams.get("search") || "";
    const customerType = searchParams.get("customerType") || "";

    // Build query params for Spring Boot API
    const params = new URLSearchParams({
      page,
      size,
    });

    if (search) {
      params.append("search", search);
    }
    if (customerType && customerType !== "all") {
      params.append("customerType", customerType);
    }

    const response = await fetch(
      `http://localhost:8080/api/customers?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Disable caching for real-time data
      }
    );

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
