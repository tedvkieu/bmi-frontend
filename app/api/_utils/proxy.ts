const BASE_URL = process.env.BACKEND_URL;

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

  // Content-Type
  const method = request.method.toUpperCase();
  const contentType = request.headers.get("content-type") || "application/json";
  if (method !== "GET" && method !== "HEAD") {
    headers.set("content-type", contentType);
  }

  const init: RequestInit & { duplex?: string } = {
    method,
    headers,
    body:
      method === "GET" || method === "HEAD"
        ? undefined
        : request.body,
    cache: "no-store",
    duplex: "half", // không báo lỗi nữa
  };  

  const res = await fetch(url, init);

  // Lấy content-type từ backend
  const contentTypeRes = res.headers.get("content-type") || "";

  // Nếu là JSON, parse ra để có thể xử lý/log dễ hơn
  if (contentTypeRes.includes("application/json")) {
    const json = await res.json();
    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  }

  // Còn lại (Excel, PDF, ảnh, zip...) → forward raw stream
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
