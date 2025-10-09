"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCcw,
  Eye,
  ChevronDown,
  Filter,
  Search,
  BarChart,
} from "lucide-react";
import { authApi, User as AuthUser } from "../../services/authApi";
import {
  userApi,
  type UserRequest,
  type UserResponse,
  type UserRole,
  type PaginatedUserResponse,
} from "../services/userApi";
import ConfirmationModal from "./document/ConfirmationModal";
import LoadingSpinner from "./document/LoadingSpinner";
// stats types moved to dedicated page

const STAFF_ROLES: UserRole[] = ["INSPECTOR", "DOCUMENT_STAFF", "ISO_STAFF"];
const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "INSPECTOR",
  "DOCUMENT_STAFF",
  "ISO_STAFF",
];

type FormMode = "create" | "edit" | "view";

const initialForm: UserRequest = {
  fullName: "",
  dob: "",
  role: "INSPECTOR",
  username: "",
  passwordHash: "",
  email: "",
  phone: "",
  note: "",
  isActive: true,
};

const roleDisplayNames: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Quản lý",
  INSPECTOR: "Kiểm định viên",
  DOCUMENT_STAFF: "Nhân viên tài liệu",
  ISO_STAFF: "Nhân viên ISO",
  CUSTOMER: "",
  GUEST: "",
};

