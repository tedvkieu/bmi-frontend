import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaClock, FaMapMarkerAlt } from 'react-icons/fa'; // Added FaMapMarkerAlt

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#1a202c] to-[#2d3748] text-gray-200 py-12 shadow-2xl mt-16 relative overflow-hidden">
      {/* Background Shapes for modern feel */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-700 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-700 opacity-10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Company Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">
              BẢO MINH INSPECTION
            </h3>
            <p className="text-blue-400 text-lg mb-6 font-semibold italic">Chuyên nghiệp - Uy tín - Chất lượng</p>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              CÔNG TY CỔ PHẦN DỊCH VỤ VÀ GIÁM ĐỊNH BẢO MINH tự hào là đối tác tin cậy, mang đến các giải pháp giám định toàn diện và hiệu quả.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-5 pb-3 border-b-2 border-blue-600">
              LIÊN HỆ
            </h2>
            <div className="space-y-4 text-md">
              <a
                href="tel:0911768008"
                className="text-gray-300 hover:text-blue-400 transition-colors flex items-center justify-center md:justify-start font-medium group"
              >
                <FaPhoneAlt className="mr-3 text-blue-500 group-hover:scale-110 transition-transform" />{' '}
                <span>0911.76.80.08</span>
              </a>
              <a
                href="mailto:info@baominhinspection.com"
                className="text-gray-300 hover:text-blue-400 transition-colors flex items-center justify-center md:justify-start font-medium group"
              >
                <FaEnvelope className="mr-3 text-blue-500 group-hover:scale-110 transition-transform" />{' '}
                <span>info@baominhinspection.com</span>
              </a>
              <p className="text-gray-300 flex items-start justify-center md:justify-start font-medium pt-2">
                <FaMapMarkerAlt className="mr-3 text-blue-500 mt-1 flex-shrink-0" />{' '}
                <span>
                  Tầng 4, Tòa nhà Indochina Riverside Tower, 74 Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Bảo Minh Inspection. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;