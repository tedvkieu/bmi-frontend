import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No authentication token" }, { status: 401 });
    }

    const res = await fetch(`${process.env.BACKEND_URL}/api/customers/reject/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Backend có thể trả rỗng → tránh lỗi JSON parse
    let data: any = { success: true, message: "Tài khoản đã bị từ chối" };
    try {
      data = await res.json();
    } catch {}

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Reject customer error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
