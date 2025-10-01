import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const res = await fetch(`${process.env.BACKEND_URL}/api/customers/email?email=${encodeURIComponent(email)}`);

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ success: false, message: text || "Customer not found" }, { status: res.status });
    }

    const data = await res.json(); // trả CustPublicResponse từ BE

    return NextResponse.json({
      success: true,
      data, // không unwrap, để FE thấy rõ
    });
  } catch (error: any) {
    console.error("Error fetching customer by email:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
