"use client";

import React from "react";
import { Search, Eye, X } from "lucide-react";
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
  const [selectedCustomerId, setSelectedCustomerId] =
    React.useState<string>("");
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
  const showToast = React.useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );
  const [totals, setTotals] = React.useState<ReportTotals | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalRecords, setTotalRecords] = React.useState<number>(0);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedRow, setSelectedRow] =
    React.useState<InspectionReportRow | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const pageSize = 10;

  // Company combobox pagination
  const companyDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [companyPage, setCompanyPage] = React.useState<number>(0);
  const [companyTotalPages, setCompanyTotalPages] = React.useState<number>(1);
  const [companyLoading, setCompanyLoading] = React.useState<boolean>(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] =
    React.useState<boolean>(false);

  const loadCompanies = React.useCallback(
    async (page: number = 0, searchQuery: string = "") => {
      setCompanyLoading(true);
      try {
        const json = await reportApi.getCompanies(page, 10, searchQuery);

        const items: Customer[] = (json.content || []).map(
          (c: any, index: number) => ({
            id: String(
              c.id ??
              c.companyId ??
              c.code ??
              c.value ??
              c._id ??
              c.uuid ??
              `${page}-${index}`
            ),
            name: String(
              c.name ??
              c.companyName ??
              c.customerName ??
              c.label ??
              "Khách hàng"
            ),
          })
        );

        if (page === 0) {
          const filteredItems = items.filter((i) => i.id);
          setCustomers(filteredItems);
        } else {
          setCustomers((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newItems = items.filter(
              (i) => i.id && !existingIds.has(i.id)
            );
            return [...prev, ...newItems];
          });
        }

        const totalPages = json.page?.totalPages || 1;

        setCompanyTotalPages(totalPages);
        setCompanyPage(page);
      } catch {
        // ignore
      } finally {
        setCompanyLoading(false);
      }
    },
    []
  );

  // Load companies on mount only
  const hasLoadedOnce = React.useRef(false);
  React.useEffect(() => {
    if (!hasLoadedOnce.current) {
      hasLoadedOnce.current = true;
      loadCompanies(0, "");
    }
  }, [loadCompanies]);

  const handleCompanyScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = target;

      if (scrollHeight - scrollTop - clientHeight < 50) {
        const nextPage = companyPage + 1;
        if (nextPage < companyTotalPages && !companyLoading) {
          loadCompanies(nextPage, "");
        }
      }
    },
    [companyPage, companyTotalPages, companyLoading, loadCompanies]
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompanyDropdownOpen(false);
      }
    };
    if (isCompanyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCompanyDropdownOpen]);

  // Reset pagination when filters change
  React.useEffect(() => {
    resetPagination();
  }, [selectedCustomerId, period, fromDate, toDate, searchQuery]);

  function normalizeResult(value: string): "Đạt" | "Không đạt" | "Khác" {
    const v = (value || "").trim().toUpperCase();
    if (["ĐẠT", "DAT", "PASS", "PASSED", "TRUE"].includes(v)) return "Đạt";
    if (
      [
        "KHÔNG ĐẠT",
        "KHONG DAT",
        "KHONG_DAT",
        "FAIL",
        "FAILED",
        "FALSE",
      ].includes(v)
    )
      return "Không đạt";
    return "Khác";
  }

  function formatDateToYYYYMMDD(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDateForDisplay(dateString: string): string {
    if (!dateString) return "";
    const trimmed = dateString.trim();

    const dayFirstMatch = trimmed.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
    );
    if (dayFirstMatch) {
      const day = dayFirstMatch[1].padStart(2, "0");
      const month = dayFirstMatch[2].padStart(2, "0");
      const year = dayFirstMatch[3];
      return `${day}/${month}/${year}`;
    }

    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2];
      const day = isoMatch[3];
      return `${day}/${month}/${year}`;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("vi-VN");
    }

    return trimmed;
  }

  function formatDateForFileName(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  function sanitizeForFileName(value: string): string {
    if (!value) return "";
    return value
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getRangeForPeriod(p: Period): { start: Date; end: Date } {
    const now = new Date();
    if (p === "DAY") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      return { start, end };
    }
    if (p === "WEEK") {
      // Week starts on Monday (VN convention)
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - diffToMonday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    if (p === "MONTH") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    }
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { start, end };
  }

  function generateFileName(): string {
    let startDate = "";
    let endDate = "";
    const fallbackAllLabel = "(Tat ca)";

    // Ưu tiên sử dụng fromDate và toDate từ bộ lọc
    if (fromDate && toDate) {
      startDate = formatDateForFileName(fromDate);
      endDate = formatDateForFileName(toDate);
    } else if (fromDate) {
      startDate = formatDateForFileName(fromDate);
      endDate = startDate;
    } else if (toDate) {
      startDate = formatDateForFileName(toDate);
      endDate = startDate;
    } else if (period) {
      const range = getRangeForPeriod(period as Period);
      startDate = formatDateForFileName(range.start.toISOString());
      endDate = formatDateForFileName(range.end.toISOString());
    } else {
      if (searchQuery && searchQuery.trim()) {
        const key = sanitizeForFileName(searchQuery.trim());
        return `BAO CAO THUC HIEN GIAM DINH-QĐ18 (Tu khoa tim kiem: ${key}).xlsx`;
      }
      if (selectedCustomerId) {
        const companyName = sanitizeForFileName(
          customers.find((c) => c.id === selectedCustomerId)?.name || "Tên công ty"
        );
        return `BAO CAO THUC HIEN GIAM DINH-QĐ18 (Tên công ty: ${companyName}).xlsx`;
      }
      return `BAO CAO THUC HIEN GIAM DINH-QĐ18 ${fallbackAllLabel}.xlsx`;
    }

    const dateRange = startDate === endDate
      ? `(${startDate})`
      : `(${startDate}-${endDate})`;

    return `BAO CAO THUC HIEN GIAM DINH-QĐ18 ${dateRange}.xlsx`;
  }

  function buildPayload() {
    const payload: Record<string, any> = {};

    if (searchQuery.trim()) {
      payload.searchText = searchQuery.trim();
      payload.page = currentPage - 1;
      payload.size = pageSize;
      return payload;
    }

    if (fromDate) payload.fromDate = formatDateToYYYYMMDD(fromDate);
    if (toDate) payload.toDate = formatDateToYYYYMMDD(toDate);
    if (period) payload.period = period;
    if (selectedCustomerId) {
      const idNum = Number(selectedCustomerId);
      payload.companyId = isNaN(idNum) ? selectedCustomerId : idNum;
    }

    payload.page = currentPage - 1;
    payload.size = pageSize;

    if (Object.keys(payload).length === 0) {
      payload.period = "MONTH";
    }

    return payload;
  }

  function toArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
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

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  function resetPagination() {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalRecords(0);
  }

  function openModal(row: InspectionReportRow) {
    setSelectedRow(row);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedRow(null);
  }

  function clearAllFilters() {
    setSelectedCustomerId("");
    setPeriod("");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
    resetPagination();
    setData([]);
    setHasData(false);
    setTotals(null);
    setError(null);
    setInfo(null);
    showToast("Đã xóa tất cả bộ lọc", "info");
  }

  const handleSearch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    setData([]);
    try {
      const isSearchOnly = Boolean(searchQuery.trim());
      const endpoint = isSearchOnly
        ? "/api/reports/inspection/search-text"
        : "/api/reports/inspection/search";
      const payload: Record<string, any> = {};
      if (isSearchOnly) {
        payload.searchText = searchQuery.trim();
        payload.page = currentPage - 1;
        payload.size = pageSize;
      } else {
        if (fromDate) payload.fromDate = formatDateToYYYYMMDD(fromDate);
        if (toDate) payload.toDate = formatDateToYYYYMMDD(toDate);
        if (period) payload.period = period;
        if (selectedCustomerId) {
          const idNum = Number(selectedCustomerId);
          payload.companyId = isNaN(idNum) ? selectedCustomerId : idNum;
        }
        payload.page = currentPage - 1;
        payload.size = pageSize;
        if (Object.keys(payload).length === 0) {
          payload.period = "MONTH";
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 404) {
          setData([]);
          setHasData(false);
          setTotals(null);
          setInfo("Không có dữ liệu phù hợp với tìm kiếm.");
          showToast("Không có dữ liệu phù hợp với tìm kiếm", "info");
          return;
        }
        throw new Error("Không tải được dữ liệu báo cáo");
      }
      const text = await res.text();
      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }
      const source = toArray(json.details || json.data || json);
      if (json && typeof json === "object" && json.totals) {
        setTotals(json.totals as ReportTotals);
      } else {
        setTotals(null);
      }

      if (json && typeof json === "object") {
        if (json.pagination) {
          setCurrentPage((json.pagination.currentPage ?? 0) + 1);
          setTotalPages(json.pagination.totalPages ?? 1);
          setTotalRecords(json.pagination.totalElements ?? 0);
        } else {
          setCurrentPage(json.currentPage ?? json.page ?? 1);
          setTotalPages(json.totalPages ?? json.totalPage ?? 1);
          setTotalRecords(json.totalRecords ?? json.total ?? 0);
        }
      }

      const list: InspectionReportRow[] = source.map((r: any, idx: number) => ({
        id: String(r.id ?? r._id ?? idx),
        companyName: String(r.companyName ?? r.customerName ?? r.company ?? ""),
        companyAddress: String(r.companyAddress ?? r.address ?? ""),
        machineName: String(
          r.machineName ?? r.equipmentName ?? r.mmtbName ?? r.equipment ?? ""
        ),
        machineIndustry: String(
          r.machineIndustry ?? r.industry ?? r.field ?? r.equipmentField ?? ""
        ),
        quantity: Number(r.quantity ?? r.qty ?? 0) || 0,
        inspectionTime: String(
          r.inspectionTime ?? r.date ?? r.inspectedAt ?? r.inspectionDate ?? ""
        ),
        inspectionLocation: String(r.inspectionLocation ?? r.location ?? ""),
        result: String(r.result ?? r.status ?? r.inspectionResult ?? ""),
        certificateNumber: String(
          r.certificateNumber ?? r.certificateNo ?? r.certificateCode ?? ""
        ),
        note: r.note ?? r.remark ?? r.ghiChu ?? "",
      }));
      setData(list);
      setHasData(list.length > 0);
      if (list.length === 0) {
        if (currentPage > 1) {
          setInfo(
            `Trang ${currentPage} không có dữ liệu. Tổng có ${totalPages} trang.`
          );
          showToast(`Trang ${currentPage} không có dữ liệu`, "info");
        } else {
          setInfo("Không có dữ liệu phù hợp với bộ lọc.");
          showToast("Không có dữ liệu phù hợp với bộ lọc", "info");
        }
      } else {
        showToast(
          `Đã tải ${list.length} bản ghi (trang ${currentPage}/${totalPages})`,
          "success"
        );
      }
    } catch (e: any) {
      setError(e?.message || "Lỗi không xác định");
      showToast(e?.message || "Lỗi không xác định", "error");
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    currentPage,
    pageSize,
    fromDate,
    toDate,
    period,
    selectedCustomerId,
    showToast,
    totalPages,
  ]);

  // Track if this is the initial mount
  const isInitialMount = React.useRef(true);

  // Auto-search when page changes (for pagination only, not filters)
  React.useEffect(() => {
    // Skip the first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only trigger search when page changes AND we already have data (pagination scenario)
    if (hasData) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  function buildExportPayload() {
    // For search mode: export only matched rows → do not include pagination
    if (searchQuery.trim()) {
      return { searchText: searchQuery.trim() };
    }
    // Otherwise reuse payload (filters + pagination)
    return buildPayload();
  }

  function getExportEndpoint() {
    return searchQuery.trim()
      ? "/api/reports/inspection/export-search-text"
      : "/api/reports/inspection/export";
  }

  async function handleExport() {
    if (!hasData || data.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getExportEndpoint(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildExportPayload()),
      });
      if (!res.ok) throw new Error("Xuất Excel thất bại");
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = generateFileName();
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
    () =>
      totals?.totalQuantity ??
      data.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0),
    [data, totals]
  );
  const passCount =
    totals?.totalPass ??
    data.filter((r) => normalizeResult(r.result) === "Đạt").length;
  const failCount =
    totals?.totalFail ??
    data.filter((r) => normalizeResult(r.result) === "Không đạt").length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="col-span-1">
            <label className="block text-sm text-gray-800 font-medium mb-1.5">
              Công ty
            </label>
            <div className="relative" ref={companyDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="w-full text-left border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <span
                  className={`truncate ${selectedCustomerId ? "text-gray-900" : "text-gray-400"
                    }`}
                >
                  {selectedCustomerId
                    ? customers.find((c) => c.id === selectedCustomerId)
                      ?.name || "Chọn công ty"
                    : "Tất cả"}
                </span>
                <svg
                  className="w-4 h-4 flex-shrink-0 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isCompanyDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"
                    }
                  />
                </svg>
              </button>

              {isCompanyDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-72 flex flex-col">
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "288px" }}
                    onScroll={handleCompanyScroll}
                  >
                    <div
                      className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-gray-900 text-sm"
                      onClick={() => {
                        setSelectedCustomerId("");
                        setIsCompanyDropdownOpen(false);
                      }}
                    >
                      Tất cả
                    </div>
                    {customers.map((c) => (
                      <div
                        key={c.id}
                        className={`px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm ${selectedCustomerId === c.id
                          ? "bg-blue-50 text-blue-900 font-medium"
                          : "text-gray-900"
                          }`}
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setIsCompanyDropdownOpen(false);
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                    {companyLoading && (
                      <div className="px-3 py-1.5 text-gray-500 text-sm text-center">
                        Đang tải...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-800 font-medium mb-1">
              Thời gian
            </label>
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
            <label className="block text-sm text-gray-800 font-medium mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-800 font-medium mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-800 font-medium mb-1">
              Tìm kiếm
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Số giám định, tên công ty..."
                className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button
                className={classNames(
                  "px-2 py-2 rounded-md text-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center",
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                )}
                onClick={handleSearch}
                disabled={loading}
                title="Tìm kiếm"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          {info && (
            <div className="px-3 py-2 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-sm">
              {info}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className={classNames(
                "px-4 py-2 rounded-md text-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              )}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Xem báo cáo"}
            </button>
            <button
              className={classNames(
                "px-4 py-2 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                loading || !hasData
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer border border-blue-300"
              )}
              onClick={handleExport}
              disabled={loading || !hasData}
            >
              Xuất Excel
            </button>
            <button
              className={classNames(
                "px-4 py-2 rounded-md border border-gray-300 text-gray-800 text-sm shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              )}
              onClick={clearAllFilters}
              disabled={loading}
            >
              Xóa bộ lọc
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

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div> */}

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="font-medium text-gray-900 mb-3">Số giám định theo thời gian</div>
                    <svg viewBox="0 0 420 200" className="w-full h-52">
                        <rect x="0" y="0" width="420" height="200" fill="#fff" />
                        {(() => {
                            const s = series;
                            if (s.length === 0) return <text x="210" y="100" textAnchor="middle" fill="#9ca3af">Không có dữ liệu</text>;
                            const chart = { left: 40, right: 390, top: 20, bottom: 170 };
                            return (
                                <>
                                    <line x1={chart.left} y1={chart.top} x2={chart.left} y2={chart.bottom} stroke="#e5e7eb" />
                                    <line x1={chart.left} y1={chart.bottom} x2={chart.right} y2={chart.bottom} stroke="#e5e7eb" />
                                    <text x={chart.left - 8} y={chart.bottom} textAnchor="end" alignmentBaseline="middle" fill="#6b7280" fontSize="10">0</text>
                                    <text x={chart.left - 8} y={chart.top} textAnchor="end" alignmentBaseline="middle" fill="#6b7280" fontSize="10">{maxSeries}</text>
                                    {s.map((it, i) => {
                                        const x = chart.left + 10 + i * ((chart.right - chart.left - 20) / Math.max(1, s.length));
                                        const h = (it.count / maxSeries) * (chart.bottom - chart.top - 10);
                                        const y = chart.bottom - h;
                                        return (
                                            <g key={it.date}>
                                                <rect x={x} y={y} width={14} height={h} fill="#3b82f6" rx={2} />
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
                                        <circle r="40" fill="none" stroke="#ef4444" strokeWidth="20" opacity="0.6" />
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
            </div> */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto">
        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: "STT", className: "w-16" },
                { label: "Tên doanh nghiệp đăng ký giám định", className: "" },
                { label: "Tên MMTB đăng ký giám định", className: "" },
                { label: "Số lượng", className: "w-24" },
                { label: "Thời gian giám định", className: "w-32" },
                { label: "Kết quả giám định", className: "w-40" },
                { label: "Số hiệu Chứng thư giám định", className: "" },
                { label: "Xem chi tiết", className: "w-20" },
              ].map((h) => (
                <th
                  key={h.label}
                  className={`px-6 py-4 text-xs font-semibold text-blue-800 uppercase tracking-wider whitespace-pre-wrap ${h.className
                    } ${h.label === "Kết quả giám định (Đạt/Không đạt)"
                      ? "text-center"
                      : "text-left"
                    }`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-yellow-100/60 font-medium text-gray-900">
              <td className="px-6 py-3">Tổng</td>
              <td className="px-6 py-3" colSpan={2}></td>
              <td className="px-6 py-3">{totalQuantity}</td>
              <td className="px-6 py-3"></td>
              <td className="px-3 py-3 text-center">
                Đạt: {passCount} / Không đạt: {failCount}
              </td>
              <td className="px-6 py-3">
                {totals?.totalCertificates ??
                  data.filter((r) => r.certificateNumber).length}
              </td>
              <td className="px-6 py-3"></td>
            </tr>
            {data.map((r, idx) => {
              const result = normalizeResult(r.result);
              return (
                <tr
                  key={r.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">{idx + 1}</td>
                  <td className="px-6 py-3">{r.companyName}</td>
                  <td className="px-6 py-3 whitespace-pre-line">
                    {r.machineName}
                  </td>
                  <td className="px-6 py-3">{r.quantity}</td>
                  <td className="px-6 py-3">
                    {formatDateForDisplay(r.inspectionTime)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${result === "Đạt"
                        ? "text-green-700 bg-green-100"
                        : result === "Không đạt"
                          ? "text-red-700 bg-red-100"
                          : "text-gray-700 bg-gray-100"
                        }`}
                    >
                      {result}
                    </span>
                  </td>
                  <td className="px-6 py-3">{r.certificateNumber}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => openModal(r)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={8}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRow && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] h-full"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Chi tiết giám định
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Đóng"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Tên doanh nghiệp
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg font-medium">
                      {selectedRow.companyName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Địa chỉ doanh nghiệp
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg whitespace-pre-line">
                      {selectedRow.companyAddress || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Tên MMTB đăng ký giám định
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg whitespace-pre-line">
                      {selectedRow.machineName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Lĩnh vực sản xuất của MMTB
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      {selectedRow.machineIndustry || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Số lượng
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg font-semibold">
                      {selectedRow.quantity}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Thời gian giám định
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      {formatDateForDisplay(selectedRow.inspectionTime)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Địa điểm giám định
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg whitespace-pre-line">
                      {selectedRow.inspectionLocation || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Kết quả giám định
                    </label>
                    <div
                      className={`text-sm font-semibold p-3 rounded-lg border ${normalizeResult(selectedRow.result) === "Đạt"
                        ? "bg-green-50 text-green-800 border-green-200"
                        : normalizeResult(selectedRow.result) === "Không đạt"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : "bg-gray-50 text-gray-800 border-gray-200"
                        }`}
                    >
                      {normalizeResult(selectedRow.result)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Số hiệu Chứng thư giám định
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg font-mono">
                      {selectedRow.certificateNumber || "—"}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Ghi chú
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 p-3 rounded-lg min-h-[60px] whitespace-pre-line">
                      {selectedRow.note || "—"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {hasData && totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
              {Math.min(currentPage * pageSize, totalRecords)} trong tổng số{" "}
              {totalRecords} bản ghi
            </div>
            <div className="flex items-center gap-2">
              <button
                className={classNames(
                  "px-3 py-2 rounded-md text-sm border",
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                )}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={classNames(
                      "px-3 py-2 rounded-md text-sm border",
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                    )}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className={classNames(
                  "px-3 py-2 rounded-md text-sm border",
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                )}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

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
