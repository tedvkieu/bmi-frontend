import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(req: NextRequest) {
  try {
    const registerNo = req.nextUrl.searchParams.get("registerNo");
    const certificateDate = req.nextUrl.searchParams.get("certificateDate");

    if (!registerNo) {
      return NextResponse.json(
        { error: "Missing registerNo param" },
        { status: 400 }
      );
    }

    // Build query string động
    const queryParams = new URLSearchParams();
    queryParams.append("registerNo", registerNo);
    if (certificateDate) {
      queryParams.append("certificateDate", certificateDate);
    }

    // Gọi sang Spring Boot API
    const res = await fetch(
      `${BACKEND_URL}/api/dossiers/searchByRegisterNoAndCertificateDate?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    console.log("data:", data);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Proxy error" },
      { status: 500 }
    );
  }
}
