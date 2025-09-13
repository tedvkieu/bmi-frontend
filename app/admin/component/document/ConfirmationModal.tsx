// components/ConfirmationModal.tsx
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center "> {/* Nền overlay tối hơn một chút */}
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 opacity-100"> {/* Bo tròn hơn, đổ bóng mạnh hơn */}
        
        {/* Icon thùng rác */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">{title}</h3> {/* Tiêu đề đậm và lớn hơn */}
        <p className="text-sm text-gray-600 text-center mb-6">{message}</p> {/* Thông báo tinh tế hơn */}
        
        <hr className="border-gray-200 mb-6" /> {/* Đường phân cách mỏng */}

        <div className="flex justify-center space-x-4"> {/* Căn giữa các nút */}
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg shadow-red-500/50" // Thêm đổ bóng cho nút xác nhận
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;