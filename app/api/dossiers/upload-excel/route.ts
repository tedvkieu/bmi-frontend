import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const springResponse = await fetch(
      `${process.env.BACKEND_URL}/api/dossiers/upload-excel`,
      {
        method: "POST",
        headers: {
          // "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      }
    );

    if (!springResponse.ok) {
      const text = await springResponse.text();
      return NextResponse.json(
        { error: text },
        { status: springResponse.status }
      );
    }

    const data = await springResponse.json();
    console.log("Spring Response JSON:", data);

    return NextResponse.json(data, { status: springResponse.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
