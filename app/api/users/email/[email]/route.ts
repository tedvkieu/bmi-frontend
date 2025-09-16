import { proxyRequest } from "../../../_utils/proxy";

export async function GET(request: Request, { params }: { params: Promise<{ email: string }> }) {
    const { email } = await params;
    return proxyRequest(request, `/api/users/email/${encodeURIComponent(email)}`);
}


