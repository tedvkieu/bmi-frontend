const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type ProxyOptions = {
  body?: BodyInit | null;
  headers?: HeadersInit;
  /**
   * When null, skips setting Content-Type so fetch can infer (e.g. multipart FormData).
   * When string, forces a specific Content-Type.
   * Undefined keeps the default behaviour (copy from original request or fall back to JSON).
   */
  contentType?: string | null;
};

export async function proxyRequest(
  request: Request,
  targetPath: string,
  options: ProxyOptions = {}
) {
  const url = `${BASE_URL}${targetPath}`;

  const headers = new Headers(options.headers ?? undefined);

  // Determine authorization priority: explicit headers > incoming request > cookie token.
  let authHeader = headers.get("authorization") || request.headers.get("authorization");
  const cookieHeader =
    headers.get("cookie") ??
    request.headers.get("cookie") ??
    "";

  if (!authHeader && cookieHeader) {
    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      authHeader = `Bearer ${token}`;
    }
  }

  if (authHeader && !headers.has("authorization")) {
    headers.set("authorization", authHeader);
  }

  if (cookieHeader && !headers.has("cookie") && cookieHeader.length > 0) {
    headers.set("cookie", cookieHeader);
  }

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const bodyToSend =
    options.body !== undefined
      ? options.body ?? undefined
      : hasBody
      ? ((request.body as BodyInit | null) ?? undefined)
      : undefined;

  const isFormDataBody =
    typeof FormData !== "undefined" && bodyToSend instanceof FormData;

  const originalContentType = request.headers.get("content-type");
  const explicitContentType = options.contentType;

  if (
    hasBody &&
    bodyToSend !== undefined &&
    explicitContentType !== null &&
    !headers.has("content-type")
  ) {
    if (typeof explicitContentType === "string") {
      headers.set("content-type", explicitContentType);
    } else if (!isFormDataBody && originalContentType) {
      headers.set("content-type", originalContentType);
    } else if (!isFormDataBody && !originalContentType) {
      headers.set("content-type", "application/json");
    }
  }

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    cache: "no-store",
  };

  if (hasBody && bodyToSend !== undefined) {
    init.body = bodyToSend;
    const isReadableStream =
      typeof ReadableStream !== "undefined" &&
      bodyToSend instanceof ReadableStream;
    if (isReadableStream) {
      init.duplex = "half";
    }
  }

  const res = await fetch(url, init);

  const responseContentType = res.headers.get("content-type") || "";

  if (responseContentType.includes("application/json")) {
    const json = await res.json();
    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
