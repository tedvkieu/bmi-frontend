import { NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(req: Request) {
  try {
    const response = await proxyRequest(req, "/api/customers/public");
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
