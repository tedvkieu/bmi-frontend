"use client";
import { dossierApi } from "@/app/admin/services/dossierApi";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, ChangeEvent } from "react";
import classNames from "classnames";
import DossierNav from "./DossierNav";
import { DossierDetails } from "@/app/types/dossier";
import MachineInfoSection from "./MachineInfoSection";
import Image from "next/image";
import toast from "react-hot-toast";
import { Edit } from "lucide-react";

type ParsedDateParts = {
  year: string;
  month: string;
  day: string;
};

const padToTwoDigits = (value: string | number) =>
  value.toString().padStart(2, "0");

const normalizeYear = (value: string): string | null => {
  if (/^\d{4}$/.test(value)) {
    return value;
  }
  if (/^\d{2}$/.test(value)) {
    const twoDigit = Number(value);
    if (Number.isNaN(twoDigit)) {
      return null;
    }
    const pivot = 50;
    const fullYear = twoDigit >= pivot ? 1900 + twoDigit : 2000 + twoDigit;
    return fullYear.toString();
  }

  return null;
};

const parseDateParts = (value?: string | null): ParsedDateParts | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return {
      year: isoMatch[1],
      month: isoMatch[2],
      day: isoMatch[3],
    };
  }

  const isoWithTimeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s]/);
  if (isoWithTimeMatch) {
    return {
      year: isoWithTimeMatch[1],
      month: isoWithTimeMatch[2],
      day: isoWithTimeMatch[3],
    };
  }

  const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (dotMatch) {
    const year = normalizeYear(dotMatch[3]);
    if (!year) {
      return null;
    }

    return {
      year,
      month: padToTwoDigits(dotMatch[2]),
      day: padToTwoDigits(dotMatch[1]),
    };
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const year = normalizeYear(slashMatch[3]);
    if (!year) {
      return null;
    }

    return {
      year,
      month: padToTwoDigits(slashMatch[2]),
      day: padToTwoDigits(slashMatch[1]),
    };
  }

  const dashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dashMatch) {
    const year = normalizeYear(dashMatch[3]);
    if (!year) {
      return null;
    }

    return {
      year,
      month: padToTwoDigits(dashMatch[2]),
      day: padToTwoDigits(dashMatch[1]),
    };
  }

  const monthYearDotMatch = trimmed.match(/^(\d{1,2})\.(\d{4})$/);
  if (monthYearDotMatch) {
    return {
      year: monthYearDotMatch[2],
      month: padToTwoDigits(monthYearDotMatch[1]),
      day: "01",
    };
  }

  const monthYearSlashMatch = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthYearSlashMatch) {
    return {
      year: monthYearSlashMatch[2],
      month: padToTwoDigits(monthYearSlashMatch[1]),
      day: "01",
    };
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.valueOf())) {
    return {
      year: parsed.getFullYear().toString(),
      month: padToTwoDigits(parsed.getMonth() + 1),
      day: padToTwoDigits(parsed.getDate()),
    };
  }

  return null;
};

