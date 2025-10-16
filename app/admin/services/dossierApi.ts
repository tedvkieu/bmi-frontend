import { DossierDetails } from "@/app/types/dossier";
import { authApi } from "../../services/authApi";
import { InspectionReportApi } from "../types/inspection";
import { MachineDetails } from "@/app/types/machines";

export interface Receipt {
    receiptId: number;
    registrationNo: string;
    billOfLading?: string;
    customerSubmit?: {
        name: string;
    };
    createdByUserName?: string;
    createdAt: string;
    inspectionTypeName?: string;
    inspectionTypeId?: string;
    certificateStatus: string;
}

export interface ReceiptResponse {
    pageData: {
        content: Receipt[];
        page: {
            totalElements: number;
            totalPages: number;
        };
    };
}

export interface OverallStatusCounts {
    total: number;
    completed: number;
    pending: number;
    notObtained: number;
    notWithinScope: number;
}

export interface BackendError {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
}

// Helper function to create auth headers
function authHeaders() {
    const token = authApi.getToken();
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    } as Record<string, string>;
}

// Helper function to handle response
async function handleResponse<T>(res: Response): Promise<T> {
    if (res.ok) return res.json();
    const data = (await res.json().catch(() => ({}))) as BackendError;
    const msg = data?.message || data?.error || "Có lỗi xảy ra";
    throw new Error(msg);
}

// Helper function to build search params
function buildSearchParams(
    page: number,
    size: number,
    sort: "newest" | "oldest",
    search: string,
    month: string,
    year: string,
    status?: "obtained" | "pending" | "not_obtained" | "not_within_scope" | "all"
): URLSearchParams {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sortBy: sort,
    });

    if (search.trim() !== "") params.append("search", search);
    if (month !== "") params.append("month", month);
    if (year !== "") params.append("year", year);

    if (status && status !== "all") {
        let backendStatus: string | null = null;
        if (status === "obtained") backendStatus = "OBTAINED";
        else if (status === "pending") backendStatus = "PENDING";
        else if (status === "not_obtained") backendStatus = "NOT_OBTAINED";
        else if (status === "not_within_scope") backendStatus = "NOT_WITHIN_SCOPE";

        if (backendStatus) params.append("status", backendStatus);
    }
    return params;
}

