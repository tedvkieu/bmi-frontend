import React from 'react';
import { CheckCircle, Clock, AlertCircle, MinusCircle } from "lucide-react"; // Giữ nguyên AlertCircle cho "Chưa hoàn thành"
import { InspectionReport } from "../../types/inspection";

interface StatusBadgeProps {
  status: InspectionReport['status'];
  size?: 'sm' | 'md';
}

const getStatusStyle = (status: InspectionReport['status']) => {
  switch (status) {
    case "obtained":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "not_obtained":
      return "bg-red-100 text-red-700"; // Thay đổi màu cho "Chưa hoàn thành" để dễ phân biệt
    case "not_within_scope":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getStatusLabel = (status: InspectionReport['status']) => {
  switch (status) {
    case "obtained":
      return "Hoàn thành"; // Đầy đủ hơn "Đạt"
    case "pending":
      return "Đang xử lý"; // Đầy đủ hơn "Chờ"
    case "not_obtained":
      return "Chưa hoàn thành"; // Rõ ràng hơn "Không"
    case "not_within_scope":
      return "Ngoài phạm vi"; // Rõ ràng hơn "Ngoài"
    default:
      return "Không xác định"; // Tránh "N/A"
  }
};

const getStatusIcon = (status: InspectionReport['status'], iconSize: number) => {
  switch (status) {
    case "obtained":
      return <CheckCircle size={iconSize} />;
    case "pending":
      return <Clock size={iconSize} />;
    case "not_obtained":
      return <AlertCircle size={iconSize} />; // Giữ nguyên icon cảnh báo, rất phù hợp
    case "not_within_scope":
      return <MinusCircle size={iconSize} />;
    default:
      return <Clock size={iconSize} />; // Mặc định cho trường hợp không xác định
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 12 : 14;
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <span
      className={`inline-flex items-center space-x-1 ${padding} rounded-full font-semibold  ${textSize} ${getStatusStyle(status)}`}
    >
      {getStatusIcon(status, iconSize)}
      <span>{getStatusLabel(status)}</span>
    </span>
  );
};

export default StatusBadge;