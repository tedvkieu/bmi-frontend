import { NextRequest, NextResponse } from "next/server";


const BACKEND_API = process.env.BACKEND_URL;

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Thiếu thông tin mật khẩu" }, { status: 400 });
    }

    // Gọi Spring Boot backend
    const backendRes = await fetch(`${BACKEND_API}/api/customers/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json({ message: data.message || "Đổi mật khẩu thất bại" }, { status: backendRes.status });
    }

    // Xóa token cũ để user login lại
    const response = NextResponse.json({ message: data.message });
    response.cookies.set("token", "", { path: "/", expires: new Date(0) });

    return response;
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json({ message: err.message || "Đổi mật khẩu thất bại" }, { status: 500 });
  }
}
