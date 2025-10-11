import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(request: NextRequest) {
  try {
    const response = await proxyRequest(request, "/api/customers/unactive");
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const body = await response.json().catch(() => ({}));
        console.error("Spring Boot error:", body);
        return NextResponse.json(
          { error: `Failed to fetch customers (${response.status})`, details: body },
          { status: response.status }
        );
      }

      const text = await response.text();
      console.error("Spring Boot error:", text);
      return NextResponse.json(
        { error: `Failed to fetch customers (${response.status})`, details: text },
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
