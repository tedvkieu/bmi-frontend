"use client";

import { useEffect, useState } from "react";
import { authApi, User } from "../../services/authApi";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon, // For Change Password
  MagnifyingGlassIcon, // For Dossier Search
  FolderIcon, // For Dossier Management
  HomeModernIcon, // For Overview
  BuildingOffice2Icon, // For Address if needed
} from "@heroicons/react/24/outline";
import { IoIosArrowRoundBack } from "react-icons/io";
import toast from "react-hot-toast";
import Image from "next/image";

// --- Dossier Result  ---
interface DossierResult {
  receiptId: number;
  registrationNo: string;
  customerSubmitId: number;
  customerRelatedId: number;
  inspectionTypeId: string;
  declarationNo: string;
  billOfLading: string;
  shipName: string;
  cout10: number;
  cout20: number;
  bulkShip: boolean;
  declarationDoc: string;
  declarationPlace: string;
  inspectionDate: string;
  certificateDate: string;
  inspectionLocation: string;
  files: string;
  certificateStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>("overview");
  const router = useRouter();

  useEffect(() => {
    const storedUser = authApi.getUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      router.push("/auth/login");
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    authApi.clearAuthData();
    router.push("/");
  };

  const role = authApi.getRoleFromToken();

  const handleGoToHomePage = () => {
    if (
      role === "ADMIN" ||
      role === "ISO_STAFF" ||
      role === "IMPORTER" ||
      role === "DOCUMENT_STAFF"
    ) {
      router.push("/admin");
    } else if (role === "SERVICE_MANAGER" || role === "IMPORTER") {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600 animate-pulse font-semibold">
          Đang tải hồ sơ...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-red-600 font-semibold">
          Bạn chưa đăng nhập. Vui lòng đăng nhập lại.
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans">
      {/* <NavbarClient />  */}
      {/* Background Image */}
      <div className="relative w-full h-72 lg:h-80">
        <Image
          src="/images/Banner-1-VESC.jpg"
          alt="Dashboard background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-blue-600/40" />

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleGoToHomePage}
            className="absolute top-4 left-4 flex items-center gap-1 px-4 py-2 
  bg-white text-gray-800 text-sm font-semibold rounded-lg shadow 
  "
          >
            <IoIosArrowRoundBack className="text-xl" />
            Trang chủ
          </button>
        </div>
      </div>
      {/* Content (overlay) */}
      <div className="relative -mt-36 md:-mt-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 bg-blue-700 text-white p-6 lg:py-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-8">
                <UserCircleIcon className="w-14 h-14 text-blue-200" />
                <div>
                  <h2 className="text-xl font-bold">Profile</h2>
                  <p className="text-sm text-blue-300">
                    {user.role === "SERVICE_MANAGER" ? "Quản lý dịch vụ" : user.role === "IMPORTER" ? "Người nhập khẩu" : user.role}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                <NavItem
                  icon={<HomeModernIcon className="w-5 h-5" />}
                  label="Tổng quan"
                  isSelected={selectedSection === "overview"}
                  onClick={() => setSelectedSection("overview")}
                />
                <NavItem
                  icon={<FolderIcon className="w-5 h-5" />}
                  label="Quản lý hồ sơ"
                  isSelected={selectedSection === "dossiers"}
                  onClick={() => setSelectedSection("dossiers")}
                />
                <NavItem
                  icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                  label="Tra cứu hồ sơ"
                  isSelected={selectedSection === "dossier-search"}
                  onClick={() => setSelectedSection("dossier-search")}
                />
                <NavItem
                  icon={<PencilSquareIcon className="w-5 h-5" />}
                  label="Chỉnh sửa hồ sơ"
                  isSelected={selectedSection === "edit-profile"}
                  onClick={() => setSelectedSection("edit-profile")}
                />
                <NavItem
                  icon={<KeyIcon className="w-5 h-5" />}
                  label="Đổi mật khẩu"
                  isSelected={selectedSection === "change-password"}
                  onClick={() => setSelectedSection("change-password")}
                />
              </nav>
            </div>
            <div className="mt-8 pt-4 border-t border-blue-600">
              <NavItem
                icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
                label="Đăng xuất"
                onClick={handleLogout}
                isLogout={true}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4 p-6 lg:p-10 bg-gray-50">
            {selectedSection === "overview" && (
              <OverviewSection user={user} router={router} />
            )}
            {selectedSection === "dossiers" && (
              <span className="text-blue-600">Comming</span>
            )}
            {selectedSection === "dossier-search" && <DossierSearchSection />}{" "}
            {/* New section for editing profile */}
          </div>
        </div>
      </div>
      <div className="h-20" /> {/* Spacer for bottom */}
    </div>
  );
}

// --- Reusable Components for Profile Sections ---
function NavItem({
  icon,
  label,
  onClick,
  isSelected = false,
  isLogout = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isSelected?: boolean;
  isLogout?: boolean;
}) {
  const baseClasses =
    "flex items-center p-3 rounded-lg transition-all duration-200 text-sm font-medium";
  const selectedClasses = isSelected
    ? "bg-blue-600 text-white shadow-md"
    : "hover:bg-blue-600 hover:text-blue-100";
  const logoutClasses = isLogout
    ? "text-red-200 hover:bg-red-700 hover:text-white mt-4 border-t border-red-500 pt-4"
    : "";
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${selectedClasses} ${logoutClasses} w-full text-left`}
    >
      <div className="mr-3">{icon}</div>
      {label}
    </button>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="mb-2 text-gray-500">{icon}</div>
      <span className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </span>
      <span className="block text-base font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

function OverviewSection({ user, router }: { user: User; router: any }) {
  return (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-extrabold text-gray-800 mb-8 pb-4 border-b-2 border-blue-600">
        Thông tin cá nhân
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <InfoCard
          icon={<UserCircleIcon className="w-6 h-6 text-blue-600" />}
          label="Tên đăng nhập"
          value={user.username}
        />
        <InfoCard
          icon={<EnvelopeIcon className="w-6 h-6 text-blue-600" />}
          label="Email"
          value={user.email}
        />
        <InfoCard
          icon={<PhoneIcon className="w-6 h-6 text-blue-600" />}
          label="Số điện thoại"
          value={user.phoneNumber || "Chưa cập nhật"} 
        />
        <InfoCard
          icon={<BuildingOffice2Icon className="w-6 h-6 text-blue-600" />}
          label="Địa chỉ"
          value={user.address || "Chưa cập nhật"} 
        />
      </div>
      <button
        onClick={() => router.push("/profile/edit")} // Direct link to edit profile
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all duration-200"
      >
        <PencilSquareIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
        Chỉnh sửa thông tin
      </button>
    </div>
  );
}

// function DossierManagementSection({ dossiers }: { dossiers: Dossier[] }) {
//   return (
//     <div className="animate-fade-in">
//       <h3 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-blue-600">
//         Quản lý hồ sơ
//       </h3>
//       {dossiers.length === 0 ? (
//         <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700">
//           <p className="font-medium text-lg">
//             Bạn chưa có hồ sơ nào. Hãy tạo hồ sơ mới!
//           </p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-lg shadow-lg">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-blue-600 text-white">
//               <tr>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
//                 >
//                   Mã Hồ sơ
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
//                 >
//                   Loại
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
//                 >
//                   Trạng thái
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
//                 >
//                   Ngày nộp
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
//                 >
//                   Cập nhật cuối
//                 </th>
//                 <th scope="col" className="relative px-6 py-3">
//                   <span className="sr-only">Chi tiết</span>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {dossiers.map((dossier) => (
//                 <tr
//                   key={dossier.id}
//                   className="hover:bg-gray-50 transition-colors duration-150"
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {dossier.id}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                     {dossier.type}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm">
//                     <span
//                       className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         dossier.status === "APPROVED"
//                           ? "bg-green-100 text-green-800"
//                           : dossier.status === "PENDING"
//                           ? "bg-yellow-100 text-yellow-800"
//                           : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {dossier.status === "APPROVED"
//                         ? "Đã duyệt"
//                         : dossier.status === "PENDING"
//                         ? "Đang chờ"
//                         : "Từ chối"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                     {dossier.submissionDate}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                     {dossier.lastUpdate}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <a
//                       href="#"
//                       className="text-blue-600 hover:text-blue-700 hover:underline"
//                     >
//                       Chi tiết
//                     </a>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

function DossierSearchSection() {
  const [dossierLookupFormData, setDossierLookupFormData] = useState({
    registerNo: "",
    certificateDate: "",
  });

  const [isSearchingDossier, setIsSearchingDossier] = useState(false);
  const [dossierResult, setDossierResult] = useState<DossierResult | null>(
    null
  );
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleDossierLookupChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDossierLookupFormData({
      ...dossierLookupFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDossierLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingDossier(true);
    setDossierResult(null);
    setSearchError(null);

    const { registerNo, certificateDate } = dossierLookupFormData;

    if (!registerNo || !certificateDate) {
      setSearchError("Vui lòng nhập đầy đủ Số chứng nhận và Ngày cấp.");
      setIsSearchingDossier(false);
      return;
    }

    try {
      toast.loading("Đang tra cứu hồ sơ...", { id: "dossierSearchToast" });
      const params = new URLSearchParams({
        registerNo: registerNo,
        certificateDate: certificateDate,
      }).toString();
      const apiUrl = `/api/dossiers/searchByRegisterNoAndCertificateDate?${params}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Không tìm thấy hồ sơ phù hợp.");
        }
        throw new Error(`Lỗi khi tra cứu: ${response.statusText}`);
      }

      const data: DossierResult = await response.json();

      if (Object.keys(data).length === 0) {
        throw new Error("Không tìm thấy hồ sơ phù hợp.");
      }

      setDossierResult(data);
      toast.success("Tra cứu hồ sơ thành công!", {
        id: "dossierSearchToast",
      });
    } catch (error: any) {
      console.error("Dossier lookup error:", error);
      setSearchError(error.message || "Có lỗi xảy ra khi tra cứu hồ sơ.");
      toast.error(error.message || "Tra cứu hồ sơ thất bại!", {
        id: "dossierSearchToast",
      });
    } finally {
      setIsSearchingDossier(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-blue-600">
        Tra cứu hồ sơ
      </h3>
      <form
        onSubmit={handleDossierLookupSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label
            htmlFor="registerNo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Số chứng nhận <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="registerNo"
            name="registerNo"
            required
            value={dossierLookupFormData.registerNo}
            onChange={handleDossierLookupChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600 text-gray-800 text-base transition-colors duration-200"
            placeholder="Nhập số chứng nhận (ví dụ: HD-20230101-001)"
          />
        </div>
        <div>
          <label
            htmlFor="certificateDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ngày cấp <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="certificateDate"
            name="certificateDate"
            required
            value={dossierLookupFormData.certificateDate}
            onChange={handleDossierLookupChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600 text-gray-800 text-base transition-colors duration-200"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isSearchingDossier}
        >
          {isSearchingDossier ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang tìm...
            </>
          ) : (
            <>
              <MagnifyingGlassIcon
                className="-ml-1 mr-3 h-5 w-5"
                aria-hidden="true"
              />
              Tìm kiếm hồ sơ
            </>
          )}
        </button>
      </form>

      {/* Dossier Lookup Results */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          KẾT QUẢ TRA CỨU
        </h3>
        {isSearchingDossier && (
          <p className="text-gray-600 text-center text-md py-4">
            Đang tải kết quả...
          </p>
        )}
        {searchError && (
          <div
            className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-md relative text-base"
            role="alert"
          >
            <strong className="font-semibold">Lỗi!</strong>
            <span className="block sm:inline ml-2">{searchError}</span>
          </div>
        )}
        {dossierResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md">
            <p className="font-bold text-gray-900 mb-4">
              Hồ sơ:{" "}
              <span className="text-blue-600">
                {dossierResult.registrationNo}
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
              <p>
                <span className="font-semibold">Mã biên nhận:</span>{" "}
                {dossierResult.receiptId}
              </p>
              <p>
                <span className="font-semibold">Loại giám định:</span>{" "}
                {dossierResult.inspectionTypeId}
              </p>
              <p>
                <span className="font-semibold">Số tờ khai:</span>{" "}
                {dossierResult.declarationNo}
              </p>
              <p>
                <span className="font-semibold">Số vận đơn:</span>{" "}
                {dossierResult.billOfLading}
              </p>
              <p>
                <span className="font-semibold">Tên tàu:</span>{" "}
                {dossierResult.shipName}
              </p>
              <p>
                <span className="font-semibold">Địa điểm khai báo:</span>{" "}
                {dossierResult.declarationPlace}
              </p>
              <p>
                <span className="font-semibold">Ngày giám định:</span>{" "}
                {new Date(dossierResult.inspectionDate).toLocaleDateString(
                  "vi-VN"
                )}
              </p>
              <p>
                <span className="font-semibold">Ngày cấp chứng nhận:</span>{" "}
                {new Date(dossierResult.certificateDate).toLocaleDateString(
                  "vi-VN"
                )}
              </p>
              <p className="md:col-span-2">
                <span className="font-semibold">Địa điểm giám định:</span>{" "}
                {dossierResult.inspectionLocation}
              </p>
              <p>
                <span className="font-semibold">Số lượng cont 10:</span>{" "}
                {dossierResult.cout10}
              </p>
              <p>
                <span className="font-semibold">Số lượng cont 20:</span>{" "}
                {dossierResult.cout20}
              </p>
              <p>
                <span className="font-semibold">Tàu rời:</span>{" "}
                {dossierResult.bulkShip ? "Có" : "Không"}
              </p>
              <p>
                <span className="font-semibold">Trạng thái chứng nhận:</span>{" "}
                <span
                  className={`font-bold ${
                    dossierResult.certificateStatus === "PENDING"
                      ? "text-orange-600"
                      : "text-green-700"
                  }`}
                >
                  {dossierResult.certificateStatus === "PENDING"
                    ? "Đang chờ"
                    : dossierResult.certificateStatus}
                </span>
              </p>
              {dossierResult.files && (
                <p className="md:col-span-2">
                  <span className="font-semibold">Tài liệu đính kèm:</span>{" "}
                  <a
                    href={dossierResult.files}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Xem tệp
                  </a>
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-6 text-right">
              Cập nhật lần cuối:{" "}
              {new Date(dossierResult.updatedAt).toLocaleDateString("vi-VN")}{" "}
              {new Date(dossierResult.updatedAt).toLocaleTimeString("vi-VN")}
            </p>
          </div>
        )}
        {!isSearchingDossier && !dossierResult && !searchError && (
          <div className="bg-gray-100 border border-gray-200 text-gray-700 px-6 py-4 rounded-md text-center text-md">
            <MagnifyingGlassIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <p>Vui lòng nhập thông tin để tra cứu hồ sơ.</p>
          </div>
        )}
      </div>
    </div>
  );
}
