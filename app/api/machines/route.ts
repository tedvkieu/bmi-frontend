import { NextRequest, NextResponse } from "next/server";


const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Gọi trực tiếp sang BE Spring Boot
    const springResponse = await fetch(`${backendUrl}/api/machines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Response from Spring Boot API:", springResponse);
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
