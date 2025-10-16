import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: "Missing dossier id" }, { status: 400 });
  }

  try {
    const backendResponse = await proxyRequest(
      request,
      `/api/dossiers/${id}/details`
    );

    const contentType = backendResponse.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await backendResponse.text();
      if (!backendResponse.ok) {
        return NextResponse.json(
          { error: text || "Failed to fetch dossier details" },
          { status: backendResponse.status }
        );
      }
      return new NextResponse(text, {
        status: backendResponse.status,
        headers: backendResponse.headers,
      });
    }

    const data = await backendResponse.json().catch(() => ({}));
    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data || "Failed to fetch dossier details" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Error fetching dossier details:", error);
    return NextResponse.json(
      { error: "Failed to fetch dossier details" },
      { status: 500 }
    );
  }
}
