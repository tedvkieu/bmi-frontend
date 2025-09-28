"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import NavbarClient from "./components/NavbarClient";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";
import BannerClient from "./components/BannerClient";
import Footer from "./components/Footer";
import Image from "next/image";
import { createCustomer, CustomerRequest } from "./service/customerService";
import GuideOver from "./components/GuideOver"; // Import GuideOver component

// Định nghĩa kiểu dữ liệu cho Hồ sơ
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [dossierLookupFormData, setDossierLookupFormData] = useState({
    registerNo: "",
    certificateDate: "",
  });

  const [showGuide, setShowGuide] = useState(false); // State để kiểm soát việc hiển thị tour

  const startTour = () => {
    setShowGuide(true);
  };

  const handleTourEnd = () => {
    setShowGuide(false);
    // Optional: Lưu trạng thái đã xem tour vào localStorage để không hiện lại
    localStorage.setItem('hasSeenContactPageTour', 'true');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingDossier, setIsSearchingDossier] = useState(false);
  const [dossierResult, setDossierResult] = useState<DossierResult | null>(
    null
  );
  const [searchError, setSearchError] = useState<string | null>(null);

  const contactInfoRef = useRef<HTMLDivElement>(null);
  const contactFormRef = useRef<HTMLDivElement>(null);
  const dossierSearchRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDossierLookupChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDossierLookupFormData({
      ...dossierLookupFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const customer: CustomerRequest = {
        name: formData.name,
        address: "", // You might want to add an address field to your form
        email: formData.email,
        dob: "", // You might want to add a DOB field
        phone: formData.phone,
        customerType: "SERVICE_MANAGER", // This seems like a fixed value, consider if it should be dynamic
        note: formData.message,
      };
      await createCustomer(customer);

      toast.success(
        "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể."
      );
      console.log("Customer created successfully!");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
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
      const apiUrl = `/api/dossiers/searchByRegisterNoAndCertificateDate?registerNo=${registerNo}&certificateDate=${certificateDate}`;
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

  const handleScrollToContact = (section: string) => {
    switch (section) {
      case "form":
        contactFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        break;
      case "info":
        contactInfoRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        break;
      case "dossierSearch":
        dossierSearchRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        break;
      default:
        break;
    }
  };

  return (
    <>
      <NavbarClient onScrollToContact={handleScrollToContact} />

      {/* GuideOver Component */}
      <GuideOver run={showGuide} onTourEnd={handleTourEnd} />

      <div className="fixed left-4 bottom-6 flex flex-col space-y-3 z-50 floating-contact-support"> {/* Added class for tour */}
        <div className="bg-blue-700 text-white text-xs px-3 py-1.5 rounded-md shadow-lg relative max-w-[200px]">
          Nếu cần hỗ trợ upload file, vui lòng liên hệ qua Zalo hoặc số điện
          thoại để được hướng dẫn.
          <div className="absolute left-4 -bottom-1.5 w-2.5 h-2.5 bg-blue-700 rotate-45"></div>
        </div>

        <a
          href="tel:0911768008"
          className="flex items-center bg-green-500 text-white text-sm px-3 py-1.5 rounded-full shadow-md hover:bg-green-600 transition-colors duration-200 max-w-fit"
          aria-label="Hotline Bảo Minh"
        >
          <FaPhoneAlt className="text-sm mr-2" />
          <span className="font-medium">0911.76.80.08</span>
        </a>

        <a
          href="https://zalo.me/0911768008"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-blue-600 text-white text-sm px-3 py-1.5 rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200 max-w-fit"
          aria-label="Zalo Bảo Minh"
        >
          <Image
            src="/images/zalo-icon.jpg"
            alt="Zalo"
            width={18}
            height={18}
            className="mr-2 rounded-full"
          />
          <span className="font-medium">Nhắn tin Zalo</span>
        </a>
      </div>

      <div className="min-h-screen bg-gray-50 pb-12">
        <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 shadow-md">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">LIÊN HỆ VỚI CHÚNG TÔI</h1>
            <p className="text-blue-100 text-base opacity-90">
              Chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn một cách nhanh
              chóng.
            </p>
          </div>
        </header>
        <BannerClient />

        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Information Section */}
            <div
              ref={contactInfoRef}
              className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm h-fit contact-info-section" // Added class for tour
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                THÔNG TIN LIÊN HỆ CÔNG TY
              </h2>
              <div className="space-y-6 text-sm">
                {" "}
                {/* Reduced text size */}
                <div className="flex items-start space-x-4">
                  <div className="text-blue-600 p-2 rounded-full flex-shrink-0 bg-blue-50">
                    <FaBuilding className="w-4 h-4" /> {/* Smaller icon */}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-0.5">
                      TRỤ SỞ CHÍNH
                    </h3>
                    <p className="text-gray-600">
                      Số 85, Đường Hoàng Sa, Phường Tân Định, Quận 1
                    </p>
                    <p className="text-gray-600">
                      Thành phố Hồ Chí Minh, Việt Nam
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mã số thuế: 0315.978.642
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-green-600 p-2 rounded-full flex-shrink-0 bg-green-50">
                    <FaMapMarkerAlt className="w-4 h-4" /> {/* Smaller icon */}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-0.5">
                      VĂN PHÒNG GIAO DỊCH
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-700">
                          Tại Hồ Chí Minh:
                        </p>
                        <p className="text-gray-600">
                          Số 13, đường số 3, Phường An Khánh, TP. Thủ Đức
                        </p>
                        <p className="text-gray-600">Thành phố Hồ Chí Minh</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">
                          Tại Hải Phòng:
                        </p>
                        <p className="text-gray-600">
                          Số 31A, đường Bùi Thị Tự Nhiên
                        </p>
                        <p className="text-gray-600">
                          Phường Đông Hải 1, Quận Hải An, TP Hải Phòng
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-blue-600 p-2 rounded-full flex-shrink-0 bg-blue-50">
                    <FaPhoneAlt className="w-4 h-4" /> {/* Smaller icon */}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">HOTLINE</h3>
                    <a
                      href="tel:0911768008"
                      className="text-lg font-bold text-blue-700 hover:text-blue-800 transition-colors"
                    >
                      0911.76.80.08
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-red-600 p-2 rounded-full flex-shrink-0 bg-red-50">
                    <FaEnvelope className="w-4 h-4" /> {/* Smaller icon */}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">EMAIL</h3>
                    <a
                      href="mailto:info@baominhinspection.com"
                      className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                    >
                      info@baominhinspection.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div
              ref={contactFormRef}
              className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm h-fit contact-form-section" // Added class for tour
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-4 border-b border-gray-200">
                Liên hệ với chúng tôi
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Vui lòng điền thông tin vào form dưới đây. Chúng tôi sẽ phản hồi trong thời
                gian sớm nhất. Đăng ký tài khoản để theo dõi tiến độ xử lý yêu cầu.
                <span className="block mt-2 text-xs italic text-gray-500">
                  Các trường có dấu <span className="text-red-500">*</span> là bắt buộc.
                </span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0912 345 678"
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Chủ đề  <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                  >
                    <option value="">Chọn dịch vụ</option>
                    <option value="consultation">Tư vấn dịch vụ</option>
                    <option value="inspection">Yêu cầu giám định</option>
                    <option value="cooperation">Hợp tác kinh doanh</option>
                    <option value="other">Khác</option>
                  </select>

                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung bạn muốn gửi..."
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed contact-submit-button" // Added class for tour
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
                </button>
              </form>
            </div>

          </div>

          {/* Dossier Lookup Section */}
          <div
            ref={dossierSearchRef}
            className="mt-12 bg-white rounded-lg border border-gray-100 p-8 shadow-sm dossier-search-section" // Added class for tour
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
              TRA CỨU HỒ SƠ
            </h2>
            <form onSubmit={handleDossierLookupSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="registerNo"
                  className="block text-xs font-medium text-gray-700 mb-1"
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
                  className="w-full text-gray-700 text-sm px-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Nhập số chứng nhận"
                />
              </div>
              <div>
                <label
                  htmlFor="certificateDate"
                  className="block text-xs font-medium text-gray-700 mb-1"
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
                  className="w-full text-gray-700 text-sm px-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-48 bg-blue-600 text-white py-2.5 px-5 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed dossier-search-button" // Added class for tour
                disabled={isSearchingDossier}
              >
                {isSearchingDossier ? "Đang tìm..." : "Tìm kiếm hồ sơ"}
              </button>
            </form>

            {/* Dossier Lookup Results */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                KẾT QUẢ TRA CỨU
              </h3>
              {isSearchingDossier && (
                <p className="text-gray-600 text-center text-sm">Đang tải...</p>
              )}
              {searchError && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative text-sm"
                  role="alert"
                >
                  <strong className="font-semibold">Lỗi!</strong>
                  <span className="block sm:inline ml-2">{searchError}</span>
                </div>
              )}
              {dossierResult && (
                <div className="bg-blue-50 border border-blue-100 rounded-md p-5 text-sm">
                  {" "}
                  {/* Reduced padding and text size */}
                  <p className="text-gray-800 text-base font-semibold mb-3">
                    Hồ sơ:{" "}
                    <span className="text-blue-700">
                      {dossierResult.registrationNo}
                    </span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
                    <p>
                      <span className="font-medium">Mã biên nhận:</span>{" "}
                      {dossierResult.receiptId}
                    </p>
                    <p>
                      <span className="font-medium">Loại giám định:</span>{" "}
                      {dossierResult.inspectionTypeId}
                    </p>
                    <p>
                      <span className="font-medium">Số tờ khai:</span>{" "}
                      {dossierResult.declarationNo}
                    </p>
                    <p>
                      <span className="font-medium">Số vận đơn:</span>{" "}
                      {dossierResult.billOfLading}
                    </p>
                    <p>
                      <span className="font-medium">Tên tàu:</span>{" "}
                      {dossierResult.shipName}
                    </p>
                    <p>
                      <span className="font-medium">Địa điểm khai báo:</span>{" "}
                      {dossierResult.declarationPlace}
                    </p>
                    <p>
                      <span className="font-medium">Ngày giám định:</span>{" "}
                      {new Date(
                        dossierResult.inspectionDate
                      ).toLocaleDateString("vi-VN")}
                    </p>
                    <p>
                      <span className="font-medium">Ngày cấp chứng nhận:</span>{" "}
                      {new Date(
                        dossierResult.certificateDate
                      ).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-medium">Địa điểm giám định:</span>{" "}
                      {dossierResult.inspectionLocation}
                    </p>
                    <p>
                      <span className="font-medium">Số lượng cont 10:</span>{" "}
                      {dossierResult.cout10}
                    </p>
                    <p>
                      <span className="font-medium">Số lượng cont 20:</span>{" "}
                      {dossierResult.cout20}
                    </p>
                    <p>
                      <span className="font-medium">Tàu rời:</span>{" "}
                      {dossierResult.bulkShip ? "Có" : "Không"}
                    </p>
                    <p>
                      <span className="font-medium">
                        Trạng thái chứng nhận:
                      </span>{" "}
                      <span
                        className={`font-semibold ${dossierResult.certificateStatus === "PENDING"
                          ? "text-orange-600"
                          : "text-green-600"
                          }`}
                      >
                        {dossierResult.certificateStatus === "PENDING"
                          ? "Đang chờ"
                          : dossierResult.certificateStatus}
                      </span>
                    </p>
                    {dossierResult.files && (
                      <p className="md:col-span-2">
                        <span className="font-medium">Tài liệu đính kèm:</span>{" "}
                        <a
                          href={dossierResult.files}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Xem tệp
                        </a>
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-right">
                    Cập nhật lần cuối:{" "}
                    {new Date(dossierResult.updatedAt).toLocaleDateString(
                      "vi-VN"
                    )}{" "}
                    {new Date(dossierResult.updatedAt).toLocaleTimeString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              )}
              {!isSearchingDossier && !dossierResult && !searchError && (
                <p className="text-gray-500 text-center text-sm">
                  Vui lòng nhập thông tin để tra cứu hồ sơ.
                </p>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        /* Removed custom keyframes for now, relying more on Tailwind defaults and simpler transitions */
        /* If specific animations are desired, they can be re-added with subtle designs */
      `}</style>
    </>
  );
}