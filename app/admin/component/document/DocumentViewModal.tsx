"use client";
// components/admin/document/DocumentViewModal.tsx
import React, { useEffect, useState } from "react";
import { InspectionReportApi } from "../../types/inspection";
import { IoCloseCircle } from "react-icons/io5";
// Keeping Icon params in helpers but not rendering actual icons to avoid SSR issues

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: InspectionReportApi | null;
}

const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  // Hooks must be called unconditionally at the top
  const [assignedNames, setAssignedNames] = useState<string[] | null>(null);
  const [assignedLoading, setAssignedLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!document?.receiptId) return;
    let ignore = false;
    (async () => {
      try {
        setAssignedLoading(true);
        const res = await fetch(`/api/evaluations/teams/by-dossier/${document.receiptId}`);
        if (!res.ok) throw new Error("Failed to load team members");
        const data = await res.json();
        if (!ignore) {
          const names: string[] = Array.isArray(data) ? data.map((m: any) => m.fullName).filter(Boolean) : [];
          setAssignedNames(names);
        }
      } catch {
        if (!ignore) setAssignedNames([]);
      } finally {
        if (!ignore) setAssignedLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [document?.receiptId]);

  // Safe to return early after hooks are declared
  if (!isOpen || !document) {
    return null;
  }

  const renderDetailItem = (
    label: string,
    value: string | number | boolean | undefined | null,
    tooltip: string,
    Icon?: React.ElementType // optional icon, not rendered to avoid SSR issues
  ) => {
    console.log("Icon: ", Icon);
    let displayValue: string;
    if (typeof value === "boolean") {
      displayValue = value ? "Đã rời cảng" : "Chưa rời cảng";
    } else if (value === null || value === undefined || value === "") {
      displayValue = "EMPTY";
    } else {
      displayValue = String(value);
    }

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0 group">
        <div className="flex items-center space-x-2">
          {/* <Icon size={18} className="text-blue-500 group-hover:text-blue-700 transition-colors" /> */}
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500 hidden md:inline group-hover:block transition-all duration-300">
            ({tooltip})
          </span>
        </div>
        <span className="text-gray-800 font-semibold text-right">
          {displayValue}
        </span>
      </div>
    );
  };

  const renderDateItem = (
    label: string,
    dateString: string | undefined | null,
    tooltip: string,
    Icon?: React.ElementType
  ) => {
    console.log("Icon: ", Icon);
    const date = dateString ? new Date(dateString) : null;
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0 group">
        <div className="flex items-center space-x-2">
          {/* <Icon size={18} className="text-blue-500 group-hover:text-blue-700 transition-colors" /> */}
          <span className="font-medium text-gray-700">{label}:</span>
          <span className="ml-1 text-sm text-gray-500 hidden md:inline group-hover:block transition-all duration-300">
            ({tooltip})
          </span>
        </div>
        <span className="text-gray-800 font-semibold text-right">
          {date && !isNaN(date.getTime())
            ? date.toLocaleDateString("vi-VN")
            : "N/A"}
        </span>
      </div>
    );
  };

  const renderDateTimeItem = (
    label: string,
    dateString: string | undefined | null,
    tooltip: string,
    Icon?: React.ElementType
  ) => {
    console.log("iocn: ", Icon);
    const date = dateString ? new Date(dateString) : null;
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0 group">
        <div className="flex items-center space-x-2">
          {/* <Icon size={18} className="text-blue-500 group-hover:text-blue-700 transition-colors" /> */}
          <span className="font-medium text-gray-700">{label}:</span>
          <span className="ml-1 text-sm text-gray-500 hidden md:inline group-hover:block transition-all duration-300">
            ({tooltip})
          </span>
        </div>
        <span className="text-gray-800 font-semibold text-right">
          {date && !isNaN(date.getTime())
            ? date.toLocaleString("vi-VN")
            : "N/A"}
        </span>
      </div>
    );
  };

  const getStatusDisplay = (status: string | undefined | null) => {
    switch (status) {
      case "OBTAINED":
        return {
          text: "Đạt",
          color: "text-green-600",
          tooltip: "Biên lai đạt",
        };
      case "PENDING":
        return {
          text: "Đang xử lý",
          color: "text-yellow-600",
          tooltip: "Biên lai đang trong quá trình xử lý",
        };
      case "NOT_OBTAINED":
        return {
          text: "Không đạt",
          color: "text-red-600",
          tooltip: "Biên lai không đạt",
        };
      case "NOT_WITHIN_SCOPE":
        return {
          text: "Không thuộc phạm vi",
          color: "text-gray-600",
          tooltip: "Biên lai không thuộc phạm vi",
        };
      default:
        return {
          text: "Không xác định",
          color: "text-gray-600",
          tooltip: "Trạng thái không rõ ràng",
        };
    }
  };

  const certificateStatus = getStatusDisplay(document.certificateStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col transform scale-95 animate-scale-in border border-gray-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-200  text-black rounded-t-xl">
          <h2 className="text-base flex items-center gap-3">
            {/* <ClipboardList size={30} /> */}
            
            <span className="font-bold"> HỒ SƠ {document.registrationNo}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
            title="Đóng"
          >
            <IoCloseCircle size={30} color="black"/>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-7 space-y-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            {renderDetailItem(
              "Mã hồ sơ",
              document.receiptId,
              "Receipt ID"
            )}
            {renderDetailItem(
              "Số đăng ký",
              document.registrationNo,
              "Số đăng ký của tài liệu hoặc phương tiện"
            )}
            {renderDetailItem(
              "Khách hàng yêu cầu giám định",
              document.customerSubmitName || document.customerSubmitId,
              "Customer Submit"
            )}
            {renderDetailItem(
              "Khách hàng nhập khẩu",
              document.customerRelatedName || document.customerRelatedId,
              "Customer Related"
            )}
            {renderDetailItem(
              "Loại hình giám định",
              document.inspectionTypeName || document.inspectionTypeId,
              "Inspection Type"
            )}
            {renderDetailItem(
              "Số tờ khai",
              document.declarationNo,
              "Declaration No"
            )}
            {renderDetailItem(
              "Số vận đơn",
              document.billOfLading,
              "Bill Of Lading"
            )}
            {renderDetailItem("Tên tàu", document.shipName, "Ship Name")}
            {renderDetailItem(
              "Số lượng Container 20 Feets",
              document.cout10,
              "Container 20 Feets"
            )}
            {renderDetailItem(
              "Số lượng Container 40 Feets",
              document.cout20,
              "Container 40 Feets"
            )}
            {/* {renderDetailItem(
              "Trạng thái rời cảng",
              document.bulkShip,
              "Bulk Ship",
              Ship
            )} */}
            {renderDetailItem(
              "Tài liệu khai báo",
              document.declarationDoc,
              "Declaration Doc"
            )}
            {renderDetailItem(
              "Nơi khai báo",
              document.declarationPlace,
              "Declaration Place"
            )}
            {renderDateItem(
              "Ngày kiểm tra",
              document.inspectionDate,
              "Inspection Date"
            )}
            {renderDateItem(
              "Ngày cấp chứng chỉ",
              document.certificateDate,
              "Certificate Date"
            )}
            {renderDetailItem(
              "Địa điểm kiểm tra",
              document.inspectionLocation,
              "Inspection Location"
            )}
            <div className="col-span-full md:col-span-1">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0 group">
                <div className="flex items-center space-x-2">
                  {/* <CheckCircle size={18} className={`${certificateStatus.color} group-hover:brightness-110 transition-colors`} /> */}
                  <span className="font-medium text-gray-700">
                    Trạng thái chứng chỉ:
                  </span>
                  <span className="ml-1 text-sm text-gray-500 hidden md:inline group-hover:block transition-all duration-300">
                    ({certificateStatus.tooltip})
                  </span>
                </div>
                <span className={`font-bold ${certificateStatus.color}`}>
                  {certificateStatus.text}
                </span>
              </div>
            </div>
            {renderDateTimeItem(
              "Ngày tạo hồ sơ",
              document.createdAt,
              "Created At"
            )}
            {renderDetailItem(
              "Người tạo hồ sơ",
              document.createdByUserName || document.createdByUserId,
              "Created By"
            )}
            <div className="col-span-full">
              <div className="py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">Nhân viên được phân công</span>
              </div>
              <div className="mt-2 text-gray-800">
                {assignedLoading ? (
                  <span className="text-sm text-gray-500">Đang tải...</span>
                ) : assignedNames && assignedNames.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {assignedNames.map((name, idx) => (
                      <li key={idx} className="py-0.5">{name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-gray-600">Chưa phân công nhân viên</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* <div className="p-5 border-t border-gray-200 bg-gray-100 flex justify-end">
          <button
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold shadow-md hover:shadow-lg"
            onClick={onClose}
          >
            Đóng
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default DocumentViewModal;
