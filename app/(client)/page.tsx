// app/contact/page.tsx (or wherever your ContactPage component is)
"use client";
import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import toast from "react-hot-toast";
import { createCustomer, CustomerRequest } from "./service/customerService";
import NavbarClient from "./components/NavbarClient";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaClock, FaCheckCircle, FaExclamationCircle, FaCalendarAlt } from 'react-icons/fa'; // Import icons, added FaCalendarAlt
import BannerClient from "./components/BannerClient";
import Sticky from "./components/Sticky";
import Footer from "./components/Footer";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // State for the new customer lookup form
  const [lookupFormData, setLookupFormData] = useState({
    certificateNumber: "",
    issueDate: "",
    companyName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const contactInfoRef = useRef<HTMLDivElement>(null);
  const contactFormRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const workingHoursRef = useRef<HTMLDivElement>(null); // This ref is not used in the provided code, but kept if it's for future use.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handler for the new lookup form
  const handleLookupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLookupFormData({
      ...lookupFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle"); // Reset status on new submission
    setErrorMessage("");

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
      toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setSubmitStatus("success");
      console.log("Customer created successfully!");

      setFormData({ // Clear form after successful submission
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      console.error("Submission error:", error);
      toast.error('Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại.');
      setSubmitStatus("error");
      setErrorMessage("Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for the new lookup form submission
  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Lookup form submitted:", lookupFormData);
    toast.success('Đang tra cứu thông tin khách hàng...');
    setTimeout(() => {
      toast('Kết quả tra cứu sẽ hiển thị tại đây.', { icon: '🔍' });
      setLookupFormData({
        certificateNumber: "",
        issueDate: "",
        companyName: "",
      });
    }, 1500);
  };


  // Function to scroll to the contact form
  const handleScrollToContact = (section: string) => {
    switch (section) {
      case 'form':
        contactFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      case 'info':
        contactInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      case 'search':
        searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      default:
        break;
    }
  };

  return (
    <>
      <NavbarClient onScrollToContact={handleScrollToContact} />
      <div className="fixed left-4 bottom-6 flex flex-col space-y-3 z-50 w-64">
        {/* Bubble text */}
        <div className="bg-[#193cb8] text-white text-xl font-medium px-4 py-2 rounded-lg shadow-lg relative mb-2 animate-bounce">
          Bạn muốn upload file thông qua trang web hãy liên hệ qua Zalo hoặc SĐT
          <div className="absolute left-6 -bottom-2 w-3 h-3 bg-white rotate-45 shadow-md"></div>
        </div>

        {/* Hotline */}
        <a
          href="tel:0911768008"
          className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
          aria-label="Hotline Bảo Minh"
        >
          <FaPhoneAlt className="text-lg mr-2" />
          <span className="font-semibold">0911.76.80.08</span>
        </a>

        {/* Zalo */}
        <a
          href="https://zalo.me/0911768008"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
          aria-label="Zalo Bảo Minh"
        >
          <Image
            src="/images/zalo-icon.jpg"
            alt="Zalo"
            width={22}
            height={22}
            className="mr-2 rounded-full"
          />
          <span className="font-semibold">Nhắn tin Zalo</span>
        </a>
      </div>

      <div className="min-h-screen bg-gray-100 pb-12">
        <header className="bg-blue-800 text-white py-8 shadow-md">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold mb-2">LIÊN HỆ VỚI CHÚNG TÔI</h1>
            <p className="text-blue-200 text-sm font-light">
              Chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn.
            </p>
          </div>
        </header>
        <BannerClient />

        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
            <div ref={contactInfoRef} className="bg-white rounded-xl shadow-lg p-8 h-fit animate-fade-in-up">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                THÔNG TIN LIÊN HỆ
              </h2>
              <div className="space-y-6 text-base h-[580px]">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-full flex-shrink-0 shadow-sm">
                    <FaBuilding className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">TRỤ SỞ CHÍNH</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Số 85, Đường Hoàng Sa, Phường Tân Định, Quận 1
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Thành phố Hồ Chí Minh, Việt Nam
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Mã số thuế: 0315.978.642</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-50 text-green-600 p-3 rounded-full flex-shrink-0 shadow-sm">
                    <FaMapMarkerAlt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">VĂN PHÒNG GIAO DỊCH</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-gray-700">Tại Hồ Chí Minh:</p>
                        <p className="text-gray-600 leading-relaxed">
                          Số 13, đường số 3, Phường An Khánh, TP. Thủ Đức
                        </p>
                        <p className="text-gray-600 leading-relaxed">Thành phố Hồ Chí Minh</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Tại Hải Phòng:</p>
                        <p className="text-gray-600 leading-relaxed">
                          Số 31A, đường Bùi Thị Tự Nhiên
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          Phường Đông Hải 1, Quận Hải An, TP Hải Phòng
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-full flex-shrink-0 shadow-sm">
                    <FaPhoneAlt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">HOTLINE</h3>
                    <a href="tel:0911768008" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      0911.76.80.08
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-red-50 text-red-600 p-3 rounded-full flex-shrink-0 shadow-sm">
                    <FaEnvelope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">EMAIL</h3>
                    <a href="mailto:info@baominhinspection.com" className="text-blue-600 hover:text-blue-800 transition-colors text-base">
                      info@baominhinspection.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột 2: GỬI LIÊN HỆ FORM + GIỜ LÀM VIỆC/BẢN ĐỒ (xếp chồng lên nhau) */}
            <div className="space-y-8">
              <div ref={contactFormRef} className="bg-white rounded-xl shadow-lg p-8 h-fit animate-fade-in-up delay-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                  GỬI LIÊN HỆ
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6 h-[580px]" >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full text-gray-700 text-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full text-gray-700 text-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        placeholder="0912 345 678"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full text-gray-700 text-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      placeholder="nguyenvana@gmail.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Chủ đề
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full text-gray-700 text-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm bg-white"
                    >
                      <option value="">Chọn dịch vụ</option>
                      <option value="consultation">Tư vấn dịch vụ</option>
                      <option value="inspection">Yêu cầu giám định</option>
                      <option value="cooperation">Hợp tác kinh doanh</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full text-gray-700 text-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-y shadow-sm"
                      placeholder="Nhập nội dung..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi liên hệ'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* New Customer Lookup Section */}
          <div ref={searchRef} className="mt-12 bg-white rounded-xl shadow-lg p-8 animate-fade-in-up delay-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
              TRA CỨU THÔNG TIN KHÁCH HÀNG
            </h2>
            <form onSubmit={handleLookupSubmit} className="space-y-6">
              <div>
                <label htmlFor="certificateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Số chứng nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="certificateNumber"
                  name="certificateNumber"
                  required
                  value={lookupFormData.certificateNumber}
                  onChange={handleLookupChange}
                  className="w-full text-gray-700 text-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder=""
                />
              </div>
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày cấp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date" // Changed to type="date" for native date picker
                    id="issueDate"
                    name="issueDate"
                    required
                    value={lookupFormData.issueDate}
                    onChange={handleLookupChange}
                    className="w-full text-gray-700 text-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm pr-10" // Added pr-10 for icon
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Công ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  value={lookupFormData.companyName}
                  onChange={handleLookupChange}
                  className="w-full text-gray-700 text-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder=""
                />
              </div>
              <button
                type="submit"
                className="w-52 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-base shadow-md hover:shadow-lg"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
          {/* End New Customer Lookup Section */}

        </div>

        {/* Footer */}
        <Footer />
      </div>

      <style jsx>{`
        /* Custom Keyframes for Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fade-in-up.delay-100 {
          animation-delay: 0.1s;
        }
        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
        }

        .animate-bounce-slow {
            animation: bounceSlow 2s infinite ease-in-out;
        }
      `}</style>
    </>
  );
}