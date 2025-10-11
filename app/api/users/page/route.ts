import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const response = await proxyRequest(
      request,
      `/api/users/page?${params.toString()}`
    );
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const body = await response.json().catch(() => ({}));
        console.error("Error fetching users:", body);
        return NextResponse.json(
          { error: "Failed to fetch users", details: body },
          { status: response.status }
        );
      }

      const text = await response.text();
      console.error("Error fetching users:", text);
      return NextResponse.json(
        { error: "Failed to fetch users", details: text },
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
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
