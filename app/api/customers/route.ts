import { NextRequest, NextResponse } from "next/server";

const BACKEND_API = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers`;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(BACKEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Response from Spring Boot API:", res);

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

    console.log("NEXT_PUBLIC_BACKEND_URL  =", process.env.NEXT_PUBLIC_BACKEND_URL);
    const token = request.cookies.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/page?${params.toString()}`,
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
