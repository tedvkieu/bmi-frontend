import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Gọi trực tiếp sang BE Spring Boot
    const springResponse = await fetch(
      "http://localhost:8080/api/inspection-files",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!springResponse.ok) {
      const errorText = await springResponse.text();
      return NextResponse.json(
        { error: errorText },
        { status: springResponse.status }
      );
    }

    const data = await springResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
