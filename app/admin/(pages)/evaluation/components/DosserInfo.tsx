"use client";

import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import classNames from "classnames";
import { MachineDetails } from "@/app/types/machines";
import { DossierDetails } from "@/app/types/dossier";
import { dossierApi } from "@/app/admin/services/dossierApi";

interface DossierDetailViewProps {
  dossierDetail: DossierDetails;
}

// Re-defined these classes once globally or consistently
const globalTableHeaderClass = "w-[260px] font-medium bg-gray-100 p-3 text-sm text-[#1e3a8a]";
const globalTableCellClass = "p-3 text-gray-800";
const globalInputClass = "border-none outline-none bg-transparent font-normal text-gray-800";

const machineTableHeaderClass = "border border-gray-400 bg-[#e8edf7] text-[#1e3a8a] font-semibold text-center text-sm px-2 py-2";
const machineTableCellClass = "border border-gray-400 text-sm px-2 py-1 align-top text-gray-800";

// Helper to display default value for missing data
const DisplayValue: React.FC<{ value: string | number | boolean | undefined | null; className?: string }> = ({ value, className }) => {
  const display = value === undefined || value === null || value === "" ? "<Chưa cập nhật>" : value.toString();
  return <span className={classNames(globalInputClass, className)}>{display}</span>;
};


