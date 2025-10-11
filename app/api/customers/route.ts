import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(req: Request) {
  try {
    const response = await proxyRequest(req, "/api/customers");
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!response.ok) {
        return NextResponse.json(
          { message: "Spring Boot API error", error: text },
          { status: response.status }
        );
      }
      return new NextResponse(text, {
        status: response.status,
        headers: response.headers,
      });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: "Spring Boot API error", error: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
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

    const params = new URLSearchParams({ page, size });

    if (search) {
      params.append("search", search);
    }
    if (customerType && customerType !== "all") {
      params.append("customerType", customerType);
    }

    console.log(
      "NEXT_PUBLIC_BACKEND_URL  =",
      process.env.NEXT_PUBLIC_BACKEND_URL
    );

    const response = await proxyRequest(
      request,
      `/api/customers/page?${params.toString()}`
    );
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const errorBody = await response.json().catch(() => ({}));
        console.error("Error fetching customers:", errorBody);
        return NextResponse.json(
          { error: "Failed to fetch customers", details: errorBody },
          { status: response.status }
        );
      }

      const text = await response.text();
      console.error("Error fetching customers:", text);
      return NextResponse.json(
        { error: "Failed to fetch customers", details: text },
        { status: response.status }
      );
    }

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: response.headers,
      });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
