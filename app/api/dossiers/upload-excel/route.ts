import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dossierId = formData.get("dossierId");

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (
      dossierId === null ||
      (typeof dossierId === "string" && dossierId.trim().length === 0)
    ) {
      formData.delete("dossierId");
    }

    const headers = new Headers();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }

    const response = await proxyRequest(
      req,
      "/api/dossiers/upload-excel",
      {
        body: formData,
        headers,
        contentType: null,
      }
    );
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!response.ok) {
        return NextResponse.json(
          { error: text || "Upload failed" },
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
        { error: data || "Upload failed" },
        { status: response.status }
      );
    }

    console.log("Spring Response JSON:", data);
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
