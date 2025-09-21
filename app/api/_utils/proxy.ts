const BASE_URL = process.env.BACKEND_URL  || "http://localhost:8080";

export async function proxyRequest(request: Request, targetPath: string) {
  const url = `${BASE_URL}${targetPath}`;

  const headers = new Headers();
  // Copy over Authorization if present
  const auth = request.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  // Also forward token from cookies as Bearer
  const cookie = request.headers.get("cookie") || "";
  if (!auth && cookie) {
    const token = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];
    if (token) headers.set("authorization", `Bearer ${token}`);
  }

  // Content-Type for JSON
  const method = request.method.toUpperCase();
  const contentType = request.headers.get("content-type") || "application/json";
  if (method !== "GET" && method !== "HEAD") {
    headers.set("content-type", contentType);
  }

  const init: RequestInit = {
    method,
    headers,
    // Only attach body for non-GET/HEAD
    body: method === "GET" || method === "HEAD" ? undefined : await request.text(),
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


