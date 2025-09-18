import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#293144] text-white py-8 shadow-inner mt-12">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold mb-3">
          CÔNG TY CỔ PHẦN DỊCH VỤ VÀ GIÁM ĐỊNH BẢO MINH
        </h3>
        <p className="text-gray-400 text-md mb-6">Chuyên nghiệp - Uy tín - Chất lượng</p>

        <div className="flex flex-col md:flex-row justify-around items-start md:items-center space-y-8 md:space-y-0 md:space-x-8 text-md my-8">
          {/* Contact Info */}
          <div className="flex flex-col space-y-3">
            <a
              href="tel:0911768008"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center md:justify-start font-medium"
            >
              <FaPhoneAlt className="mr-2" /> <span>0911.76.80.08</span>
            </a>
            <a
              href="mailto:info@baominhinspection.com"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center md:justify-start font-medium"
            >
              <FaEnvelope className="mr-2" /> <span>info@baominhinspection.com</span>
            </a>
          </div>

          {/* Working Hours - Updated background and text colors */}
          <div className="bg-[#36415a] rounded-xl p-6 w-full max-w-sm md:max-w-none md:w-auto mx-auto md:mx-0 text-white"> {/* Added bg and text-white */}
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-blue-600"> {/* Changed text-gray-800 to text-white */}
              GIỜ LÀM VIỆC
            </h2>
            <div className="space-y-3 text-base">
              <div className="flex justify-between items-center pb-1 border-b border-gray-600"> {/* Changed border-gray-100 to border-gray-600 */}
                <div className="flex items-center space-x-2 text-gray-200"> {/* Changed text-gray-700 to text-gray-200 */}
                  <FaClock className="text-blue-400" /> {/* Slightly adjusted blue for icons */}
                  <span>Thứ 2 - Thứ 6:</span>
                </div>
                <span className="font-semibold text-white">8:00 - 17:30</span> {/* Changed text-gray-800 to text-white */}
              </div>
              <div className="flex justify-between items-center pb-1 border-b border-gray-600"> {/* Changed border-gray-100 to border-gray-600 */}
                <div className="flex items-center space-x-2 text-gray-200"> {/* Changed text-gray-700 to text-gray-200 */}
                  <FaClock className="text-blue-400" />
                  <span>Thứ 7:</span>
                </div>
                <span className="font-semibold text-white">8:00 - 12:00</span> {/* Changed text-gray-800 to text-white */}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-gray-200"> {/* Changed text-gray-700 to text-gray-200 */}
                  <FaClock className="text-blue-400" />
                  <span>Chủ nhật:</span>
                </div>
                <span className="font-semibold text-red-400">Nghỉ</span> {/* Slightly adjusted red for better contrast on dark */}
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-8">&copy; {new Date().getFullYear()} Bảo Minh Inspection. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;