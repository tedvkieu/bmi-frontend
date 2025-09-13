import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="text-center py-10 px-6 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-md">
    <p className="font-bold text-xl mb-3">Đã xảy ra lỗi khi tải dữ liệu!</p>
    <p className="text-base mb-2">{message}</p>
    <p className="text-sm text-red-600 mt-3">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
  </div>
);

export default ErrorMessage;