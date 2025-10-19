"use client";

import React from "react";
import Image from "next/image";
import classNames from "classnames";
import { DossierDetails } from "@/app/types/dossier";

interface DossierDetailViewProps {
  dossierDetail: DossierDetails;
}

const tableHeaderClass =
  "w-[260px] font-medium bg-gray-100 p-3 text-sm text-[#1e3a8a]";
const tableDataClass = "p-3 text-gray-800";
const inputClass =
  "border-none outline-none bg-transparent font-normal text-gray-800";

const DossierDetailView: React.FC<DossierDetailViewProps> = ({ dossierDetail }) => {
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
            <span
              className={classNames(
                inputClass,
                "font-semibold text-red-600 text-center text-base inline-block"
              )}
              style={{ width: "120px" }}
            >
              {dossierDetail.registrationNo || "<Chưa cập nhập>"}
            </span>
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

      {/* Bảng thông tin */}
      <table className="w-full border-collapse">
        <tbody>
          <tr className="border border-gray-300">
            <td className={tableHeaderClass}>Đơn vị nhập khẩu</td>
            <td className={classNames(tableDataClass, "font-semibold")}>
              <span className={classNames(inputClass, "text-[#1e3a8a] text-sm")}>
                {dossierDetail.customerSubmit?.name || "<Chưa cập nhập>"}
              </span>
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={tableHeaderClass}>Địa chỉ</td>
            <td className={tableDataClass}>
              <span className={classNames(inputClass, "text-sm")}>
                {dossierDetail.customerSubmit?.address || "<Chưa cập nhập>"}
              </span>
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={tableHeaderClass}>Mã số thuế</td>
            <td className={tableDataClass}>
              <span className={classNames(inputClass, "text-sm")}>
                {dossierDetail.customerSubmit?.taxCode || "<Chưa cập nhập>"}
              </span>
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={tableHeaderClass}>Người liên hệ/Điện thoại</td>
            <td className={tableDataClass}>
              <span className={classNames(inputClass, "text-sm")}>
                {dossierDetail.contact || "<Chưa cập nhập>"}
              </span>
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={tableHeaderClass}>Email nhận hóa đơn</td>
            <td className={tableDataClass}>
              <span className={classNames(inputClass, "text-blue-700 underline text-sm")}>
                {dossierDetail.customerSubmit?.email || "<Chưa cập nhập>"}
              </span>
            </td>
          </tr>

          <tr className="border border-gray-300">
            <td className={classNames(tableHeaderClass, "font-bold align-top")}>
              Phạm vi yêu cầu giám định:
            </td>
            <td className={classNames(tableDataClass, "text-[#1e3a8a] text-sm")}>
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
              <td className={classNames(tableHeaderClass, "font-bold")}>{row.label}:</td>
              <td className={tableDataClass}>
                <span className={classNames(inputClass, "text-sm")}>
                  {row.value || "<Chưa cập nhập>"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default DossierDetailView;
