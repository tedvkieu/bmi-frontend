"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  userApi,
  type UserDossierStatsResponse,
  type PaginatedReceiptResponse,
  type ReceiptResponseLite,
  UserResponse,
} from "../../../../services/userApi";
import LoadingSpinner from "../../../../component/document/LoadingSpinner";
import { RefreshCcw, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function EmployeeDossierStats() {
  const params = useParams<{ id: string }>();
  const userId = useMemo(() => Number(params?.id), [params]);

  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(false);


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

    // load user info
    setUserLoading(true);
    userApi.getById(userId)
      .then((res) => setUserInfo(res))
      .finally(() => setUserLoading(false));

    // load stats + dossiers
    setStatsLoading(true);
    userApi.getDossierStats(userId)
      .then((res) => setStats(res))
      .finally(() => setStatsLoading(false));

    loadUserDossiers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);


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

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg text-blue-600 font-semibold">
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
            className="inline-flex items-center text-base px-2 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            <RefreshCcw size={16} className="mr-1" /> Tải lại
          </button>
        </div>

<div className="bg-white  rounded-xl shadow-sm p-6 mb-4">
  <h4 className="font-semibold text-gray-800 mb-6 flex items-center gap-2 text-lg">
    Thông tin nhân viên
  </h4>

  {userLoading ? (
    <div className="flex justify-center py-8">
      <LoadingSpinner />
    </div>
  ) : userInfo ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-[15px] text-gray-800">
      {[
        { label: "Họ tên", value: userInfo.fullName },
        { label: "Email", value: userInfo.email },
        // { label: "Tên đăng nhập", value: userInfo.username },
        { label: "Số điện thoại", value: userInfo.phone },
        {
          label: "Ngày sinh",
          value: userInfo.dob
            ? new Date(userInfo.dob).toLocaleDateString("vi-VN")
            : null,
        },
        {
          label: "Vai trò",
          value: (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
              {userInfo.role || "—"}
            </span>
          ),
        },
      ].map((item, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row gap-1"
        >
          <span className="font-semibold text-gray-600">{item.label}:</span>
          <span className="text-gray-900 break-all">
            {item.value || "—"}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center text-gray-500 py-4">
      Không tìm thấy nhân viên
    </div>
  )}
</div>


        {/* Stats summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📊 Tổng quan
          </h4>
          {statsLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Tổng hồ sơ", value: stats.total, color: "text-gray-900" },
                { label: "Đạt", value: stats.obtained || 0, color: "text-emerald-600" },
                { label: "Không đạt", value: stats.notObtained || 0, color: "text-red-600" },
                { label: "Đang xử lý", value: stats.pending || 0, color: "text-amber-600" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition"
                >
                  <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                  <div className={`text-2xl font-semibold ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">Không có dữ liệu</div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🔍 Bộ lọc hồ sơ
          </h4>

          <div className="flex flex-col md:flex-row md:items-end gap-4 text-gray-800">
            {/* Tháng */}
            <div className="flex flex-col w-full md:w-32">
              <label className="text-sm font-medium text-gray-700 mb-1">Tháng</label>
              <select
                value={filterMonth ?? ""}
                onChange={(e) =>
                  setFilterMonth(e.target.value ? Number(e.target.value) : undefined)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Tất cả</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Năm */}
            <div className="flex flex-col w-full md:w-32">
              <label className="text-sm font-medium text-gray-700 mb-1">Năm</label>
              <input
                type="number"
                value={filterYear ?? ""}
                onChange={(e) =>
                  setFilterYear(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="VD: 2025"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Tìm kiếm */}
            <div className="flex flex-1 flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm (số đăng ký)
              </label>
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập số đăng ký hoặc từ khóa..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-9"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z" />
                </svg>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => loadUserDossiers(1)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 transition"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>



        {/* Dossiers table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
            <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              📁 Danh sách hồ sơ
            </h4>
            {dossierLoading && (
              <span className="text-sm text-blue-600 animate-pulse">
                Đang tải dữ liệu...
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {dossierLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : (
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-700">
                      Số đăng ký
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-700">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {dossiers.map((d) => (
                    <tr
                      key={d.receiptId}
                      className="hover:bg-blue-50 transition cursor-pointer"
                      onClick={() => window.location.href = `/admin/hoso/${d.receiptId}`}
                    >
                      <td className="px-5 py-3">{d.registrationNo || "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${statusColor(
                            d.certificateStatus
                          )}`}
                        >
                          {statusIcon(d.certificateStatus)}
                          <span>{statusVi[d.certificateStatus] || d.certificateStatus}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {new Date(d.createdAt).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}

                  {dossiers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-gray-500 text-sm"
                      >
                        Không có hồ sơ nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {dossierTotalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-600">
                Trang <b>{dossierPage}</b> / {dossierTotalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={dossierPage <= 1}
                  onClick={() => loadUserDossiers(dossierPage - 1)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  disabled={dossierPage >= dossierTotalPages}
                  onClick={() => loadUserDossiers(dossierPage + 1)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

