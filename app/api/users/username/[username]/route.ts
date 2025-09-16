import { proxyRequest } from "../../../_utils/proxy";

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    return proxyRequest(request, `/api/users/username/${encodeURIComponent(username)}`);
}