const formatDateForInput = (value?: string | null): string => {
  const parts = parseDateParts(value);
  if (!parts) {
    return "";
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const formatDateForStorage = (value?: string | null): string => {
  const parts = parseDateParts(value);
  if (!parts) {
    return "";
  }

  return `${parts.day}.${parts.month}.${parts.year}`;
};

export default function DossierDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [dossier, setDossier] = useState<DossierDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("generalInfo");

  const fetchDossier = useCallback(async () => {
    let dossierId: string = "";
    if (Array.isArray(id)) {
      dossierId = id[0];
    } else if (typeof id === "string") {
      dossierId = id;
    } else {
      setLoading(false);
      return;
    }

    if (!dossierId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await dossierApi.getDocumentByIdDetails(dossierId);
      setDossier(response as DossierDetails);
    } catch (error) {
      console.error("Failed to fetch dossier:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;

    setDossier((prevDossier) => {
      if (!prevDossier) return null;

      let newValue: any = value;

      // Nếu là checkbox thì lấy checked (boolean)
      if (e.target instanceof HTMLInputElement && type === "checkbox") {
        newValue = e.target.checked;
      }

      // Xử lý các field lồng trong customerSubmit.*
      if (name.startsWith("customerRelated.")) {
        const customerRelatedField = name.split(".")[1];
        return {
          ...prevDossier,
          customerRelated: {
            ...prevDossier.customerRelated,
            [customerRelatedField]: newValue,
          },
        };
      }

      return {
        ...prevDossier,
        [name]: newValue,
      };
    });
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatDateForStorage(value);

    setDossier((prevDossier) => {
      if (!prevDossier) return null;
      return {
        ...prevDossier,
        [name]: formattedValue,
      };
    });
  };

  const handleSave = async () => {
    if (!dossier) return;

    const dossierId = Array.isArray(id)
      ? id[0]
      : typeof id === "string"
      ? id
      : dossier.dossierId?.toString();

    if (!dossierId) {
      toast.error("Không xác định được hồ sơ cần cập nhật");
      return;
    }

    setSaving(true);
    try {
      const submitId = dossier.customerSubmit?.id
        ? Number(dossier.customerSubmit.id)
        : NaN;
      const relatedId = dossier.customerRelated?.id
        ? Number(dossier.customerRelated.id)
        : NaN;

      const payload = {
        registrationNo: dossier.registrationNo ?? "",
        registrationDate: dossier.registrationDate ?? "",
        dailySeqNo: dossier.dailySeqNo ?? null,
        declarationNo: dossier.declarationNo ?? "",
        declarationDate: dossier.declarationDate ?? "",
        invoiceNo: dossier.invoiceNo ?? "",
        invoiceDate: dossier.invoiceDate ?? "",
        billOfLading: dossier.billOfLading ?? "",
        billOfLadingDate: dossier.billOfLadingDate ?? "",
        shipName: dossier.shipName ?? "",
        cout10: dossier.cout10 ?? null,
        cout20: dossier.cout20 ?? null,
        bulkShip: dossier.bulkShip ?? false,
        declarationDoc: dossier.declarationDoc ?? "",
        declarationPlace: dossier.declarationPlace ?? "",
        inspectionLocation: dossier.inspectionLocation ?? "",
        inspectionDate: dossier.inspectionDate ?? "",
        certificateDate: dossier.certificateDate ?? "",
        contact: dossier.contact ?? "",
        scheduledInspectionDate: dossier.scheduledInspectionDate ?? null,
        certificateStatus: dossier.certificateStatus,
        customerSubmit: !Number.isNaN(submitId)
          ? {
              id: submitId,
              name: dossier.customerSubmit.name ?? "",
              address: dossier.customerSubmit.address ?? "",
              taxCode: dossier.customerSubmit.taxCode ?? "",
              email: dossier.customerSubmit.email ?? "",
              phone: dossier.customerSubmit.phone ?? "",
            }
          : undefined,
        customerRelated: !Number.isNaN(relatedId)
          ? {
              id: relatedId,
              name: dossier.customerRelated.name ?? "",
              address: dossier.customerRelated.address ?? "",
              taxCode: dossier.customerRelated.taxCode ?? "",
              email: dossier.customerRelated.email ?? "",
              phone: dossier.customerRelated.phone ?? "",
            }
          : undefined,
      };

      const updated = await dossierApi.updateDossierDetails(dossierId, payload);
      console.log("ADADADA", updated);
      setDossier(updated as DossierDetails);
      toast.success("Đã lưu thông tin hồ sơ");
    } catch (error: any) {
      const message = error?.message || "Lưu thông tin hồ sơ thất bại";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };
  const inputClass = "w-full  px-1 text-sm bg-gray-50 text-gray-800";
  const editableInputClass =
    "w-full border-b border-gray-500 text-[#1e3a8a] outline-none px-1 text-sm";
  const tableHeaderClass =
    "w-1/3 p-2 text-[#1e3a8a] bg-gray-50 border-r border-gray-300 text-sm";
  const tableDataClass = "w-2/3 p-2 text-sm";
  const italicTextClass = "italic text-[#1e3a8a] text-sm";

  if (loading) {
    return (
      <div className="text-center p-4 text-gray-700 text-base">
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="text-center p-4 text-red-600 text-base">
        Không tìm thấy hồ sơ.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DossierNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-grow w-full mx-auto -mt-px p-4 bg-white border border-gray-300 shadow-lg font-sans text-base text-gray-800">
        {activeTab === "generalInfo" && (
          <>
            <div className="flex justify-between items-start mb-3 border-b pb-2">
              <div className="flex items-center">
                <Image
                  src="/BMI_LOGO.png"
                  alt="BMI Logo"
                  width={160}
                  height={56}
                  className="h-14 w-auto mr-3"
                  priority
                />
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-3xl font-bold text-[#1e3a8a] whitespace-nowrap">
                  GIẤY YÊU CẦU GIÁM ĐỊNH
                </h1>
                <div className="text-base mt-1">
                  <span className="text-[#1e3a8a]">Đăng ký số:</span>
                  <input
                    type="text"
                    name="registrationNo"
                    value={dossier.registrationNo || ""}
                    onChange={handleInputChange}
                    className={classNames(
                      editableInputClass,
                      "font-semibold text-red-600 text-center text-base"
                    )}
                    style={{ width: "120px" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#1e3a8a] text-white text-sm rounded-md hover:bg-[#324cb0] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>

            <div className="flex flex-col items-center mb-3">
              <div className="flex items-center text-base text-gray-800 space-x-1">
                <span className="font-bold italic underline text-[#1e3a8a]">
                  Kính gửi:
                </span>
                <div className="flex items-center text-xl font-bold space-x-1">
                  <span className="text-[#1e3a8a]">
                    CÔNG TY CỔ PHẦN DỊCH VỤ VÀ GIÁM ĐỊNH
                  </span>
                  <span className="text-red-600">BẢO MINH</span>
                </div>
              </div>
              <p className="mt-1 text-center italic text-[#1e3a8a] text-base space-x-6">
                Điện thoại :
                <span
                  className="font-normal px-1 inline-block text-base"
                  style={{ width: "100px" }}
                >
                  0911.76.80.08
                </span>
                Email:
                <span
                  className="font-normal px-1 inline-block text-base"
                  style={{ width: "200px" }}
                >
                  info@baominhinspection.com
                </span>
              </p>
            </div>

            <table className="w-full border-collapse">
              <tbody>
                <tr className="flex justify-between items-center p-2">
                  <td>
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/khachhang/${dossier.customerRelated?.id}`
                        )
                      }
                      className="text-blue-900 hover:text-blue-800 italic underline flex items-center space-x-1 text-sm"
                      title="Chỉnh sửa đơn vị nhập khẩu"
                    >
                      <Edit size={18} />
                      <span>Chỉnh sửa thông tin đơn vị nhập khẩu</span>
                    </button>
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Đơn vị nhập khẩu</td>
                  <td
                    className={classNames(
                      tableDataClass,
                      "font-semibold flex justify-between items-center"
                    )}
                  >
                    <span
                      className={classNames(
                        inputClass,
                        "text-[#1e3a8a] text-sm"
                      )}
                    >
                      {dossier.customerRelated?.name || ""}
                    </span>
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Địa chỉ</td>
                  <td className={tableDataClass}>
                    <span className={classNames(inputClass, "text-sm")}>
                      {dossier.customerRelated?.address || ""}
                    </span>
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Mã số thuế</td>
                  <td className={tableDataClass}>
                    <span className={classNames(inputClass, "text-sm")}>
                      {dossier.customerRelated?.taxCode || ""}
                    </span>
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>
                    Người liên hệ / Điện thoại
                  </td>
                  <td className={tableDataClass}>
                    <span
                      className={classNames(
                        inputClass,
                        "text-blue-700 text-sm"
                      )}
                    >
                      {dossier.contact || "<Chưa cập nhập>"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Email nhận hóa đơn</td>
                  <td className={tableDataClass}>
                    <span className="text-blue-500 text-sm italic underline">
                      {dossier.customerRelated.email || "<Chưa cập nhập>"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td
                    className={classNames(
                      tableHeaderClass,
                      "font-bold align-top"
                    )}
                  >
                    Phạm vi yêu cầu giám định:
                  </td>
                  <td
                    className={classNames(
                      tableDataClass,
                      "text-[#1e3a8a] text-sm"
                    )}
                  >
                    Máy móc, thiết bị đã qua sử dụng nhập khẩu quy định tại Điều
                    6, Quyết định số 18/2019/QĐ-TTg ngày 19 tháng 4 năm 2019 của
                    Thủ tướng Chính Phủ.
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td
                    className="w-full p-3 text-sm text-[#1e3a8a] italic font-light leading-relaxed text-justify"
                    colSpan={2}
                  >
                    Khách hàng cam kết nhập khẩu máy móc, thiết bị đã qua sử
                    dụng nêu trên để trực tiếp phục vụ hoạt động sản xuất tại
                    Doanh nghiệp; máy móc, thiết bị đáp ứng yêu cầu về an toàn,
                    tiết kiệm năng lượng, bảo vệ môi trường; chịu trách nhiệm
                    trước pháp luật về cam kết này và tính chính xác của các
                    thông tin cung cấp. Cam kết thực hiện đúng theo các quy định
                    pháp luật liên quan đến việc nhập khẩu hàng hóa của Khách
                    hàng.
                  </td>
                </tr>

                {/* Dossier Info */}
                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Hàng hóa yêu cầu giám định:
                  </td>
                  <td
                    className={classNames(
                      tableDataClass,
                      italicTextClass,
                      "text-sm"
                    )}
                  >
                    Theo danh mục đính kèm
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Thuộc vận đơn số:
                  </td>
                  <td
                    className={classNames(
                      tableDataClass,
                      "flex justify-between items-center"
                    )}
                  >
                    <input
                      type="text"
                      name="billOfLading"
                      value={dossier.billOfLading || ""}
                      onChange={handleInputChange}
                      className={classNames(
                        editableInputClass,
                        "flex-grow mr-2 text-sm"
                      )}
                    />
                    <span className={classNames(italicTextClass, "text-sm")}>
                      Ngày:
                    </span>
                    <input
                      type="date"
                      name="billOfLadingDate"
                      value={formatDateForInput(dossier.billOfLadingDate)}
                      onChange={handleDateChange}
                      className={classNames(
                        editableInputClass,
                        "text-sm w-[100px] italic"
                      )}
                    />
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Thuộc tờ khai số:
                  </td>
                  <td
                    className={classNames(
                      tableDataClass,
                      "flex justify-between items-center"
                    )}
                  >
                    <input
                      type="text"
                      name="declarationNo"
                      value={dossier.declarationNo || ""}
                      onChange={handleInputChange}
                      className={classNames(
                        editableInputClass,
                        "flex-grow mr-2 text-sm"
                      )}
                    />
                    <span className={classNames(italicTextClass, "text-sm")}>
                      Ngày:
                    </span>
                    <input
                      type="date"
                      name="declarationDate"
                      value={formatDateForInput(dossier.declarationDate)}
                      onChange={handleDateChange}
                      className={classNames(
                        editableInputClass,
                        "text-sm w-[100px] italic"
                      )}
                    />
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Thuộc hóa đơn số:
                  </td>
                  <td
                    className={classNames(
                      tableDataClass,
                      "flex justify-between items-center"
                    )}
                  >
                    <input
                      type="text"
                      name="invoiceNo"
                      value={dossier.invoiceNo || ""}
                      onChange={handleInputChange}
                      className={classNames(
                        editableInputClass,
                        "flex-grow mr-2 text-sm"
                      )}
                    />
                    <span className={classNames(italicTextClass, "text-sm")}>
                      Ngày:
                    </span>
                    <input
                      type="date"
                      name="invoiceDate"
                      value={formatDateForInput(dossier.invoiceDate)}
                      onChange={handleDateChange}
                      className={classNames(
                        editableInputClass,
                        "text-sm w-[100px] italic"
                      )}
                    />
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Dự kiến thời gian giám định:
                  </td>
                  <td className={tableDataClass}>
                    <input
                      type="date"
                      name="scheduledInspectionDate"
                      value={formatDateForInput(
                        dossier.scheduledInspectionDate
                      )}
                      onChange={handleDateChange}
                      className={classNames(
                        editableInputClass,
                        "text-sm italic w-[120px]"
                      )}
                    />
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Dự kiến địa điểm giám định:
                  </td>
                  <td className={tableDataClass}>
                    <input
                      type="text"
                      name="inspectionLocation"
                      value={dossier.inspectionLocation || ""}
                      onChange={handleInputChange}
                      className={classNames(editableInputClass, "text-sm")}
                    />
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td
                    className={classNames(
                      tableHeaderClass,
                      "font-bold text-red-600"
                    )}
                  >
                    Ngày giám định chính thức:
                  </td>
                  <td className={tableDataClass}>
                    <input
                      type="date"
                      name="inspectionDate"
                      value={formatDateForInput(dossier.inspectionDate)}
                      onChange={handleDateChange}
                      className={classNames(
                        editableInputClass,
                        "text-sm italic w-[120px]"
                      )}
                    />
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Tên tàu:
                  </td>
                  <td className={tableDataClass}>
                    <input
                      type="text"
                      name="shipName"
                      value={dossier.shipName || ""}
                      onChange={handleInputChange}
                      className={classNames(editableInputClass, "text-sm")}
                    />
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Container 20ft:
                  </td>
                  <td className={tableDataClass}>
                    <input
                      type="text"
                      name="cout10"
                      value={dossier.cout10 || ""}
                      onChange={handleInputChange}
                      className={classNames(editableInputClass, "text-sm")}
                    />
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Container 40ft:
                  </td>
                  <td className={tableDataClass}>
                    <input
                      type="text"
                      name="cout20"
                      value={dossier.cout20 ?? ""}
                      onChange={handleInputChange}
                      className={classNames(editableInputClass, "text-sm")}
                    />
                  </td>
                </tr>
                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Hải quan mở tờ khai:
                  </td>
                  <td className={tableDataClass}>
                    <input
                      type="text"
                      name="declarationPlace"
                      value={dossier.declarationPlace || ""}
                      onChange={handleInputChange}
                      className={classNames(editableInputClass, "text-sm")}
                    />
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Trạng thái rời cảng:
                  </td>
                  <td className={tableDataClass}>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        name="bulkShip"
                        checked={!!dossier.bulkShip}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span>
                        {dossier.bulkShip ? "Đã rời cảng" : "Chưa rời cảng"}
                      </span>
                    </label>
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={classNames(tableHeaderClass, "font-bold")}>
                    Ngày cấp chứng chỉ:
                  </td>
                  <td
                    className={classNames(
                      tableDataClass,
                      "flex justify-between items-center"
                    )}
                  >
                    <input
                      type="date"
                      name="certificateDate"
                      value={formatDateForInput(dossier.certificateDate)}
                      onChange={handleDateChange}
                      className={classNames(
                        editableInputClass,
                        "text-sm w-[100px] italic"
                      )}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Triển khai sau */}
            <div className="mt-5 mb-3 text-[#1e3a8a]">
              <p className="font-bold text-center mb-2">Chứng từ kèm theo:</p>
              <div className="grid grid-cols-3 gap-y-2 text-sm mx-auto">
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    id="contract"
                    name="contract"
                    className="mr-2 accent-[#1e3a8a]"
                  />
                  <label htmlFor="contract">Hợp đồng</label>
                </div>
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    id="pl"
                    name="pl"
                    className="mr-2 accent-[#1e3a8a]"
                  />
                  <label htmlFor="pl">P/L</label>
                </div>
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    id="co"
                    name="co"
                    className="mr-2 accent-[#1e3a8a]"
                  />
                  <label htmlFor="co">C/O</label>
                </div>
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    id="bl"
                    name="bl"
                    className="mr-2 accent-[#1e3a8a]"
                  />
                  <label htmlFor="bl">B/L</label>
                </div>
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    id="iv"
                    name="iv"
                    className="mr-2 accent-[#1e3a8a]"
                  />
                  <label htmlFor="iv">I/V</label>
                </div>
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    id="cq"
                    name="cq"
                    className="mr-2 accent-[#1e3a8a]"
                  />
                  <label htmlFor="cq">C/Q</label>
                </div>
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    id="xnkDeclaration"
                    name="xnkDeclaration"
                    className="mr-2 accent-[#1e3a8a]"
                  />
                  <label htmlFor="xnkDeclaration">Tờ khai hàng hóa XNK</label>
                </div>
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    id="manufacturerDocs"
                    name="manufacturerDocs"
                    className="mr-2 accent-[#1e3a8a]"
                  />
                  <label htmlFor="manufacturerDocs">
                    Hồ sơ của nhà sản xuất
                  </label>
                </div>
              </div>
            </div>
            <div className="border border-gray-300">
              <p className="w-full p-3 text-sm text-[#1e3a8a] italic font-light leading-relaxed text-justify">
                Khác
              </p>
            </div>

            <div className="flex justify-between items-start mt-6 text-sm pb-24">
              <div className="flex flex-col items-center w-1/2 pr-3">
                <p className="text-left text-[#1e3a8a] w-full text-sm">
                  Tp. HCM, ngày
                </p>
                <p className="font-bold text-lg mt-2 text-[#1e3a8a] font-bold">
                  TỔ CHỨC GIÁM ĐỊNH
                </p>
                <p className="italic text-center mt-1 text-sm text-[#1e3a8a]">
                  (Công ty Bảo Minh đồng ý tiếp nhận yêu cầu giám định.)
                </p>
              </div>
              <div className="flex flex-col items-center text-[#1e3a8a]  w-1/2 pl-3">
                <p className="text-right w-full pr-6 text-sm">Đồng Nai, ngày</p>
                <p className="font-bold text-lg mt-2 font-bold">
                  ĐƠN VỊ/ NGƯỜI YÊU CẦU
                </p>
                <p className="italic text-center mt-1 text-sm">
                  (Đồng ý các điều kiện chung để thực hiện giám định)
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === "goodsInfo" && (
          <>
            <MachineInfoSection
              dossierId={id as string}
              registrationNo={dossier.registrationNo ?? null}
              declarationPlace={dossier.declarationPlace ?? null}
              isActive={activeTab === "goodsInfo"}
            />
          </>
        )}
        {activeTab === "historyInfo" && (
          <>
            <p className="text-red-500 text-sm mb-2 italic">* Read only</p>

            <table className="w-full border-collapse">
              <tbody>
                {/* --- PHẦN 1: THÔNG TIN KHÁCH HÀNG --- */}
                <tr className="border border-gray-300 bg-gray-100">
                  <td
                    colSpan={2}
                    className="px-3 py-2 text-sm font-semibold text-[#1e3a8a] uppercase tracking-wide"
                  >
                    Thông tin khách hàng yêu cầu giám định
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Đơn vị gửi yêu cầu</td>
                  <td className={tableDataClass}>
                    <div className="bg-gray-50 px-2 py-1 rounded text-gray-700 text-sm cursor-not-allowed select-none">
                      {dossier.customerSubmit?.name || "<Chưa cập nhật>"}
                    </div>
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Địa chỉ</td>
                  <td className={tableDataClass}>
                    <div className="bg-gray-50 px-2 py-1 rounded text-gray-700 text-sm cursor-not-allowed select-none">
                      {dossier.customerSubmit?.address || "<Chưa cập nhật>"}
                    </div>
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Mã số thuế</td>
                  <td className={tableDataClass}>
                    <div className="bg-gray-50 px-2 py-1 rounded text-gray-700 text-sm cursor-not-allowed select-none">
                      {dossier.customerSubmit?.taxCode || "<Chưa cập nhật>"}
                    </div>
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>
                    Người liên hệ / Điện thoại
                  </td>
                  <td className={tableDataClass}>
                    <div className="bg-gray-50 px-2 py-1 rounded text-gray-700 text-sm cursor-not-allowed select-none">
                      {dossier.customerSubmit?.name || "<Chưa cập nhật>"}
                      {dossier.customerSubmit?.phone
                        ? ` / ${dossier.customerSubmit.phone}`
                        : ""}
                    </div>
                  </td>
                </tr>

                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Email nhận hóa đơn</td>
                  <td className={tableDataClass}>
                    <div className="bg-gray-50 px-2 py-1 rounded text-gray-700 text-sm cursor-not-allowed select-none">
                      {dossier.customerSubmit?.email || "<Chưa cập nhật>"}
                    </div>
                  </td>
                </tr>

                {/* --- PHẦN 2: THÔNG TIN QUẢN LÝ HỒ SƠ --- */}
                <tr className="border border-gray-300 bg-gray-100">
                  <td
                    colSpan={2}
                    className="px-3 py-2 text-sm font-semibold text-[#1e3a8a] uppercase tracking-wide"
                  >
                    Thông tin quản lý hồ sơ
                  </td>
                </tr>

                {/* Người lên hồ sơ + Thời gian */}
                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Người lên hồ sơ</td>
                  <td className={tableDataClass}>
                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded text-gray-700 text-sm cursor-not-allowed select-none">
                      <span>
                        {dossier.createdByUser?.name || "<Chưa cập nhật>"}
                      </span>
                      <span className="text-gray-500 italic ml-3">
                        {dossier.createdAt
                          ? new Date(dossier.createdAt).toLocaleString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "<Chưa cập nhật>"}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Người cập nhật + Thời gian */}
                <tr className="border border-gray-300">
                  <td className={tableHeaderClass}>Người cập nhật</td>
                  <td className={tableDataClass}>
                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded text-gray-700 text-sm cursor-not-allowed select-none">
                      <span>
                        {dossier.updatedByUser?.name || "<Chưa cập nhật>"}
                      </span>
                      <span className="text-gray-500 italic ml-3">
                        {dossier.updatedAt
                          ? new Date(dossier.updatedAt).toLocaleString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "<Chưa cập nhật>"}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