export const dossierApi = {
    // Get overall counts for dashboard cards
    async getOverallCounts(
        monthFilter: string,
        yearFilter: string
    ): Promise<OverallStatusCounts> {
        try {
            // Get total count
            const totalParams = buildSearchParams(
                0,
                1,
                "newest",
                "",
                monthFilter,
                yearFilter,
                "all"
            );

            const totalRes = await fetch(`/api/dossiers?${totalParams.toString()}`, {
                headers: authHeaders(),
                cache: "no-store",
            });
            const totalData: ReceiptResponse = await totalRes.json();

            // Get counts for each status
            const [completedRes, pendingRes, notObtainedRes, notWithinScopeRes] =
                await Promise.all([
                    fetch(
                        `/api/dossiers?${buildSearchParams(
                            0,
                            1,
                            "newest",
                            "",
                            monthFilter,
                            yearFilter,
                            "obtained"
                        ).toString()}`,
                        { headers: authHeaders(), cache: "no-store" }
                    ),
                    fetch(
                        `/api/dossiers?${buildSearchParams(
                            0,
                            1,
                            "newest",
                            "",
                            monthFilter,
                            yearFilter,
                            "pending"
                        ).toString()}`,
                        { headers: authHeaders(), cache: "no-store" }
                    ),
                    fetch(
                        `/api/dossiers?${buildSearchParams(
                            0,
                            1,
                            "newest",
                            "",
                            monthFilter,
                            yearFilter,
                            "not_obtained"
                        ).toString()}`,
                        { headers: authHeaders(), cache: "no-store" }
                    ),
                    fetch(
                        `/api/dossiers?${buildSearchParams(
                            0,
                            1,
                            "newest",
                            "",
                            monthFilter,
                            yearFilter,
                            "not_within_scope"
                        ).toString()}`,
                        { headers: authHeaders(), cache: "no-store" }
                    ),
                ]);

            const [
                completedData,
                pendingData,
                notObtainedData,
                notWithinScopeData,
            ]: ReceiptResponse[] = await Promise.all([
                completedRes.json(),
                pendingRes.json(),
                notObtainedRes.json(),
                notWithinScopeRes.json(),
            ]);

            return {
                total: totalData.pageData.page.totalElements || 0,
                completed: completedData.pageData.page.totalElements || 0,
                pending: pendingData.pageData.page.totalElements || 0,
                notObtained: notObtainedData.pageData.page.totalElements || 0,
                notWithinScope: notWithinScopeData.pageData.page.totalElements || 0,
            };
        } catch (error) {
            console.error("Failed to fetch overall document counts:", error);
            throw error;
        }
    },

    // Get paginated documents list
    async getDocuments(
        currentPage: number,
        pageSize: number,
        sortBy: "newest" | "oldest",
        searchTerm: string,
        monthFilter: string,
        yearFilter: string,
        statusFilter: "obtained" | "pending" | "not_obtained" | "not_within_scope" | "all"
    ): Promise<ReceiptResponse> {
        const params = buildSearchParams(
            currentPage,
            pageSize,
            sortBy,
            searchTerm,
            monthFilter,
            yearFilter,
            statusFilter
        );

        const res = await fetch(`/api/dossiers?${params.toString()}`, {
            headers: authHeaders(),
            cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return handleResponse<ReceiptResponse>(res);
    },

    // Get single document by ID
    async getDocumentById(id: string): Promise<InspectionReportApi> {
        const res = await fetch(`/api/dossiers/${id}`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<InspectionReportApi>(res);
    },

    async getDocumentByIdDetails(id: string): Promise<DossierDetails> {
        const res = await fetch(`/api/dossiers/${id}/details`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<DossierDetails>(res);
    },

    async getMachinesByDossier(id: string): Promise<MachineDetails[]> {
        const res = await fetch(`/api/dossiers/${id}/machines`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<MachineDetails[]>(res);
    },

    // Delete document by ID
    async deleteDocument(id: string): Promise<void> {
        const res = await fetch(`/api/dossiers/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });

        if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as BackendError;
            throw new Error(data?.message || data?.error || "Xóa thất bại");
        }
    },

    // Download inspection report
    async downloadInspectionReport(id: string): Promise<Blob> {
        const res = await fetch(
            `/api/documents/generate-inspection-report/${id}`,
            {
                headers: authHeaders(),
            }
        );

        if (!res.ok) {
            let errorMessage = "Không thể tạo báo cáo kiểm định";
            try {
                const errorData = await res.json();
                errorMessage = errorData?.message || errorMessage;
            } catch {
                // ignore json parse error for binary responses
            }
            throw new Error(errorMessage);
        }

        const blob = await res.blob();
        if (!blob.size) {
            throw new Error("Tệp tải xuống rỗng");
        }

        return blob;
    },

    // Search dossier by register number and certificate date
    async searchByRegisterNoAndCertificateDate(
        registerNo: string,
        certificateDate: string
    ) {
        const params = new URLSearchParams({
            registerNo,
            certificateDate,
        });

        const res = await fetch(
            `/api/dossiers/searchByRegisterNoAndCertificateDate?${params.toString()}`,
            {
                headers: authHeaders(),
                cache: "no-store",
            }
        );

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Không tìm thấy hồ sơ phù hợp.");
            }
            throw new Error(`Lỗi khi tra cứu: ${res.statusText}`);
        }

        return handleResponse(res);
    },

    // Search dossier by register number
    async searchByRegisterNo(registerNo: string) {
        const res = await fetch(
            `/api/dossiers/search?registerNo=${encodeURIComponent(registerNo)}`,
            {
                headers: authHeaders(),
                cache: "no-store",
            }
        );

        if (!res.ok) {
            throw new Error("Không tìm thấy hồ sơ với số đăng ký này");
        }

        return handleResponse(res);
    },
};