const UsersClient: React.FC = () => {
  // removed: statusVi used in moved stats page

  const [currentUser] = useState<AuthUser | null>(authApi.getUser());
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [adminStatus, setAdminStatus] = useState<{
    hasAdmin: boolean;
    canCreateAdmin: boolean;
    isOnlyAdmin: boolean;
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserRequest>(initialForm);
  // Stats moved to a dedicated page: /admin/nhanvien/[id]/thongke

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserResponse | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");

  const roleFromToken = authApi.getRoleFromToken() as UserRole | null;
  const role = roleFromToken ?? (currentUser as any)?.role;
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const roleOptions = useMemo<UserRole[]>(() => {
    if (isAdmin) return ALL_ROLES;
    if (isManager) return STAFF_ROLES;
    return [];
  }, [isAdmin, isManager]);

  const loadAdminStatus = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const status = await userApi.getAdminStatus();
      setAdminStatus(status);
    } catch {}
  }, [isAdmin]);

  const loadData = useCallback(
    async (page: number = currentPage, size: number = itemsPerPage) => {
      setLoading(true);
      setError("");
      try {
        const safePage =
          typeof page === "number" && Number.isFinite(page) && page > 0
            ? page
            : 1;
        const safeSize =
          typeof size === "number" && Number.isFinite(size) && size > 0
            ? size
            : itemsPerPage;
        const response: PaginatedUserResponse = await userApi.getAllUsersPage(
          safePage - 1,
          safeSize
        );
        setUsers(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        const nextPage =
          typeof response.number === "number" && !Number.isNaN(response.number)
            ? response.number + 1
            : 1;
        setCurrentPage(nextPage);
      } catch (e: any) {
        setError(e?.message || "Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage]
  );

  useEffect(() => {
    loadData(currentPage, itemsPerPage);
    loadAdminStatus();
  }, [
    roleFromToken,
    currentPage,
    itemsPerPage,
    searchTerm,
    filterRole,
    loadAdminStatus,
    loadData,
  ]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setFormMode("create");
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const mapToForm = (u: UserResponse): UserRequest => ({
    fullName: u.fullName,
    dob: u.dob || "",
    role: u.role,
    username: u.username,
    passwordHash: "",
    email: u.email,
    phone: u.phone || "",
    note: u.note || "",
    isActive: u.isActive,
  });

  // (removed local stats/dossiers loaders)

  const openView = (u: UserResponse) => {
    setForm(mapToForm(u));
    setEditingId(u.userId);
    setFormMode("view");
    setIsModalOpen(true);
  };

  const openEdit = (u: UserResponse) => {
    if (u.role === "ADMIN") {
      openView(u);
      return;
    }
    setForm(mapToForm(u));
    setEditingId(u.userId);
    setFormMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    // stats state moved out
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const canSelectAdmin = useMemo(() => {
    if (!isAdmin) return false;
    if (!adminStatus) return false;
    return adminStatus.canCreateAdmin;
  }, [isAdmin, adminStatus]);

  const filteredRoleOptions = roleOptions.filter((r) => {
    if (r === "ADMIN") return canSelectAdmin;
    if (isManager && r === "MANAGER") return false;
    if (r === "CUSTOMER" && isManager) return false;
    return true;
  });

  const validateBeforeSubmit = (): string | null => {
    if (!form.fullName.trim()) return "Vui lòng nhập họ tên";
    if (!form.username.trim()) return "Vui lòng nhập username";
    if (!form.email.trim()) return "Vui lòng nhập email";

    if (form.role === "ADMIN" && !canSelectAdmin)
      return "Không thể chọn vai trò ADMIN";

    if (
      formMode === "create" &&
      !(form.passwordHash && form.passwordHash.length >= 6)
    ) {
      return "Mật khẩu tối thiểu 6 ký tự";
    }

    if (isManager && !STAFF_ROLES.includes(form.role)) {
      return "MANAGER chỉ được tạo/sửa nhân sự (INSPECTOR, DOCUMENT_STAFF, ISO_STAFF)";
    }

    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formMode === "view") {
      closeModal();
      return;
    }
    const msg = validateBeforeSubmit();
    if (msg) {
      setError(msg);
      return;
    }

    const payload: UserRequest = {
      ...form,
      passwordHash: form.passwordHash?.trim() ? form.passwordHash : undefined,
      dob: form.dob ? form.dob : "",
    };

    try {
      if (formMode === "create") {
        await userApi.create(payload);
      } else if (editingId) {
        await userApi.update(editingId, payload);
      }
      closeModal();
      await loadData();
      await loadAdminStatus();
    } catch (e: any) {
      setError(e?.message || "Thao tác thất bại");
    }
  };

  const requestDelete = (u: UserResponse) => {
    setPendingDelete(u);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setConfirmOpen(false);
    setError("");
    try {
      await userApi.remove(pendingDelete.userId);
      await loadData();
      await loadAdminStatus();
    } catch (e: any) {
      setError(e?.message || "Xóa thất bại");
    } finally {
      setPendingDelete(null);
    }
  };

  const inputDisabled = formMode === "view";

  const canManageRow = (u: UserResponse) =>
    isAdmin || (isManager && STAFF_ROLES.includes(u.role));
  const canDeleteRow = (u: UserResponse) =>
    canManageRow(u) && u.role !== "ADMIN" && u.userId !== currentUser?.userId;
  const canEditRow = (u: UserResponse) => canManageRow(u) && u.role !== "ADMIN";

  const fieldClass =
    "mt-1 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const fieldReadOnlyClass = `${fieldClass} read-only:bg-gray-50 read-only:border-gray-200`;
  const selectDisabledClass =
    "disabled:bg-gray-50 disabled:text-gray-900 disabled:border-gray-200";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value as UserRole | "all");
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => {
    const safe =
      typeof pageNumber === "number" && Number.isFinite(pageNumber)
        ? pageNumber
        : 1;
    const clamped = Math.min(Math.max(safe, 1), Math.max(totalPages, 1));
    setCurrentPage(clamped);
  };

  return (
    <>
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="relative flex-1 col-span-1 md:col-span-2 xl:col-span-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, username hoặc vai trò..."
                  className="pl-10 pr-4 py-2.5 border text-gray-800  border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="relative inline-block col-span-1">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  className="pl-9 pr-8 py-2.5  w-full border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  value={filterRole}
                  onChange={handleFilterChange}
                >
                  <option value="all">Tất cả vai trò</option>
                  {ALL_ROLES.map((roleOpt) => (
                    <option key={roleOpt} value={roleOpt}>
                      {roleDisplayNames[roleOpt]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <div className="flex justify-end col-span-1">
                <button
                  onClick={() => loadData()}
                  className="inline-flex items-center text-sm px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-2"
                >
                  <RefreshCcw size={16} className="mr-2" /> Tải lại
                </button>
                {(isAdmin || isManager) && (
                  <button
                    onClick={openCreate}
                    className="inline-flex text-sm items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} className="mr-2" /> Thêm người dùng
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase">
                        Họ tên
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase">
                        Vai trò
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-800 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-gray-500 text-sm"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u.userId}
                          className="hover:bg-blue-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-sm text-gray-700 ">
                            {u.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 ">
                            {u.fullName}
                          </td>
                          <td className="px-6 py-4 text-sm ">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {roleDisplayNames[u.role]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => openView(u)}
                                className="p-2.5 rounded-full text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                title="Xem"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  window.location.href = `/admin/nhanvien/${u.userId}/thongke`;
                                }}
                                className="p-2.5 rounded-full text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                                title="Xem thống kê xử lý hồ sơ"
                              >
                                <BarChart size={18} />
                              </button>
                              <button
                                onClick={() => canEditRow(u) && openEdit(u)}
                                disabled={!canEditRow(u)}
                                className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none ${
                                  canEditRow(u)
                                    ? "text-gray-600 hover:bg-purple-100 hover:text-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                                    : "text-gray-400 bg-gray-100 cursor-not-allowed"
                                }`}
                                title="Sửa"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  canDeleteRow(u) && requestDelete(u)
                                }
                                disabled={!canDeleteRow(u)}
                                className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none ${
                                  canDeleteRow(u)
                                    ? "text-gray-600 hover:bg-red-100 hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                    : "text-gray-400 bg-gray-100 cursor-not-allowed"
                                }`}
                                title="Xóa"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalElements > 0 && (
              <div className="flex justify-center items-center gap-4 mt-4 text-sm">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="text-gray-700">
                  Trang {currentPage} trên {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-white/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-xl">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                {formMode === "create"
                  ? "Thêm người dùng"
                  : formMode === "edit"
                  ? "Cập nhật người dùng"
                  : "Xem thông tin người dùng"}
              </h4>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Stats tab removed; now available on a dedicated page */}

            {/* Detail Tab Content */}
            {(formMode !== "view" || true) && (
              <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ tên
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      readOnly={inputDisabled}
                      placeholder="Nhập họ tên"
                      className={fieldReadOnlyClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={form.dob || ""}
                      onChange={handleChange}
                      readOnly={inputDisabled}
                      placeholder="Chọn ngày sinh"
                      className={fieldReadOnlyClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      readOnly={inputDisabled}
                      placeholder="Tên đăng nhập"
                      className={fieldReadOnlyClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      readOnly={inputDisabled}
                      placeholder="example@gmail.com"
                      className={fieldReadOnlyClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Điện thoại
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      readOnly={inputDisabled}
                      placeholder="Số điện thoại"
                      className={fieldReadOnlyClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      disabled={inputDisabled}
                      className={`${fieldClass} ${selectDisabledClass}`}
                    >
                      <option value="" disabled hidden>
                        -- Chọn vai trò --
                      </option>
                      {filteredRoleOptions.map((r) => (
                        <option key={r} value={r}>
                          {roleDisplayNames[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formMode !== "view" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formMode === "create"
                          ? "Mật khẩu"
                          : "Mật khẩu mới (để trống nếu không đổi)"}
                      </label>
                      <input
                        type="password"
                        name="passwordHash"
                        value={form.passwordHash || ""}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={fieldClass}
                        autoComplete={
                          formMode === "create" ? "new-password" : "off"
                        }
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      readOnly={inputDisabled}
                      placeholder="Nhập ghi chú thêm..."
                      className={`${fieldReadOnlyClass}`}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="mr-3 text-sm font-medium text-gray-700">
                      Kích hoạt
                    </label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={!!form.isActive}
                      onChange={handleChange}
                      disabled={inputDisabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type={"button"}
                    onClick={closeModal}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    Đóng
                  </button>
                  {formMode !== "view" && (
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {formMode === "create" ? "Tạo" : "Lưu"}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Dossiers tab content removed */}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng${
          pendingDelete ? ` "${pendingDelete.fullName}"` : ""
        }? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

export default UsersClient;
