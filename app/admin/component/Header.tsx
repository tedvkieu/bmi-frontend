"use client";

import React, { useMemo, useState } from "react";
import {
  AlignLeft, Search, X, Eye, UserPlus, ClipboardCheck,
  FileText, Users, Edit2, SearchX
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Định nghĩa kiểu dữ liệu cho kết quả tìm kiếm
type DossierResult = {
  type: "dossier";
  id: string;
  registrationNo: string;
  customerName: string;
  inspectionType: string;
  certificateDate: string;
  status: string;
};

type CustomerResult = {
  type: "customer";
  id: string;
  name: string;
  email: string;
  phone: string;
  customerType: string;
};

type SearchResult = DossierResult | CustomerResult;

interface HeaderProps {
  currentPageKey: string;
  isMobile?: boolean;
  onSidebarToggle: () => void;
}

// Map key với tiêu đề trang
const pageTitleMap: Record<string, { title: string; subtitle?: string }> = {
  dashboard_overview: { title: "Tổng quan hệ thống", subtitle: "Tình trạng chung và cập nhật nhanh" },
  dashboard_analytic: { title: "Phân tích dữ liệu", subtitle: "Biểu đồ & số liệu theo thời gian" },
  documents_requests: { title: "Tiếp nhận yêu cầu", subtitle: "Danh sách yêu cầu chờ xử lý" },
  documents: { title: "Quản lý hồ sơ", subtitle: "Thao tác nhanh, chỉnh sửa và theo dõi tiến trình" },
  assignment: { title: "Phân công", subtitle: "Gán giám định viên và theo dõi" },
  evaluation: { title: "Đánh giá hồ sơ", subtitle: "Đánh giá chất lượng và kết luận" },
  clients: { title: "Khách hàng", subtitle: "Quản lý thông tin khách hàng" },
  users: { title: "Nhân viên", subtitle: "Quản lý tài khoản nhân sự" },
  reports: { title: "Báo cáo", subtitle: "Tổng hợp & xuất báo cáo" },
  settings: { title: "Cài đặt hệ thống", subtitle: "Thiết lập & quyền hạn" },
  dashboard: { title: "Dashboard", subtitle: "" },
};

// Component con để hiển thị kết quả, giúp component chính gọn gàng hơn
const RenderSearchResults = ({
  loading,
  errorMsg,
  dossierResults,
  customerResults,
  router
}: {
  loading: boolean;
  errorMsg: string;
  dossierResults: DossierResult[];
  customerResults: CustomerResult[];
  router: any; // NextRouter
}) => {
  const statusColorMap: Record<string, string> = {
    OBTAINED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    NOT_OBTAINED: "bg-red-100 text-red-800",
    NOT_WITHIN_SCOPE: "bg-gray-200 text-gray-800",
  };

  const handleCreateDraft = (customerId: number) => {
    if (!Number.isFinite(customerId)) {
      toast.error("Không xác định được khách hàng cần tạo hồ sơ");
      return;
    }
    router.push(`/admin/tao-ho-so-khach/${customerId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errorMsg) {
    return <p className="text-red-600 bg-red-50 p-4 rounded-lg text-center">{errorMsg}</p>;
  }

  // **Cải tiến cốt lõi: Chỉ hiển thị "NoResults" khi cả hai loại kết quả đều rỗng**
  if (dossierResults.length === 0 && customerResults.length === 0) {
    return (
      <div className="text-center py-16">
        <SearchX className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-800">Không tìm thấy kết quả</h3>
        <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại với từ khóa khác.</p>
      </div>
    );
  }

  // Nếu có ít nhất một loại kết quả, render danh sách
  return (
    <div className="space-y-8">
      {dossierResults.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-blue-600" size={22} />
            <h3 className="text-lg font-semibold text-gray-800">Hồ sơ ({dossierResults.length})</h3>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số đăng ký</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dossierResults.map((item) => (
                  <tr key={`dossier-${item.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.registrationNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.customerName || "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColorMap[item.status] || "bg-gray-100 text-gray-700"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => router.push(`/admin/hoso/${item.id}`)} className="p-2 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-700" title="Xem chi tiết"><Eye size={18} /></button>
                        <button onClick={() => router.push(`/admin/phancong?registerNo=${encodeURIComponent(item.registrationNo)}`)} className="p-2 rounded-full text-gray-500 hover:bg-indigo-100 hover:text-indigo-700" title="Phân công"><UserPlus size={18} /></button>
                        <button onClick={() => router.push(`/admin/evaluation?registerNo=${encodeURIComponent(item.registrationNo)}`)} className="p-2 rounded-full text-gray-500 hover:bg-amber-100 hover:text-amber-700" title="Đánh giá"><ClipboardCheck size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {customerResults.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <Users className="text-green-600" size={22} />
            <h3 className="text-lg font-semibold text-gray-800">Khách hàng ({customerResults.length})</h3>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loại</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerResults.map((item) => (
                  <tr key={`customer-${item.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.email || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.customerType || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => router.push(`/admin/khachhang/${item.id}`)} className="p-2 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-700" title="Xem chi tiết"><Eye size={18} /></button>
                        <button
                          onClick={() => handleCreateDraft(Number(item.id))}
                          className="p-2 rounded-full text-gray-500 hover:bg-green-100 hover:text-green-700"
                          title="Lên hồ sơ"
                        >
                          <FileText size={18} />
                        </button>
                        <button onClick={() => router.push(`/admin/khachhang/${item.id}`)} className="p-2 rounded-full text-gray-500 hover:bg-purple-100 hover:text-purple-700" title="Chỉnh sửa"><Edit2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};


export default function Header({ currentPageKey, onSidebarToggle }: HeaderProps) {
  const page = pageTitleMap[currentPageKey] ?? { title: "Dashboard", subtitle: "" };
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // Tạo breadcrumb
  const breadcrumb = useMemo(() => {
    const parts = currentPageKey.split("_");
    if (currentPageKey === "dashboard_overview") return ["Dashboard", "Tổng quan"];
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  }, [currentPageKey]);

  // Hàm xử lý tìm kiếm
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setResults([]); // Xóa kết quả cũ trước khi tìm kiếm mới
    setShowModal(true);

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchTerm)}`);

      if (res.ok) {
        const data = await res.json();
        const searchResults = data.results || [];
        setResults(searchResults);

      } else {
        if (res.status === 404) {
        } else {
          throw new Error("Đã có lỗi xảy ra từ máy chủ.");
        }
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      // Lỗi này sẽ bắt các lỗi mạng hoặc lỗi được throw ở trên
      setErrorMsg(err instanceof Error ? err.message : "Không thể thực hiện tìm kiếm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm đóng modal và reset trạng thái
  const closeModal = () => {
    setShowModal(false);
    setSearchTerm("");
    setResults([]);
    setErrorMsg("");
  };

  // Phân loại kết quả
  const dossierResults = useMemo(() => results.filter((r): r is DossierResult => r.type === "dossier"), [results]);
  const customerResults = useMemo(() => results.filter((r): r is CustomerResult => r.type === "customer"), [results]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onSidebarToggle}
              aria-label="Toggle sidebar"
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <AlignLeft size={20} className="text-gray-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">{page.title}</h1>
              <div className="text-xs text-gray-500 mt-0.5 truncate">{breadcrumb.join(" / ")}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-gray-800 md:flex items-center bg-gray-100 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-colors rounded-lg px-2 min-w-[280px]">
              <Search size={18} className="text-gray-400" />
              <input
                type="search"
                placeholder="Tìm hồ sơ, khách hàng..."
                className="bg-transparent w-full text-sm px-2 py-2 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-[8vh]">
          <div className="bg-white w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl relative flex flex-col">
            <div className="p-5 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                Kết quả tìm kiếm cho: <span className="text-blue-600 font-bold">{searchTerm}</span>
              </h2>
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-2 rounded-full" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {/* Sử dụng component con để render kết quả */}
              <RenderSearchResults
                loading={loading}
                errorMsg={errorMsg}
                dossierResults={dossierResults}
                customerResults={customerResults}
                router={router}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
