"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
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
  type UserWithCompetencyRequest,
  type UserResponse,
  type UserRole,
  type PaginatedUserResponse,
} from "../services/userApi";
import ConfirmationModal from "./document/ConfirmationModal";
import LoadingSpinner from "./document/LoadingSpinner";
import CompetencySection from "./CompetencySection";
import CompetencyCreateSection from "./CompetencyCreateSection";
import toast from "react-hot-toast";
import { Switch } from "./ui/switch";

const STAFF_ROLES: UserRole[] = ["INSPECTOR", "DOCUMENT_STAFF", "ISO_STAFF"];
const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "INSPECTOR",
  "DOCUMENT_STAFF",
  "ISO_STAFF",
];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type FormMode = "create" | "edit" | "view";

const initialForm: UserRequest = {
  fullName: "",
  dob: "",
  role: "INSPECTOR",
  passwordHash: "",
  email: "",
  phone: "",
  note: "",
  isActive: true,

  // Inspector specific fields
  inspectorCode: "",
  trainingSpecialization: "",
  workExperience: 0,
  inspectionExperience: "",
  contractType: "",
};

const roleDisplayNames: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Quản lý",
  INSPECTOR: "Kiểm định viên",
  DOCUMENT_STAFF: "Nhân viên tài liệu",
  ISO_STAFF: "Nhân viên ISO",
  CUSTOMER: "Khách hàng",
  GUEST: "Khách",
};

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  ADMIN: { bg: "bg-red-100", text: "text-red-800" },
  MANAGER: { bg: "bg-purple-100", text: "text-purple-800" },
  INSPECTOR: { bg: "bg-yellow-100", text: "text-yellow-800" },
  DOCUMENT_STAFF: { bg: "bg-blue-100", text: "text-blue-800" },
  ISO_STAFF: { bg: "bg-indigo-100", text: "text-indigo-800" },
  CUSTOMER: { bg: "bg-green-100", text: "text-green-800" },
  GUEST: { bg: "bg-gray-100", text: "text-gray-800" },
};

