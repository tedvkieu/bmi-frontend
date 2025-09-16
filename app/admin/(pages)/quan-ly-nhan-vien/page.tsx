"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, RefreshCcw, Eye } from "lucide-react";
import AdminLayout from "../../component/AdminLayout";
import { authApi, User as AuthUser } from "../../../services/authApi";
import { userApi, type UserRequest, type UserResponse, type UserRole } from "../../services/userApi";
import ConfirmationModal from "../../component/document/ConfirmationModal";

const STAFF_ROLES: UserRole[] = ["INSPECTOR", "DOCUMENT_STAFF", "ISO_STAFF"];
const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "INSPECTOR",
  "DOCUMENT_STAFF",
  "ISO_STAFF",
  "CUSTOMER",
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

const UsersPage = () => {
  const [currentUser] = useState<AuthUser | null>(authApi.getUser());
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [adminStatus, setAdminStatus] = useState<{ hasAdmin: boolean; canCreateAdmin: boolean; isOnlyAdmin: boolean } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserRequest>(initialForm);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserResponse | null>(null);

  // Always derive role from JWT cookie
  const roleFromToken = authApi.getRoleFromToken() as UserRole | null;
  const role = roleFromToken ?? (currentUser as any)?.role;
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const roleOptions = useMemo<UserRole[]>(() => {
    if (isAdmin) return ALL_ROLES;
    if (isManager) return STAFF_ROLES;
    return [];
  }, [isAdmin, isManager]);

  const loadAdminStatus = async () => {
    if (!isAdmin) return;
    try {
      const status = await userApi.getAdminStatus();
      setAdminStatus(status);
    } catch (e: any) {
      // Non-blocking
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        const list = await userApi.getAll();
        setUsers(list);
      } else {
        try {
          const list = await userApi.getStaff();
          setUsers(list);
        } catch (err: any) {
          const msg = String(err?.message || "");
          if (/forbidden|403/i.test(msg)) {
            const list = await userApi.getAll();
            setUsers(list);
          } else {
            throw err;
          }
        }
      }
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // When role changes (from cookie), reload
  useEffect(() => {
    loadData();
    loadAdminStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFromToken]);

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

  const openView = (u: UserResponse) => {
    setForm(mapToForm(u));
    setEditingId(u.userId);
    setFormMode("view");
    setIsModalOpen(true);
  };

  const openEdit = (u: UserResponse) => {
    // Không cho chỉnh sửa ADMIN
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    if (r === "ADMIN") return canSelectAdmin; // Only when backend allows
    if (isManager && (r === "MANAGER")) return false;
    return true;
  });

  const validateBeforeSubmit = (): string | null => {
    if (!form.fullName.trim()) return "Vui lòng nhập họ tên";
    if (!form.username.trim()) return "Vui lòng nhập username";
    if (!form.email.trim()) return "Vui lòng nhập email";

    // Block ADMIN selection in UI unless explicitly allowed
    if (form.role === "ADMIN" && !canSelectAdmin) return "Không thể chọn vai trò ADMIN";

    // For create mode, require password
    if (formMode === "create" && !(form.passwordHash && form.passwordHash.length >= 6)) {
      return "Mật khẩu tối thiểu 6 ký tự";
    }

    // For manager, ensure only staff roles
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
      // Send empty string as undefined to avoid updating password if unchanged
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
    } catch (e: any) {
      setError(e?.message || "Thao tác thất bại");
    }
  };

  const onDelete = async (u: UserResponse) => {
    if (!confirm(`Xác nhận xóa người dùng: ${u.fullName}?`)) return;
    setError("");
    try {
      await userApi.remove(u.userId);
      await loadData();
    } catch (e: any) {
      setError(e?.message || "Xóa thất bại");
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
    } catch (e: any) {
      setError(e?.message || "Xóa thất bại");
    } finally {
      setPendingDelete(null);
    }
  };

  const inputDisabled = formMode === "view";

  const canManageRow = (u: UserResponse) => isAdmin || (isManager && STAFF_ROLES.includes(u.role));
  const canDeleteRow = (u: UserResponse) => canManageRow(u) && u.role !== "ADMIN";
  const canEditRow = (u: UserResponse) => canManageRow(u) && u.role !== "ADMIN";

  const fieldClass = "mt-1 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const fieldReadOnlyClass = `${fieldClass} read-only:bg-gray-50 read-only:border-gray-200`;
  const selectDisabledClass = "disabled:bg-gray-50 disabled:text-gray-900 disabled:border-gray-200";

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Quản lý nhân viên</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <RefreshCcw size={16} className="mr-2" /> Tải lại
            </button>
            {(isAdmin || isManager) && (
              <button
                onClick={openCreate}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" /> Thêm người dùng
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">Đang tải...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">Không có dữ liệu</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.userId} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{u.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">{u.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {u.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>
                        )}
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
                            onClick={() => canEditRow(u) && openEdit(u)}
                            disabled={!canEditRow(u)}
                            className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none ${canEditRow(u) ? "text-gray-600 hover:bg-purple-100 hover:text-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50" : "text-gray-300 cursor-not-allowed bg-gray-50"}`}
                            title="Sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => canDeleteRow(u) && requestDelete(u)}
                            disabled={!canDeleteRow(u)}
                            className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none ${canDeleteRow(u) ? "text-gray-600 hover:bg-red-100 hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50" : "text-gray-300 cursor-not-allowed bg-gray-50"}`}
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-xl">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                {formMode === "create" ? "Thêm người dùng" : formMode === "edit" ? "Cập nhật người dùng" : "Xem thông tin người dùng"}
              </h4>
              <button onClick={closeModal} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} readOnly={inputDisabled} className={fieldReadOnlyClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <input type="date" name="dob" value={form.dob || ""} onChange={handleChange} readOnly={inputDisabled} className={fieldReadOnlyClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input name="username" value={form.username} onChange={handleChange} readOnly={inputDisabled} className={fieldReadOnlyClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} readOnly={inputDisabled} className={fieldReadOnlyClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                  <input name="phone" value={form.phone} onChange={handleChange} readOnly={inputDisabled} className={fieldReadOnlyClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select name="role" value={form.role} onChange={handleChange} disabled={inputDisabled} className={`${fieldClass} ${selectDisabledClass}`}>
                    {filteredRoleOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {formMode !== "view" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formMode === "create" ? "Mật khẩu" : "Mật khẩu mới (để trống nếu không đổi)"}
                    </label>
                    <input type="password" name="passwordHash" value={form.passwordHash || ""} onChange={handleChange} className={fieldClass} />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea name="note" value={form.note} onChange={handleChange} readOnly={inputDisabled} className={`${fieldReadOnlyClass}`} rows={4} />
                </div>
                <div className="flex items-center">
                  <label className="mr-3 text-sm font-medium text-gray-700">Kích hoạt</label>
                  <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleChange} disabled={inputDisabled} />
                </div>
              </div>

              {error && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm">{error}</div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type={formMode === "view" ? "button" : "button"} onClick={closeModal} className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200">Đóng</button>
                {formMode !== "view" && (
                  <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                    {formMode === "create" ? "Tạo" : "Lưu"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng${pendingDelete ? ` "${pendingDelete.fullName}"` : ""}? Hành động này không thể hoàn tác.`}
      />
    </AdminLayout>
  );
};

export default UsersPage;
