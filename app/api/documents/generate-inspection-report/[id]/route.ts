import { NextResponse } from "next/server";


const BACKEND_URL  = process.env.BACKEND_URL  || "http://localhost:8080";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    console.log("Generating inspection report for ID:", id);

    const springResponse = await fetch(
      `${BACKEND_URL}/api/documents/generate-inspection-report/${id}`,
      {
        method: "GET",
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
