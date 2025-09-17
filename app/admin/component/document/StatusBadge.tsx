import React from 'react';
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { InspectionReport } from "../../types/inspection"; // Adjust path as needed

interface StatusBadgeProps {
  status: InspectionReport['status'];
  size?: 'sm' | 'md';
}

const getStatusColor = (status: InspectionReport['status']) => {
  switch (status) {
    case "obtained":
      return "bg-green-100 text-green-800 ring-green-600/20";
    case "pending":
      return "bg-yellow-100 text-yellow-800 ring-yellow-600/20";
    case "not_obtained":
      return "bg-red-100 text-red-800 ring-red-600/20";
    case "not_within_scope":
      return "bg-gray-100 text-gray-800 ring-gray-600/20";
    default:
      return "bg-gray-100 text-gray-800 ring-gray-600/20";
  }
};
const getStatusText = (status: InspectionReport['status']) => {
  switch (status) {
    case "obtained":
      return "Đạt";
    case "pending":
      return "Đang xử lý";
    case "not_obtained":
      return "Không đạt";
    case "not_within_scope":
      return "Không thuộc phạm vi";
    default:
      return "Không xác định";
  }
};

const getStatusIcon = (status: InspectionReport['status'], iconSize: number) => {
  switch (status) {
    case "pending":
      return <Clock size={iconSize} />;
    case "not_within_scope":
      return <AlertCircle size={iconSize} />;
    case "not_obtained":
      return <AlertCircle size={iconSize} />;
    case "obtained":
      return <CheckCircle size={iconSize} />;
    default:
      return <Clock size={iconSize} />;
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const iconSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <span
      className={`inline-flex items-center space-x-1 ${padding} rounded-full ${textSize} font-semibold ring-1 ring-inset ${getStatusColor(
        status
      )}`}
    >
      {getStatusIcon(status, iconSize)}
      <span>{getStatusText(status)}</span>
    </span>
  );
};

export default StatusBadge;