const BASE_URL = "http://localhost:8080";

export async function proxyRequest(request: Request, targetPath: string) {
    const url = `${BASE_URL}${targetPath}`;

    const headers = new Headers();
    // Copy over Authorization if present
    const auth = request.headers.get("authorization");
    if (auth) headers.set("authorization", auth);
    headers.set("content-type", "application/json");

    const init: RequestInit = {
        method: request.method,
        headers,
        // Only attach body for non-GET/HEAD
        body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
        cache: "no-store",
    };

    const res = await fetch(url, init);
    const text = await res.text();

    return new Response(text, {
        status: res.status,
        headers: {
            "content-type": res.headers.get("content-type") || "application/json",
        },
    });
}