const DossierDetailView: React.FC<DossierDetailViewProps> = ({ dossierDetail }) => {
  const [machines, setMachines] = useState<MachineDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract dossierId safely
  const dossierId = dossierDetail?.dossierId;

  const fetchMachines = useCallback(async () => {
    if (!dossierId) return; // Ensure dossierId exists

    setLoading(true);
    try {
      const response = await dossierApi.getMachinesByDossier(String(dossierId));
      if (Array.isArray(response)) {
        setMachines(response);
      } else {
        console.error("Phản hồi từ API không phải là mảng:", response);
        setMachines([]); // Reset machines if response is not an array
      }
    } catch (err) {
      console.error("Lỗi tải máy móc:", err);
      setError("Không thể tải thông tin máy móc.");
    } finally {
      setLoading(false);
    }
  }, [dossierId]); // Depend on dossierId

  useEffect(() => {
    if (dossierId) {
      fetchMachines();
    }
  }, [dossierId, fetchMachines]); // Depend on dossierId and fetchMachines

  if (loading)
    return <div className="text-center p-4 text-gray-700">Đang tải thông tin máy móc...</div>;

  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <>
      {/* Header */}
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
            <span className="text-[#1e3a8a]">Đăng ký số:</span>{" "}
            <DisplayValue
              value={dossierDetail.registrationNo}
              className="font-semibold text-red-600 text-center text-base inline-block w-[120px]"
            />
          </div>
        </div>
      </div>

      {/* Thông tin công ty */}
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

      <div>
      {/* Bảng thông tin */}
      <table className="w-full border-collapse">
        <tbody>
          <tr className="border border-gray-300">
            <td className={globalTableHeaderClass}>Đơn vị nhập khẩu</td>
            <td className={classNames(globalTableCellClass, "font-semibold")}>
              <DisplayValue
                value={dossierDetail.customerSubmit?.name}
                className="text-[#1e3a8a] text-sm"
              />
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={globalTableHeaderClass}>Địa chỉ</td>
            <td className={globalTableCellClass}>
              <DisplayValue value={dossierDetail.customerSubmit?.address} className="text-sm" />
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={globalTableHeaderClass}>Mã số thuế</td>
            <td className={globalTableCellClass}>
              <DisplayValue value={dossierDetail.customerSubmit?.taxCode} className="text-sm" />
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={globalTableHeaderClass}>Người liên hệ/Điện thoại</td>
            <td className={globalTableCellClass}>
              <DisplayValue value={dossierDetail.contact} className="text-sm" />
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={globalTableHeaderClass}>Email nhận hóa đơn</td>
            <td className={globalTableCellClass}>
              <DisplayValue
                value={dossierDetail.customerSubmit?.email}
                className="text-blue-700 underline text-sm"
              />
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={classNames(globalTableHeaderClass, "font-bold align-top")}>
              Phạm vi yêu cầu giám định:
            </td>
            <td className={classNames(globalTableCellClass, "text-[#1e3a8a] text-sm")}>
              Máy móc, thiết bị đã qua sử dụng nhập khẩu quy định tại Điều 6, Quyết định
              số 18/2019/QĐ-TTg ngày 19 tháng 4 năm 2019 của Thủ tướng Chính Phủ.
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td
              className="w-full p-3 text-sm text-[#1e3a8a] italic font-light leading-relaxed text-justify"
              colSpan={2}
            >
              Khách hàng cam kết nhập khẩu máy móc, thiết bị đã qua sử dụng nêu trên để
              trực tiếp phục vụ hoạt động sản xuất tại Doanh nghiệp; máy móc, thiết bị
              đáp ứng yêu cầu về an toàn, tiết kiệm năng lượng, bảo vệ môi trường; chịu
              trách nhiệm trước pháp luật về cam kết này và tính chính xác của các thông
              tin cung cấp.
            </td>
          </tr>

          {/* Các hàng dữ liệu tiếp theo */}
          {[
            { label: "Hàng hóa yêu cầu giám định", value: "Theo danh mục đính kèm" },
            { label: "Thuộc vận đơn số", value: dossierDetail.billOfLading },
            { label: "Thuộc tờ khai số", value: dossierDetail.declarationNo },
            { label: "Thuộc hóa đơn số", value: dossierDetail.invoiceNo },
            { label: "Dự kiến thời gian giám định", value: dossierDetail.inspectionDate },
            { label: "Dự kiến địa điểm giám định", value: dossierDetail.inspectionLocation },
            { label: "Ngày giám định chính thức", value: dossierDetail.scheduledInspectionDate },
            { label: "Tên tàu", value: dossierDetail.shipName },
            { label: "Container 20ft", value: dossierDetail.cout10 },
            { label: "Container 40ft", value: dossierDetail.cout20 },
            {
              label: "Trạng thái rời cảng",
              value: dossierDetail.bulkShip ? "Đã rời cảng" : "Chưa rời cảng",
            },
            { label: "Hải quan mở tờ khai", value: dossierDetail.declarationPlace },
            { label: "Ngày cấp chứng chỉ", value: dossierDetail.certificateDate },
          ].map((row, i) => (
            <tr className="border border-gray-300" key={i}>
              <td className={classNames(globalTableHeaderClass, "font-bold")}>{row.label}:</td>
              <td className={globalTableCellClass}>
                <DisplayValue value={row.value} className="text-sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
         {/* Phần Danh mục hàng hóa yêu cầu giám định */}
      <div className="mt-0 ">
        <h1 className="text-center text-[#1e3a8a] font-bold text-xl mb-4 mt-8"> {/* Added mt-8 for spacing */}
          DANH MỤC HÀNG HÓA YÊU CẦU GIÁM ĐỊNH
        </h1>
        <div className="border border-gray-400 grid grid-cols-2 text-sm mb-4">
          <div className="border-r border-gray-400 px-2 py-1 text-[#1e3a8a] font-semibold flex items-center">
            THUỘC SỐ YÊU CẦU
          </div>
          <div className="px-2 py-1 bg-blue-50 flex items-center">
            <DisplayValue
              value={dossierDetail.registrationNo}
              className="w-full text-red-500 font-bold bg-transparent outline-none border-none text-sm text-gray-800"
            />
          </div>

          <div className="border-t border-r border-gray-400 px-2 py-1 text-[#1e3a8a] font-semibold flex items-center">
            HẢI QUAN MỞ TỜ KHAI
          </div>
          <div className="border-t px-2 py-1 bg-blue-50 flex items-center">
            <DisplayValue
              value={dossierDetail.declarationPlace}
              className="w-full bg-transparent outline-none border-none text-sm text-gray-800"
            />
          </div>
        </div>
        <table className="w-full border border-gray-400 border-collapse text-gray-800">
          <thead>
            <tr>
              <th className={classNames(machineTableHeaderClass, "w-[2%]")}>STT</th>
              <th className={classNames(machineTableHeaderClass, "w-[20%]")}>Tên hàng hóa</th>
              <th className={classNames(machineTableHeaderClass, "w-[8%]")}>Nhãn hiệu</th>
              <th className={classNames(machineTableHeaderClass, "w-[8%]")}>Model</th>
              <th className={classNames(machineTableHeaderClass, "w-[10%]")}>Số hiệu</th>
              <th className={classNames(machineTableHeaderClass, "w-[5%]")}>Nước sản xuất</th>
              <th className={classNames(machineTableHeaderClass, "w-[15%]")}>Tên nhà sản xuất</th>
              <th className={classNames(machineTableHeaderClass, "w-[6%]")}>Năm SX</th>
              <th className={classNames(machineTableHeaderClass, "w-[2%]")}>Số lượng</th>
              <th className={classNames(machineTableHeaderClass, "w-[10%]")}>Công dụng</th>
              <th className={classNames(machineTableHeaderClass, "w-[30%]")}>Ghi chú</th>
            </tr>
          </thead>

          <tbody>
            {machines.length > 0 ? (
              machines.map((machine, index) => (
                <tr key={machine.machineId}>
                  <td className={classNames(machineTableCellClass, "text-center")}>{index + 1}</td>
                  <td className={machineTableCellClass}>{machine.itemName || "<Chưa cập nhật>"}</td>
                  <td className={machineTableCellClass}>{machine.brand || "<Chưa cập nhật>"}</td>
                  <td className={machineTableCellClass}>{machine.model || "<Chưa cập nhật>"}</td>
                  <td className={machineTableCellClass}>{machine.serialNumber || "<Chưa cập nhật>"}</td>
                  <td className={machineTableCellClass}>{machine.manufactureCountry || "<Chưa cập nhật>"}</td>
                  <td className={machineTableCellClass}>{machine.manufacturerName || "<Chưa cập nhật>"}</td>
                  <td className={classNames(machineTableCellClass, "text-center")}>{machine.manufactureYear || "<Chưa cập nhật>"}</td>
                  <td className={classNames(machineTableCellClass, "text-center")}>{machine.quantity || 0}</td>
                  <td className={machineTableCellClass}>{machine.usage || "<Chưa cập nhật>"}</td>
                  <td className={machineTableCellClass}>{machine.note || "<Chưa cập nhật>"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className={classNames(machineTableCellClass, "text-center text-gray-500 italic")}>
                  Không có máy móc nào được liệt kê.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="text-center border border-gray-400 border-t-0 text-sm italic text-[#1e3a8a] py-2">
          - Hết -
        </div>
      </div>
    </>
  );
};

export default DossierDetailView;