"use client";

import React from "react";
import { reportApi } from "../services/reportApi";

type Period = "DAY" | "WEEK" | "MONTH" | "YEAR";

type Customer = {
    id: string;
    name: string;
};

type InspectionReportRow = {
    id: string;
    companyName: string;
    companyAddress: string;
    machineName: string;
    machineIndustry: string;
    quantity: number;
    inspectionTime: string;
    inspectionLocation: string;
    result: "Đạt" | "Không đạt" | "DAT" | "KHONG_DAT" | string;
    certificateNumber: string;
    note?: string;
};

type ReportTotals = {
    totalQuantity?: number;
    totalInspectionDates?: number;
    totalCertificates?: number;
    totalRecords?: number;
    totalPass?: number;
    totalFail?: number;
    totalCompanies?: number;
};

function classNames(...classes: Array<string | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}

const ReportsClient: React.FC = () => {
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("");
    const [period, setPeriod] = React.useState<Period | "">("");
    const [fromDate, setFromDate] = React.useState<string>("");
    const [toDate, setToDate] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const [data, setData] = React.useState<InspectionReportRow[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [info, setInfo] = React.useState<string | null>(null);
    const [hasData, setHasData] = React.useState<boolean>(false);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    type ToastType = "success" | "error" | "info";
    type Toast = { id: number; message: string; type: ToastType };
    const [toasts, setToasts] = React.useState<Toast[]>([]);
    const showToast = (message: string, type: ToastType = "info") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };
    const [totals, setTotals] = React.useState<ReportTotals | null>(null);

    React.useEffect(() => {
        fetch("/api/customers", { cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to load companies");
                const text = await res.text();
                let json: any = {};
                try {
                    json = text ? JSON.parse(text) : {};
                } catch {
                    json = {};
                }
                const raw = toArray(json);
                const items: Customer[] = raw.map((c: any) => ({
                    id: String(c.customerId ?? c.id ?? c.code ?? c.value ?? c._id ?? c.uuid ?? ""),
                    name: String(c.companyName ?? c.name ?? c.customerName ?? c.label ?? "Khách hàng"),
                }));
                setCustomers(items.filter((i) => i.id));
            })
            .catch(() => {
                // ignore
            });
    }, []);

    function normalizeResult(value: string): "Đạt" | "Không đạt" | "Khác" {
        const v = (value || "").trim().toUpperCase();
        if (["ĐẠT", "DAT", "PASS", "PASSED", "TRUE"].includes(v)) return "Đạt";
        if (["KHÔNG ĐẠT", "KHONG DAT", "KHONG_DAT", "FAIL", "FAILED", "FALSE"].includes(v)) return "Không đạt";
        return "Khác";
    }

    function buildPayload() {
        const payload: Record<string, any> = {};
        if (fromDate) payload.fromDate = fromDate;
        if (toDate) payload.toDate = toDate;
        if (period) payload.period = period;
        if (selectedCustomerId) {
            const idNum = Number(selectedCustomerId);
            payload.companyId = isNaN(idNum) ? selectedCustomerId : idNum;
        }
        // Default behavior: if no filters selected, use current MONTH period
        if (Object.keys(payload).length === 0) {
            payload.period = "MONTH";
        }
        return payload;
    }

    function toArray(value: any): any[] {
        if (Array.isArray(value)) return value;
        if (value && typeof value === "object") {
            // Common envelope keys from various backends
            const candidates = [
                value.data,
                value.items,
                value.records,
                value.rows,
                value.content,
                value.list,
                value.details,
            ];
            for (const c of candidates) {
                if (Array.isArray(c)) return c;
            }
        }
        return [];
    }

    async function handleSearch() {
        setLoading(true);
        setError(null);
        setInfo(null);
        setData([]);
        try {
            const res = await fetch("/api/reports/inspection/search", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(buildPayload()),
            });
            if (!res.ok) throw new Error("Không tải được dữ liệu báo cáo");
            // Robust JSON parsing (handle text or blob payloads)
            const text = await res.text();
            let json: any = {};
            try {
                json = text ? JSON.parse(text) : {};
            } catch {
                json = {};
            }
            const source = toArray(json);
            if (json && typeof json === "object" && json.totals) {
                setTotals(json.totals as ReportTotals);
            } else {
                setTotals(null);
            }
            const list: InspectionReportRow[] = source.map((r: any, idx: number) => ({
                id: String(r.id ?? r._id ?? idx),
                companyName: String(r.companyName ?? r.customerName ?? r.company ?? ""),
                companyAddress: String(r.companyAddress ?? r.address ?? ""),
                machineName: String(r.machineName ?? r.equipmentName ?? r.mmtbName ?? r.equipment ?? ""),
                machineIndustry: String(r.machineIndustry ?? r.industry ?? r.field ?? r.equipmentField ?? ""),
                quantity: Number(r.quantity ?? r.qty ?? 0) || 0,
                inspectionTime: String(r.inspectionTime ?? r.date ?? r.inspectedAt ?? r.inspectionDate ?? ""),
                inspectionLocation: String(r.inspectionLocation ?? r.location ?? ""),
                result: String(r.result ?? r.status ?? r.inspectionResult ?? ""),
                certificateNumber: String(r.certificateNumber ?? r.certificateNo ?? r.certificateCode ?? ""),
                note: r.note ?? r.remark ?? r.ghiChu ?? "",
            }));
            setData(list);
            setHasData(list.length > 0);
            if (list.length === 0) {
                setInfo("Không có dữ liệu phù hợp với bộ lọc.");
                showToast("Không có dữ liệu phù hợp với bộ lọc", "info");
            } else {
                showToast(`Đã tải ${list.length} bản ghi`, "success");
            }
        } catch (e: any) {
            setError(e?.message || "Lỗi không xác định");
            showToast(e?.message || "Lỗi không xác định", "error");
        } finally {
            setLoading(false);
        }
    }

    async function handleExport() {
        if (!hasData || data.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/reports/inspection/export", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(buildPayload()),
            });
            if (!res.ok) throw new Error("Xuất Excel thất bại");
            const blob = await res.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            a.download = `bao-cao-giam-dinh-${ts}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e: any) {
            setError(e.message || "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    }

    function handleUploadClick() {
        fileInputRef.current?.click();
    }

    async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            setError(null);
            setInfo(null);
            await reportApi.importExcel(file);
            setInfo("Tải lên thành công.");
            showToast("Tải lên thành công", "success");
            // Sau upload có thể tự động refresh kết quả
            await handleSearch();
        } catch (err: any) {
            setError(err?.message || "Tải lên thất bại");
            showToast(err?.message || "Tải lên thất bại", "error");
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }


    const totalQuantity = React.useMemo(
        () => (totals?.totalQuantity ?? data.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)),
        [data, totals]
    );
    const totalInspections = totals?.totalRecords ?? data.length;
    const passCount = totals?.totalPass ?? data.filter((r) => normalizeResult(r.result) === "Đạt").length;
    const failCount = totals?.totalFail ?? data.filter((r) => normalizeResult(r.result) === "Không đạt").length;

    function buildTimeSeries() {
        const map = new Map<string, number>();
        for (const r of data) {
            const d = r.inspectionTime ? new Date(r.inspectionTime) : null;
            if (!d || isNaN(d.getTime())) continue;
            const key = d.toISOString().slice(0, 10);
            map.set(key, (map.get(key) || 0) + 1);
        }
        const arr = Array.from(map.entries())
            .sort((a, b) => (a[0] < b[0] ? -1 : 1))
            .map(([date, count]) => ({ date, count }));
        return arr;
    }

    const series = buildTimeSeries();
    const maxSeries = Math.max(1, ...series.map((s) => s.count));

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                {/* Bộ lọc */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-gray-800 font-medium mb-1">Công ty</label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-800 font-medium mb-1">Thời gian</label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as Period | "")}
                        >
                            <option value="">Tuỳ chọn</option>
                            <option value="DAY">Ngày</option>
                            <option value="WEEK">Tuần</option>
                            <option value="MONTH">Tháng</option>
                            <option value="YEAR">Năm</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-800 font-medium mb-1">Từ ngày</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-800 font-medium mb-1">Đến ngày</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    {info && (
                        <div className="px-3 py-2 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-sm">
                            {info}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            className={classNames(
                                "px-4 py-2 rounded-md text-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            )}
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? "Đang tải..." : "Xem báo cáo"}
                        </button>
                        <button
                            className={classNames(
                                "px-4 py-2 rounded-md border border-gray-300 text-gray-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                loading || !hasData ? "bg-green-500 text-white cursor-not-allowed" : "bg-white hover:bg-gray-50 cursor-pointer"
                            )}
                            onClick={handleExport}
                            disabled={loading || !hasData}
                        >
                            Xuất Excel
                        </button>
                        {error && (
                            <div className="px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className={classNames(
                                "px-4 py-2 rounded-md border border-gray-300 text-gray-800 text-sm shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            )}
                            onClick={handleUploadClick}
                            type="button"
                        >
                            Tải lên báo cáo
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={handleFileSelected}
                        />
                    </div>
                </div>
            </div>

            {/* Analystic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="text-gray-800 text-sm">Tổng số lần giám định</div>
                    <div className="text-2xl font-semibold text-gray-900">{totalInspections}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="text-gray-800 text-sm">Tổng số lượng</div>
                    <div className="text-2xl font-semibold text-gray-900">{totalQuantity}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="text-gray-800 text-sm">Tỉ lệ Đạt</div>
                    <div className="text-2xl font-semibold text-gray-900">{totalInspections ? Math.round((passCount / totalInspections) * 100) : 0}%</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="text-gray-800 text-sm">Tỉ lệ Không đạt</div>
                    <div className="text-2xl font-semibold text-gray-900">{totalInspections ? Math.round((failCount / totalInspections) * 100) : 0}%</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="font-medium text-gray-900 mb-3">Số giám định theo thời gian</div>
                    <svg viewBox="0 0 420 200" className="w-full h-52">
                        <rect x="0" y="0" width="420" height="200" fill="#fff" />
                        {(() => {
                            const s = series;
                            if (s.length === 0) return <text x="210" y="100" textAnchor="middle" fill="#9ca3af">Không có dữ liệu</text>;
                            const chart = { left: 40, right: 390, top: 20, bottom: 170 };
                            // axes
                            return (
                                <>
                                    <line x1={chart.left} y1={chart.top} x2={chart.left} y2={chart.bottom} stroke="#e5e7eb" />
                                    <line x1={chart.left} y1={chart.bottom} x2={chart.right} y2={chart.bottom} stroke="#e5e7eb" />
                                    {/* Y ticks: 0 and max */}
                                    <text x={chart.left - 8} y={chart.bottom} textAnchor="end" alignmentBaseline="middle" fill="#6b7280" fontSize="10">0</text>
                                    <text x={chart.left - 8} y={chart.top} textAnchor="end" alignmentBaseline="middle" fill="#6b7280" fontSize="10">{maxSeries}</text>
                                    {/* Bars and X labels */}
                                    {s.map((it, i) => {
                                        const x = chart.left + 10 + i * ((chart.right - chart.left - 20) / Math.max(1, s.length));
                                        const h = (it.count / maxSeries) * (chart.bottom - chart.top - 10);
                                        const y = chart.bottom - h;
                                        return (
                                            <g key={it.date}>
                                                <rect x={x} y={y} width={14} height={h} fill="#3b82f6" rx={2} />
                                                {/* X label */}
                                                <text x={x + 7} y={chart.bottom + 12} textAnchor="middle" fill="#6b7280" fontSize="10">
                                                    {it.date}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </>
                            );
                        })()}
                    </svg>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="font-medium text-gray-900 mb-3">Tỉ lệ Đạt / Không đạt</div>
                    <div className="flex items-center gap-4">
                        <svg viewBox="0 0 120 120" className="w-28 h-28">
                            {(() => {
                                const total = Math.max(0, passCount + failCount);
                                const passRatio = total ? passCount / total : 0;
                                const circumference = 2 * Math.PI * 40; // r=40
                                const passLen = passRatio * circumference;
                                const restLen = circumference - passLen;
                                return (
                                    <g transform="translate(60,60)">
                                        {/* base red full circle */}
                                        <circle r="40" fill="none" stroke="#ef4444" strokeWidth="20" opacity="0.6" />
                                        {/* green arc for pass, starts at top (-90deg) */}
                                        <g transform="rotate(-90)">
                                            <circle r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray={`${passLen} ${restLen}`} strokeLinecap="butt" />
                                        </g>
                                    </g>
                                );
                            })()}
                        </svg>
                        <div className="text-sm text-gray-800 space-y-1">
                            <div><span className="inline-block w-3 h-3 bg-emerald-500 mr-2 align-middle" />Đạt: {passCount}</div>
                            <div><span className="inline-block w-3 h-3 bg-red-500 mr-2 align-middle" />Không đạt: {failCount}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto">
                <table className="min-w-full text-sm text-gray-800">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                "STT",
                                "Tên doanh nghiệp đăng ký giám định MMTB đã qua sử dụng",
                                "Địa chỉ doanh nghiệp",
                                "Tên MMTB đăng ký giám định",
                                "Lĩnh vực sản xuất của MMTB",
                                "Số lượng",
                                "Thời gian giám định",
                                "Địa điểm giám định",
                                "Kết quả giám định (Đạt/Không đạt)",
                                "Số hiệu Chứng thư giám định",
                                "Ghi chú",
                            ].map((h) => (
                                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider whitespace-pre-wrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-yellow-100/60 font-medium text-gray-900">
                            <td className="px-6 py-3">Tổng</td>
                            <td className="px-6 py-3" colSpan={4}></td>
                            <td className="px-6 py-3">{totalQuantity}</td>
                            <td className="px-6 py-3">{totalInspections}</td>
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3">Đạt: {passCount} / Không đạt: {failCount}</td>
                            <td className="px-6 py-3">{data.filter((r) => r.certificateNumber).length}</td>
                            <td className="px-6 py-3"></td>
                        </tr>
                        {data.map((r, idx) => (
                            <tr key={r.id} className="border-t">
                                <td className="px-6 py-3">{idx + 1}</td>
                                <td className="px-6 py-3">{r.companyName}</td>
                                <td className="px-6 py-3">{r.companyAddress}</td>
                                <td className="px-6 py-3">{r.machineName}</td>
                                <td className="px-6 py-3">{r.machineIndustry}</td>
                                <td className="px-6 py-3">{r.quantity}</td>
                                <td className="px-6 py-3">{r.inspectionTime ? new Date(r.inspectionTime).toLocaleDateString() : ""}</td>
                                <td className="px-6 py-3">{r.inspectionLocation}</td>
                                <td className="px-6 py-3">{normalizeResult(r.result)}</td>
                                <td className="px-6 py-3">{r.certificateNumber}</td>
                                <td className="px-6 py-3">{r.note || ""}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td className="px-6 py-8 text-center text-gray-500" colSpan={11}>Không có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Toasts */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={
                            t.type === "success"
                                ? "px-4 py-2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shadow"
                                : t.type === "error"
                                    ? "px-4 py-2 rounded-md bg-red-50 text-red-800 border border-red-200 shadow"
                                    : "px-4 py-2 rounded-md bg-blue-50 text-blue-800 border border-blue-200 shadow"
                        }
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportsClient;
