// import { NextRequest, NextResponse } from "next/server";
// import { proxyRequest } from "../_utils/proxy";

// export async function GET(req: NextRequest) {
//   const query = new URL(req.url).searchParams.get("query") || "";
//   if (!query) return NextResponse.json({ results: [] });

//   try {
//     const [dossierRes, customerRes] = await Promise.all([
//       proxyRequest(req as any, `/api/dossiers/search?registerNo=${encodeURIComponent(query)}`),
//       proxyRequest(req as any, `/api/customers/page?search=${encodeURIComponent(query)}`),
//     ]);

//     const dossierJson = await dossierRes.json();
//     const customerJson = await customerRes.json();

//     // Chuẩn hóa dữ liệu hồ sơ
//     const dossiers = Array.isArray(dossierJson)
//       ? dossierJson.map((d: any) => ({
//           type: "dossier" as const,
//           id: d.receiptId,
//           registrationNo: d.registrationNo,
//           customerName: d.customerSubmitName,
//           inspectionType: d.inspectionTypeName,
//           certificateDate: d.certificateDate,
//           status: d.certificateStatus,
//         }))
//       : (dossierJson.pageData?.content || [dossierJson]).map((d: any) => ({
//           type: "dossier" as const,
//           id: d.receiptId,
//           registrationNo: d.registrationNo,
//           customerName: d.customerSubmit?.name || d.customerSubmitName,
//           inspectionType: d.inspectionTypeName,
//           certificateDate: d.certificateDate,
//           status: d.certificateStatus,
//         }));

//     // Chuẩn hóa dữ liệu khách hàng
//     const customers = (customerJson.pageData?.content || customerJson.content || []).map((c: any) => ({
//       type: "customer" as const,
//       id: c.customerId,
//       name: c.name,
//       email: c.email,
//       phone: c.phone,
//       address: c.address,
//       customerType: c.customerType,
//       createdAt: c.createdAt,
//     }));

//     // Gộp kết quả
//     const results = [...dossiers, ...customers];

//     return NextResponse.json({ results });
//   } catch (error) {
//     console.error("Search API error:", error);
//     return NextResponse.json(
//       { results: [], error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }


// pages/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "../_utils/proxy";

export async function GET(req: NextRequest) {
    const query = new URL(req.url).searchParams.get("query") || "";
    if (!query) return NextResponse.json({ results: [] });

    try {
        const [dossierRes, customerRes] = await Promise.all([
            proxyRequest(req as any, `/api/dossiers/search?registerNo=${encodeURIComponent(query)}`),
            proxyRequest(req as any, `/api/customers/page?search=${encodeURIComponent(query)}`),
        ]);

        // **FIX: Kiểm tra response.ok trước khi parse JSON**
        // Nếu response không OK (ví dụ: 404), trả về một đối tượng rỗng để logic phía sau không bị lỗi.
        const dossierJson = dossierRes.ok ? await dossierRes.json() : { pageData: { content: [] } };
        const customerJson = customerRes.ok ? await customerRes.json() : { pageData: { content: [] } };

        // Chuẩn hóa dữ liệu hồ sơ (logic này giờ đã an toàn)
        const dossiers = Array.isArray(dossierJson)
            ? dossierJson.map((d: any) => ({
                  type: "dossier" as const,
                  id: d.receiptId,
                  registrationNo: d.registrationNo,
                  customerName: d.customerSubmitName,
                  inspectionType: d.inspectionTypeName,
                  certificateDate: d.certificateDate,
                  status: d.certificateStatus,
              }))
            : (dossierJson.pageData?.content || [dossierJson]).map((d: any) => ({
                  type: "dossier" as const,
                  id: d.receiptId,
                  registrationNo: d.registrationNo,
                  customerName: d.customerSubmit?.name || d.customerSubmitName,
                  inspectionType: d.inspectionTypeName,
                  certificateDate: d.certificateDate,
                  status: d.certificateStatus,
              }));

        // Chuẩn hóa dữ liệu khách hàng (logic này giờ đã an toàn)
        const customers = (customerJson.pageData?.content || customerJson.content || []).map((c: any) => ({
            type: "customer" as const,
            id: c.customerId,
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: c.address,
            customerType: c.customerType,
            createdAt: c.createdAt,
        }));

        // Gộp kết quả
        const results = [...dossiers, ...customers];

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            { results: [], error: "Internal Server Error" },
            { status: 500 }
        );
    }
}