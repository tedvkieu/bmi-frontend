import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dossierId = formData.get("dossierId");

    // 🔹 Validate client-side trước
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (
      dossierId === null ||
      (typeof dossierId === "string" && dossierId.trim().length === 0)
    ) {
      formData.delete("dossierId");
    }

    // 🔹 Header forwarding
    const headers = new Headers();
    if (token) headers.set("authorization", `Bearer ${token}`);
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) headers.set("cookie", cookieHeader);

    // 🔹 Gửi request qua Spring API
    const response = await proxyRequest(req, "/api/dossiers/upload-excel", {
      body: formData,
      headers,
      contentType: null,
    });

    const contentType = response.headers.get("content-type") || "";
    const status = response.status;

    // 🔹 Nếu backend trả về non-JSON
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || "Upload failed" },
        { status }
      );
    }

    // 🔹 Parse JSON backend trả về
    const data = await response.json().catch(() => ({}));

    // 🔸 Nếu backend trả lỗi
    if (!response.ok) {
      // 🧩 Nếu là lỗi validation (DossierValidationException)
      if (data?.errors && Array.isArray(data.errors)) {
        // ✅ Trả nguyên cấu trúc backend, không bị mất trường
        return NextResponse.json(
          {
            error: data.error,
            message: data.message,
            errors: data.errors,
            timestamp: data.timestamp,
            status: data.status ?? status,
          },
          { status }
        );
      }

      // 🧩 Các loại lỗi khác
      return NextResponse.json(
        {
          error: data.error || "Upload failed",
          message: data.message || "Unexpected error",
          details: data.details || null,
          timestamp: data.timestamp || new Date().toISOString(),
          status: data.status ?? status,
        },
        { status }
      );
    }

    // ✅ Nếu thành công
    return NextResponse.json(data, { status });
  } catch (err: any) {
    console.error("Upload Excel error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err.message || "Unknown error",
        timestamp: new Date().toISOString(),
        status: 500,
      },
      { status: 500 }
    );
  }
}
