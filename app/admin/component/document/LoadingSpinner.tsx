import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
    <p className="ml-5 text-sm font-medium text-gray-700">Đang tải tài liệu...</p>
  </div>
);

export default LoadingSpinner;