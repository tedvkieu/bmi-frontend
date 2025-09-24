// File: app/api/notifications/unread/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API = process.env.BACKEND_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // lấy userId từ URL
) {
  const userId = params.id;
  const token = request.cookies.get("token")?.value;

  const res = await fetch(`${BACKEND_API}/api/notifications/unread/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
