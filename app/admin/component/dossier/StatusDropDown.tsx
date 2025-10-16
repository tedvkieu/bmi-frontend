import React, { useState, useRef, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  MinusCircle,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { InspectionReport } from "../../types/inspection";

interface StatusDropdownProps {
  currentStatus: InspectionReport["status"];
  receiptId: string;
  onStatusChange: (
    id: string,
    newStatus: InspectionReport["status"]
  ) => Promise<void>;
  disabled?: boolean;
}

const statusConfig = {
  obtained: {
    label: "Hoàn thành",
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    icon: CheckCircle,
    hoverBg: "hover:bg-green-50",
  },
  pending: {
    label: "Đang xử lý",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    icon: Clock,
    hoverBg: "hover:bg-yellow-50",
  },
  not_obtained: {
    label: "Chưa hoàn thành",
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    icon: AlertCircle,
    hoverBg: "hover:bg-red-50",
  },
  not_within_scope: {
    label: "Ngoài phạm vi",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    icon: MinusCircle,
    hoverBg: "hover:bg-gray-50",
  },
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  receiptId,
  onStatusChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = statusConfig[currentStatus];
  const CurrentIcon = currentConfig.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusClick = async (newStatus: InspectionReport["status"]) => {
    if (newStatus === currentStatus || disabled || isUpdating) return;

    setIsUpdating(true);
    setIsOpen(false);

    try {
      await onStatusChange(receiptId, newStatus);
      toast.success(
        `Đã cập nhật trạng thái thành "${statusConfig[newStatus].label}"`,
        {
          duration: 3000,
          icon: "✅",
        }
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.", {
        duration: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => !disabled && !isUpdating && setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        className={`
          inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
          border transition-all duration-200 min-w-[150px]
          ${currentConfig.bgColor} ${currentConfig.color} ${
          currentConfig.borderColor
        }
          ${
            disabled || isUpdating
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:shadow-md hover:scale-105"
          }
        `}
      >
        <div className="flex items-center gap-1.5">
          {isUpdating ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <CurrentIcon size={14} />
          )}
          <span>{currentConfig.label}</span>
        </div>
        {!disabled && !isUpdating && (
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && !disabled && !isUpdating && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
            <div className="py-1">
              {(
                Object.keys(statusConfig) as Array<keyof typeof statusConfig>
              ).map((status) => {
                const config = statusConfig[status];
                const Icon = config.icon;
                const isActive = status === currentStatus;

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusClick(status)}
                    disabled={isActive}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150
                      ${
                        isActive
                          ? `${config.bgColor} ${config.color} cursor-default font-medium`
                          : `text-gray-700 ${config.hoverBg} hover:pl-5`
                      }
                    `}
                  >
                    <Icon
                      size={16}
                      className={isActive ? config.color : "text-gray-400"}
                    />
                    <span className="flex-1 text-left">{config.label}</span>
                    {isActive && (
                      <CheckCircle size={14} className={config.color} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusDropdown;
