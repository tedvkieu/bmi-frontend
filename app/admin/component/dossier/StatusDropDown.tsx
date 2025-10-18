'use client';

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  MinusCircle,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { InspectionReport } from "../../types/inspection";
import { StatusUpdateResponse } from "../../services/dossierApi";

interface StatusDropdownProps {
  currentStatus: InspectionReport["status"];
  receiptId: string;
  onStatusChange: (
    id: string,
    newStatus: InspectionReport["status"]
  ) => Promise<StatusUpdateResponse>;
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const currentConfig = statusConfig[currentStatus];
  const CurrentIcon = currentConfig.icon;

  useEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const handleStatusClick = async (newStatus: InspectionReport["status"]) => {
    if (newStatus === currentStatus || disabled || isUpdating) return;

    setIsUpdating(true);
    setIsOpen(false);

    try {
      const result = await onStatusChange(receiptId, newStatus);

      if (!result?.success) {
        toast.error(
          result?.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.",
          {
            duration: 4000,
          }
        );
        return;
      }

      toast.success(
        `Đã cập nhật trạng thái thành "${statusConfig[newStatus].label}"`,
        {
          duration: 3000,
          icon: "✅",
        }
      );
    } catch (error) {
      console.error("Error updating status:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái. Vui lòng thử lại.";
      toast.error(message, {
        duration: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
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

      {isOpen &&
        !disabled &&
        !isUpdating &&
        menuPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[1090]"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="fixed z-[1100] mt-0 w-56 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                minWidth: Math.max(menuPosition.width, 200),
              }}
            >
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
          </>,
          document.body
        )}
    </div>
  );
};

export default StatusDropdown;
