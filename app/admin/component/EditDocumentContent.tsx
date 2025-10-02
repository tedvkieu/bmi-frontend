"use client";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import LoadingSpinner from "@/app/admin/component/document/LoadingSpinner";
import ErrorMessage from "@/app/admin/component/document/ErrorMessage";
import { InspectionReportApi } from "@/app/admin/types/inspection";
import {
  FileText,
  User,
  Truck,
  Ship,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  Tag,
  Hash,
  Container,
} from "lucide-react"; // Import các icon mới

const EditDocumentContent: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Lấy ID từ URL
  const [document, setDocument] = useState<InspectionReportApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDocument = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/dossiers/${id}`);
      setDocument(response.data);
    } catch (e: any) {
      console.error("Failed to fetch document for editing:", e);
      setError("Không thể tải dữ liệu tài liệu để chỉnh sửa.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setDocument((prevDoc) => {
      if (!prevDoc) return null;

      let parsedValue: string | number | boolean = value;
      if (name === "cout10" || name === "cout20") {
        parsedValue = parseInt(value, 10) || 0;
      } else if (name === "bulkShip") {
        parsedValue = value === "true";
      }

      return { ...prevDoc, [name]: parsedValue };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setIsSaving(true);
    setError(null);
    try {
      await axios.put(`/api/dossiers/${id}`, document);
      toast.success("Cập nhật tài liệu thành công!");
      router.push("/admin/hoso"); // Quay về trang danh sách sau khi cập nhật
    } catch (e: any) {
      console.error("Failed to update document:", e);
      setError("Không thể cập nhật tài liệu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Reusable render functions from DocumentViewModal ---
  // Adjusted to map to actual document properties more reliably
  const getFieldName = (label: string): keyof InspectionReportApi => {
    switch (label) {
      case "Mã hồ sơ":
        return "receiptId";
      case "Số đăng ký":
        return "registrationNo";
      case "Khách hàng yêu cầu giám định":
        return "customerSubmitId";
      case "Khách hàng nhập khẩu":
        return "customerRelatedId";
      case "Loại hình giám định":
        return "inspectionTypeId";
      case "Số tờ khai":
        return "declarationNo";
      case "Số vận đơn":
        return "billOfLading"; // Fixed: Added return
      case "Tên tàu":
        return "shipName";
      case "Số lượng Container 20 Feets":
        return "cout20";
      case "Số lượng Container 40 Feets":
        return "cout10"; // Assuming cout10 is for 40 feets
      case "Trạng thái rời cảng":
        return "bulkShip";
      case "Tài liệu khai báo":
        return "declarationDoc";
      case "Nơi khai báo":
        return "declarationPlace";
      case "Ngày kiểm tra":
        return "inspectionDate";
      case "Ngày cấp chứng chỉ":
        return "certificateDate";
      case "Địa điểm kiểm tra":
        return "inspectionLocation";
      case "Trạng thái chứng chỉ":
        return "certificateStatus";
      case "Ngày tạo hồ sơ":
        return "createdAt";
      default:
        return "receiptId"; // Fallback, adjust as needed
    }
  };

  const renderDetailItem = (
    label: string,
    value: string | number | boolean | undefined | null,
    tooltip: string,
    Icon: React.ElementType,
    isEditable: boolean = true
  ) => {
    const fieldName = getFieldName(label);

    const inputField = () => {
      if (!document) return null;
      let inputType = "text";
      let inputValue: string | number | boolean = value || "";

      if (label.includes("Số lượng Container")) {
        inputType = "number";
        inputValue = (value as number) || 0;
      } else if (label === "Trạng thái rời cảng") {
        return (
          <select
            id={fieldName}
            name={fieldName}
            value={document.bulkShip ? "true" : "false"}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!isEditable}
          >
            <option value="false">Chưa rời</option>
            <option value="true">Đã rời</option>
          </select>
        );
      } else if (label === "Trạng thái chứng chỉ") {
        return (
          <select
            id={fieldName}
            name={fieldName}
            value={document.certificateStatus || ""}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!isEditable}
          >
            <option value="OBTAINED">Đạt</option>
            <option value="NOT_OBTAINED">Không đạt</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="NOT_WITHIN_SCOPE">Không thuộc phạm vi</option>
          </select>
        );
      }

      return (
        <input
          type={inputType}
          id={fieldName}
          name={fieldName}
          value={inputValue as string}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          readOnly={!isEditable} // Đây là phần đã được chỉnh sửa
        />
      );
    };

    return (
      <div className="col-span-1">
        <label
          htmlFor={fieldName}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          <div className="flex items-center space-x-2">
            <Icon size={16} className="text-gray-500" />{" "}
            {/* Smaller, more neutral icon color */}
            <span>{label}</span>
            <span className="text-gray-500 text-sm hidden md:inline group-hover:block transition-all duration-300">
              ({tooltip})
            </span>
          </div>
        </label>
        {inputField()}
      </div>
    );
  };

  const renderDateItem = (
    label: string,
    dateString: string | undefined | null,
    tooltip: string,
    Icon: React.ElementType,
    isEditable: boolean = true
  ) => {
    const fieldName = getFieldName(label);
    const dateValue = dateString ?? "";
    return (
      <div className="col-span-1">
        <label
          htmlFor={fieldName}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          <div className="flex items-center space-x-2">
            <Icon size={16} className="text-gray-500" />
            <span>{label}</span>
            <span className="text-gray-500 text-xs hidden md:inline group-hover:block transition-all duration-300">
              ({tooltip})
            </span>
          </div>
        </label>
        <input
          type="date"
          id={fieldName}
          name={fieldName}
          value={dateValue}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          readOnly={!isEditable}
        />
      </div>
    );
  };

  const renderDateTimeItem = (
    label: string,
    dateString: string | undefined | null,
    tooltip: string,
    Icon: React.ElementType,
    isEditable: boolean = true
  ) => {
    const fieldName = getFieldName(label);
    const dateTimeValue = dateString
      ? new Date(dateString).toISOString().slice(0, 16)
      : ""; // For datetime-local input
    return (
      <div className="col-span-1">
        <label
          htmlFor={fieldName}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          <div className="flex items-center space-x-2">
            <Icon size={16} className="text-gray-500" />
            <span>{label}</span>
            <span className="text-gray-500 text-xs hidden md:inline group-hover:block transition-all duration-300">
              ({tooltip})
            </span>
          </div>
        </label>
        <input
          type="datetime-local"
          id={fieldName}
          name={fieldName}
          value={dateTimeValue}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          readOnly={!isEditable}
        />
      </div>
    );
  };
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!document) {
    return (
      <div className="container mx-auto p-6 bg-white shadow-md rounded-lg mt-8 text-center text-red-600">
        Không tìm thấy tài liệu để chỉnh sửa.
      </div>
    );
  }

  return (
    <div className="container mx-auto  text-gray-800">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-7xl mx-auto flex flex-col border border-gray-200">
        {" "}
        {/* Softer shadow */}
        {/* Header - Simplified */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            Chỉnh sửa hồ sơ giám định mã số
            <span className="font-bold text-blue-700">
              {document.registrationNo || document.billOfLading || id}
            </span>{" "}
            {/* Keep identifier highlighted */}
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex-grow overflow-y-auto p-7 space-y-6 bg-white"
        >
          {" "}
          {/* White background for content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-5">
            {" "}
            {/* Slightly reduced gaps */}
            {/* Dynamically render editable fields */}
            {renderDetailItem(
              "Mã hồ sơ",
              document.receiptId,
              "Receipt ID",
              Tag,
              false
            )}{" "}
            {/* Đã sửa thành readonly */}
            {renderDetailItem(
              "Số đăng ký",
              document.registrationNo,
              "Số đăng ký của tài liệu hoặc phương tiện",
              Hash,
              false
            )}{" "}
            {/* Đã sửa thành readonly */}
            {renderDetailItem(
              "Khách hàng yêu cầu giám định",
              document.customerSubmitId,
              "Customer Submit",
              User
            )}
            {renderDetailItem(
              "Khách hàng nhập khẩu",
              document.customerRelatedId,
              "Customer Related",
              User
            )}
            {renderDetailItem(
              "Loại hình giám định",
              document.inspectionTypeId,
              "Inspection Type",
              FileText
            )}
            {renderDetailItem(
              "Số tờ khai",
              document.declarationNo,
              "Declaration No",
              FileText
            )}
            {renderDetailItem(
              "Số vận đơn",
              document.billOfLading,
              "Bill Of Lading",
              Truck
            )}
            {renderDetailItem("Tên tàu", document.shipName, "Ship Name", Ship)}
            {renderDetailItem(
              "Số lượng Container 20 Feets",
              document.cout10,
              "Container 20 Feets",
              Container
            )}
            {renderDetailItem(
              "Số lượng Container 40 Feets",
              document.cout20,
              "Container 40 Feets",
              Container
            )}
            {renderDetailItem(
              "Trạng thái rời cảng",
              document.bulkShip,
              "Bulk Ship",
              Ship
            )}
            {renderDetailItem(
              "Tài liệu khai báo",
              document.declarationDoc,
              "Declaration Doc",
              FileText
            )}
            {renderDetailItem(
              "Nơi khai báo",
              document.declarationPlace,
              "Declaration Place",
              MapPin
            )}
            {renderDateItem(
              "Ngày kiểm tra",
              document.inspectionDate,
              "Inspection Date",
              Calendar
            )}
            {renderDateItem(
              "Ngày cấp chứng chỉ",
              document.certificateDate,
              "Certificate Date",
              Calendar
            )}
            {renderDetailItem(
              "Địa điểm kiểm tra",
              document.inspectionLocation,
              "Inspection Location",
              MapPin
            )}
            {renderDetailItem(
              "Trạng thái chứng chỉ",
              document.certificateStatus,
              "Certificate Status",
              CheckCircle
            )}
            {renderDateTimeItem(
              "Ngày tạo hồ sơ",
              document.createdAt,
              "Created At",
              Clock,
              false
            )}{" "}
            {/* Read-only */}
          </div>
          {/* Footer buttons - Simplified */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 rounded-b-xl mt-6">
            {" "}
            {/* Light gray footer, slightly rounded */}
            <button
              type="button"
              onClick={() => router.push("/admin/hoso")}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocumentContent;
