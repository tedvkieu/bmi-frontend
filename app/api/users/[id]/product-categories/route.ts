import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_utils/proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyRequest(request, `/api/users/${id}/product-categories`);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyRequest(request, `/api/users/${id}/product-categories`);
}
