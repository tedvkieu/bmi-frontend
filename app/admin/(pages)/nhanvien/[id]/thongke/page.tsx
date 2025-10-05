"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  userApi,
  type UserDossierStatsResponse,
  type PaginatedReceiptResponse,
  type ReceiptResponseLite,
} from "../../../../services/userApi";
import LoadingSpinner from "../../../../component/document/LoadingSpinner";
import { ArrowLeft, RefreshCcw, CheckCircle, Clock, AlertCircle } from "lucide-react";
import AdminLayout from "@/app/admin/component/AdminLayout";

export default function UserStatsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = useMemo(() => Number(params?.id), [params]);

  const [stats, setStats] = useState<UserDossierStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const [dossiers, setDossiers] = useState<ReceiptResponseLite[]>([]);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);
  const [dossierPage, setDossierPage] = useState<number>(1);
  const [dossierTotalPages, setDossierTotalPages] = useState<number>(0);
  const pageSize = 10;

  // Filters
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState<number | undefined>(
    now.getMonth() + 1
  );
  const [filterYear, setFilterYear] = useState<number | undefined>(
    now.getFullYear()
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const statusVi: Record<string, string> = {
    OBTAINED: "Đạt",
    NOT_OBTAINED: "Không đạt",
    NOT_WITHIN_SCOPE: "Không thuộc phạm vi",
    PENDING: "Đang xử lý",
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "OBTAINED":
        return "bg-green-100 text-green-800 ring-green-600/20";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 ring-yellow-600/20";
      case "NOT_OBTAINED":
        return "bg-red-100 text-red-800 ring-red-600/20";
      case "NOT_WITHIN_SCOPE":
        return "bg-gray-100 text-gray-800 ring-gray-600/20";
      default:
        return "bg-gray-100 text-gray-800 ring-gray-600/20";
    }
  };

  const statusIcon = (status: string) => {
    const size = 16;
    switch (status) {
      case "PENDING":
        return <Clock size={size} />;
      case "NOT_OBTAINED":
      case "NOT_WITHIN_SCOPE":
        return <AlertCircle size={size} />;
      case "OBTAINED":
        return <CheckCircle size={size} />;
      default:
        return <Clock size={size} />;
    }
  };

  useEffect(() => {
    if (!Number.isFinite(userId) || Number.isNaN(userId)) return;
    // load stats
    setStatsLoading(true);
    userApi
      .getDossierStats(userId)
      .then((res) => setStats(res))
      .finally(() => setStatsLoading(false));

    // load dossiers page 1
    loadUserDossiers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function loadUserDossiers(page = 1) {
    if (!Number.isFinite(userId) || Number.isNaN(userId)) return;
    setDossierLoading(true);
    const safePage =
      typeof page === "number" && Number.isFinite(page) && page > 0 ? page : 1;
    userApi
      .getDossiersByUser(userId, safePage - 1, pageSize, {
        q: searchTerm,
        month: filterMonth,
        year: filterYear,
      })
      .then((data: PaginatedReceiptResponse) => {
        setDossiers(data.content);
        setDossierTotalPages(data.totalPages);
        const nextPage =
          typeof data.number === "number" && !Number.isNaN(data.number)
            ? data.number + 1
            : 1;
        setDossierPage(nextPage);
      })
      .catch(() => {
        setDossiers([]);
        setDossierTotalPages(0);
      })
      .finally(() => setDossierLoading(false));
  }

  const back = () => router.push("/admin/nhanvien");

  return (
    <AdminLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center text-sm px-2 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              <ArrowLeft size={16} className="mr-1" /> Quay lại
            </button>
            <h2 className="text-lg text-blue-600 font-semibold">
              Thống kê xử lý hồ sơ
            </h2>
          </div>
          <button
            onClick={() => {
              // refresh both stats and current dossiers page
              if (!Number.isFinite(userId) || Number.isNaN(userId)) return;
              setStatsLoading(true);
              userApi
                .getDossierStats(userId)
                .then((res) => setStats(res))
                .finally(() => setStatsLoading(false));
              loadUserDossiers(dossierPage);
            }}
            className="inline-flex items-center text-sm px-2 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            <RefreshCcw size={16} className="mr-1" /> Tải lại
          </button>
        </div>

        {/* Stats summary */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Tổng quan
          </h4>
          {statsLoading ? (
            <div className="py-2">
              <LoadingSpinner />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500">Tổng hồ sơ</div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats.total}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500">Đạt</div>
                <div className="text-lg font-semibold text-emerald-700">
                  {stats.obtained || 0}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500">Không đạt</div>
                <div className="text-lg font-semibold text-red-600">
                  {stats.notObtained || 0}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500">Đang xử lý</div>
                <div className="text-lg font-semibold text-amber-600">
                  {stats.pending || 0}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Không có dữ liệu</div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-3 flex flex-col md:flex-row gap-3 md:items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tháng</label>
            <select
              value={filterMonth ?? ""}
              onChange={(e) =>
                setFilterMonth(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="border text-gray-600 rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Năm</label>
            <input
              type="number"
              value={filterYear ?? ""}
              onChange={(e) =>
                setFilterYear(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="border text-gray-600 rounded px-2 py-1 text-sm w-28"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">
              Tìm kiếm (số đăng ký)
            </label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập từ khóa..."
              className="border text-gray-600 rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadUserDossiers(1)}
              className="px-3 py-1.5 text-sm border rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Lọc / Tìm
            </button>
            <button
              onClick={() => {
                setSearchTerm("");
                const n = new Date();
                setFilterMonth(n.getMonth() + 1);
                setFilterYear(n.getFullYear());
                loadUserDossiers(1);
              }}
              className="px-3 py-1.5 text-sm text-gray-600 border rounded"
            >
              Đặt lại
            </button>
          </div>
        </div>

        {/* Dossiers table */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {dossierLoading ? (
              <div className="p-6">
                <LoadingSpinner />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Mã hồ sơ
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Số đăng ký
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 ">
                  {dossiers.map((d) => (
                    <tr
                      key={d.receiptId}
                      className="hover:bg-gray-50 text-gray-700 cursor-pointer"
                      onClick={() => {
                        window.location.href = `/admin/hoso/${d.receiptId}`;
                      }}
                    >
                      <td className="px-4 py-2">#{d.receiptId}</td>
                      <td className="px-4 py-2">{d.registrationNo || ""}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-inset ${statusColor(d.certificateStatus)}`}>
                        {statusIcon(d.certificateStatus)}
                        <span>{statusVi[d.certificateStatus] || d.certificateStatus}</span>
                      </span>
                    </td>
                      <td className="px-4 py-2">
                        {new Date(d.createdAt).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                  {dossiers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        Không có hồ sơ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {dossierTotalPages > 1 && (
            <div className="p-3 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={dossierPage <= 1}
                onClick={() => loadUserDossiers(dossierPage - 1)}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {dossierPage}/{dossierTotalPages}
              </span>
              <button
                type="button"
                disabled={dossierPage >= dossierTotalPages}
                onClick={() => loadUserDossiers(dossierPage + 1)}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
