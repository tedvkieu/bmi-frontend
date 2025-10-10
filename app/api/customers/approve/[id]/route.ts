import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } =  await params;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No authentication token" }, { status: 401 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/approve/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    let data: any = { success: true, message: "Đã duyệt thành công" };
    try {
      data = await res.json();
    } catch {}

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Approve customer error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

