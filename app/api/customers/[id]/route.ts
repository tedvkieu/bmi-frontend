import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    const springResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
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
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const token = req.cookies.get("token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 204) {
      // 204 không có body
      return new NextResponse(null, { status: 204 });
    }

    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      // ignore nếu backend không trả JSON
    }

    return NextResponse.json(errorData, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
