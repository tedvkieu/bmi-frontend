import { NextRequest } from "next/server";
import { proxyRequest } from "../../../../_utils/proxy";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ dossierId: string }> }
) {
  const { dossierId } = await context.params; // vì params là Promise
  const url = new URL(request.url);
  const templateName =
    url.searchParams.get("templateName") || "sample-form2.docx";

  return proxyRequest(
    request,
    `/api/evaluations/export/${dossierId}/docx?templateName=${encodeURIComponent(
      templateName
    )}`
  );
}