const UsersClient: React.FC = () => {
  const [currentUser] = useState<AuthUser | null>(authApi.getUser());
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingTableData, setLoadingTableData] = useState<boolean>(false);
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserResponse | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [gotoPageInput, setGotoPageInput] = useState<string>("");

  // Competency states for create mode
  const [selectedCertificationIds, setSelectedCertificationIds] = useState<number[]>([]);
  const [selectedProductCategoryIds, setSelectedProductCategoryIds] = useState<number[]>([]);
  const [competencyFormData, setCompetencyFormData] = useState({
    obtainedDate: '',
    expiryDate: '',
    certificateNumber: '',
    issuingOrganization: '',
    assignedDate: '',
    experienceLevel: '',
    notes: ''
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roleFromToken = authApi.getRoleFromToken() as UserRole | null;
  const role = roleFromToken ?? (currentUser as any)?.role;
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const roleOptions = useMemo<UserRole[]>(() => {
    if (isAdmin) return ALL_ROLES;
    if (isManager) return STAFF_ROLES;
    return [];
  }, [isAdmin, isManager]);

  const paginationNumbers = useMemo(() => {
    if (!totalPages) return [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const resultsRange = useMemo(() => {
    if (!totalElements || users.length === 0) {
      return { start: 0, end: 0 };
    }
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + users.length - 1, totalElements);
    return { start, end };
  }, [currentPage, itemsPerPage, totalElements, users.length]);

  const loadAdminStatus = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const status = await userApi.getAdminStatus();
      setAdminStatus(status);
    } catch { }
  }, [isAdmin]);

  const loadData = useCallback(
    async (
      page: number,
      size: number,
      search: string,
      role: UserRole | "all"
    ) => {
      const safePage = Number.isFinite(page) && page > 0 ? page : 1;
      const safeSize = Number.isFinite(size) && size > 0 ? size : 10;
      setLoadingTableData(true);
      setError("");
      try {
        const response: PaginatedUserResponse = await userApi.getAllUsersPage(
          safePage - 1,
          safeSize,
          search,
          role === "all" ? "" : role
        );
        setUsers(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        const backendPage =
          typeof response.number === "number" &&
            Number.isFinite(response.number)
            ? response.number + 1
            : safePage;
        setCurrentPage(backendPage);
      } catch (_e: any) {
        setError(_e?.message || "Không thể tải danh sách người dùng");
      } finally {
        setLoadingTableData(false);
      }
    },
    []
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const handler = setTimeout(() => {
      loadData(currentPage, itemsPerPage, searchTerm, filterRole);
      loadAdminStatus();
    }, 500);

    searchTimeoutRef.current = handler;

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    filterRole,

    loadData,
    loadAdminStatus,
  ]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setFormMode("create");
    // Reset competency states
    setSelectedCertificationIds([]);
    setSelectedProductCategoryIds([]);
    setCompetencyFormData({
      obtainedDate: '',
      expiryDate: '',
      certificateNumber: '',
      issuingOrganization: '',
      assignedDate: '',
      experienceLevel: '',
      notes: ''
    });
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const mapToForm = (u: UserResponse): UserRequest => ({
    fullName: u.fullName,
    dob: u.dob || "",
    role: u.role,
    passwordHash: "",
    email: u.email,
    phone: u.phone || "",
    note: u.note || "",
    isActive: u.isActive,

    // Inspector specific fields
    inspectorCode: u.inspectorCode || "",
    trainingSpecialization: u.trainingSpecialization || "",
    workExperience: u.workExperience || 0,
    inspectionExperience: u.inspectionExperience || "",
    contractType: u.contractType || "",
  });

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
    if (r === "GUEST" && isManager) return false;
    return true;
  });

  const validateBeforeSubmit = (): string | null => {
    if (!form.fullName.trim()) return "Vui lòng nhập họ tên";
    if (!form.email.trim()) return "Vui lòng nhập email";

    if (form.role === "ADMIN" && !canSelectAdmin && formMode === "create")
      return "Không thể tạo thêm vị trí ADMIN";

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
        // Check if user is INSPECTOR and has competency data
        const hasCompetencyData = form.role === "INSPECTOR" &&
          (selectedCertificationIds.length > 0 || selectedProductCategoryIds.length > 0);

        if (hasCompetencyData) {
          // Use new API to create user with competency
          const competencyPayload: UserWithCompetencyRequest = {
            ...payload,
            certificationIds: selectedCertificationIds.length > 0 ? selectedCertificationIds : undefined,
            productCategoryIds: selectedProductCategoryIds.length > 0 ? selectedProductCategoryIds : undefined,
            obtainedDate: competencyFormData.obtainedDate || undefined,
            expiryDate: competencyFormData.expiryDate || undefined,
            certificateNumber: competencyFormData.certificateNumber || undefined,
            issuingOrganization: competencyFormData.issuingOrganization || undefined,
            assignedDate: competencyFormData.assignedDate || undefined,
            experienceLevel: competencyFormData.experienceLevel || undefined,
            competencyNotes: competencyFormData.notes || undefined,
          };
          await userApi.createWithCompetency(competencyPayload);
        } else {
          await userApi.create(payload);
        }
      } else if (editingId) {
        await userApi.update(editingId, payload);
      }
      closeModal();
      loadData(currentPage, itemsPerPage, searchTerm, filterRole);
      loadAdminStatus();
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
      toast.success("Xóa thành công!");
      loadData(currentPage, itemsPerPage, searchTerm, filterRole);
      loadAdminStatus();
    } catch (e: any) {
      toast.error("Xóa thất bại!");
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

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSize = Number.parseInt(e.target.value, 10);
    if (!Number.isFinite(nextSize) || nextSize <= 0) return;
    setItemsPerPage(nextSize);
    setCurrentPage(1);
  };

  const handleGotoPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gotoPageInput) return;
    const nextPage = Number.parseInt(gotoPageInput, 10);
    if (Number.isFinite(nextPage)) {
      paginate(nextPage);
    }
    setGotoPageInput("");
  };

  const paginate = (pageNumber: number) => {
    if (!Number.isFinite(pageNumber)) return;
    if (pageNumber < 1) return;
    if (totalPages && pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              className="pl-10 pr-4 py-2.5 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-col gap-3 min-w-[220px] sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-[160px]">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                className="pl-9 pr-8 py-2.5 w-full border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={filterRole}
                onChange={handleFilterChange}
              >
                <option value="all">Tất cả vị trí</option>
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
            <div className="relative w-full sm:w-auto min-w-[140px]">
              <select
                className="pl-3 pr-8 py-2.5 w-full border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={itemsPerPage}
                onChange={handlePageSizeChange}
              >
                {PAGE_SIZE_OPTIONS.map((sizeOption) => (
                  <option key={sizeOption} value={sizeOption}>
                    {sizeOption} / trang
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <button
              onClick={() =>
                loadData(currentPage, itemsPerPage, searchTerm, filterRole)
              }
              className="inline-flex items-center text-sm px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
          <div className="overflow-x-auto relative">
            {loadingTableData && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <LoadingSpinner />
              </div>
            )}
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
                    Vị trí/Chức vụ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-800 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {!loadingTableData && users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-500 text-sm"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  !loadingTableData &&
                  users.map((u) => (
                    <tr
                      key={u.userId}
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {u.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role].bg
                            } ${roleColors[u.role].text}`}
                        >
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
                          {/* <button
                            onClick={() => {
                              window.location.href = `/admin/users/${u.userId}/competency`;
                            }}
                            className="p-2.5 rounded-full text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                            title="Quản lý năng lực"
                          >
                            <Award size={18} />
                          </button> */}
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
                            className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none ${canEditRow(u)
                              ? "text-gray-600 hover:bg-purple-100 hover:text-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                              : "text-gray-400 bg-gray-100 cursor-not-allowed"
                              }`}
                            title="Sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => canDeleteRow(u) && requestDelete(u)}
                            disabled={!canDeleteRow(u)}
                            className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none ${canDeleteRow(u)
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-700 font-medium">
              Hiển thị{" "}
              <span className="font-semibold text-gray-900">
                {resultsRange.start}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-gray-900">
                {resultsRange.end}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-gray-900">
                {totalElements}
              </span>{" "}
              người dùng
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1 || loadingTableData}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>

              <div className="flex items-center gap-1">
                {paginationNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    disabled={loadingTableData}
                    className={`min-w-[36px] px-3 py-1.5 rounded-md text-sm font-medium transition-all ${pageNumber === currentPage
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              {totalPages > 0 && (
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || loadingTableData}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Tiếp →
                </button>
              )}

              <form
                onSubmit={handleGotoPageSubmit}
                className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300"
              >
                <span className="text-sm text-gray-700">Đến trang</span>
                <input
                  value={gotoPageInput}
                  onChange={(e) => setGotoPageInput(e.target.value)}
                  placeholder={currentPage.toString()}
                  className="w-14 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  inputMode="numeric"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Đi
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-white/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
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

            <div className="flex-1 overflow-y-auto">
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
                      Vị trí/Chức vụ
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      disabled={inputDisabled}
                      className={`${fieldClass} ${selectDisabledClass}`}
                    >
                      <option value="" disabled hidden>
                        -- Chọn vị trí --
                      </option>
                      {filteredRoleOptions.map((r) => (
                        <option key={r} value={r}>
                          {roleDisplayNames[r]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Inspector specific fields - only show for INSPECTOR role */}
                  {form.role === "INSPECTOR" && (
                    <>
                      {/* Mã số giám định viên - hide in create mode, disable in edit mode */}
                      {formMode !== "create" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mã số giám định viên
                          </label>
                          <input
                            type="text"
                            name="inspectorCode"
                            value={form.inspectorCode || ""}
                            onChange={handleChange}
                            readOnly={true}
                            placeholder="Tự động tạo bởi hệ thống"
                            className="w-full h-12 text-base bg-gray-100 text-gray-500 border-2 border-gray-300 rounded-lg cursor-not-allowed"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chuyên môn đào tạo
                        </label>
                        <input
                          type="text"
                          name="trainingSpecialization"
                          value={form.trainingSpecialization || ""}
                          onChange={handleChange}
                          readOnly={inputDisabled}
                          placeholder="VD: Cao đẳng Cơ khí"
                          className={fieldReadOnlyClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kinh nghiệm công tác (năm)
                        </label>
                        <input
                          type="number"
                          name="workExperience"
                          value={form.workExperience || ""}
                          onChange={handleChange}
                          readOnly={inputDisabled}
                          placeholder="VD: 7"
                          min="0"
                          step="0.1"
                          className={fieldReadOnlyClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kinh nghiệm giám định chất lượng SPHH
                        </label>
                        <input
                          type="text"
                          name="inspectionExperience"
                          value={form.inspectionExperience || ""}
                          onChange={handleChange}
                          readOnly={inputDisabled}
                          placeholder="VD: trên 20"
                          className={fieldReadOnlyClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <div className="flex items-center space-x-3 h-12 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                          <Switch
                            checked={!!form.isActive}
                            onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
                            disabled={inputDisabled}
                          />
                          <span className="text-sm text-gray-700">
                            {form.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loại hợp đồng lao động đã ký
                        </label>
                        <select
                          name="contractType"
                          value={form.contractType || ""}
                          onChange={handleChange}
                          disabled={inputDisabled}
                          className={`${fieldClass} ${selectDisabledClass}`}
                        >
                          <option value="">-- Chọn loại hợp đồng --</option>
                          <option value="Không thời hạn">Không thời hạn</option>
                          <option value="Có thời hạn">Có thời hạn</option>
                          <option value="Hợp đồng lao động">Hợp đồng lao động</option>
                          <option value="Thử việc">Thử việc</option>
                        </select>
                      </div>
                    </>
                  )}

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
                </div>

                {/* Competency Section - Only show for inspectors */}
                {form.role === "INSPECTOR" && (
                  formMode === "create" ? (
                    <CompetencyCreateSection
                      selectedCertificationIds={selectedCertificationIds}
                      selectedProductCategoryIds={selectedProductCategoryIds}
                      competencyFormData={competencyFormData}
                      onCertificationChange={setSelectedCertificationIds}
                      onProductCategoryChange={setSelectedProductCategoryIds}
                      onFormDataChange={setCompetencyFormData}
                    />
                  ) : (
                    <CompetencySection
                      userId={editingId || 0}
                      userRole={form.role}
                      isEditing={formMode !== "view"}
                    />
                  )
                )}

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
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng${pendingDelete ? ` "${pendingDelete.fullName}"` : ""
          }? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

export default UsersClient;
