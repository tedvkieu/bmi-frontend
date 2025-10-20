"use client";
import { DossierDetails } from "@/app/types/dossier";
import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import classNames from 'classnames';
import MachineInfoSectionView from "./MachineInfoSectionView";
import Image from "next/image";

interface DocumentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: DossierDetails | null;
}

const DossierViewModal: React.FC<DocumentViewModalProps> = ({
    isOpen,
    onClose,
    document,
}) => {
    const [activeTab, setActiveTab] = useState('generalInfo');

    useEffect(() => {
        if (isOpen) {
            console.log("📄 Dossier document data:", document);
            setActiveTab('generalInfo');
        }
    }, [isOpen, document]);

    if (!isOpen) return null;
    if (!document) return null; // Should ideally not happen if document is passed correctly


    const inputClass = "w-full  px-1 text-sm bg-gray-50 text-gray-800";
    const tableHeaderClass = "w-1/3 p-2 text-[#1e3a8a] bg-gray-50 border-r border-gray-300 text-sm";
    const tableDataClass = "w-2/3 p-2 text-sm";
    const italicTextClass = "italic text-[#1e3a8a] text-sm";

    const DossierNav: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => (
        <nav className="flex mb-4 border-b border-gray-300">
            <button
                className={classNames(
                    "px-4 py-2 text-sm font-medium",
                    activeTab === 'generalInfo'
                        ? "border-b-2 border-[#1e3a8a] text-[#1e3a8a]"
                        : "text-gray-500 hover:text-gray-700"
                )}
                onClick={() => onTabChange('generalInfo')}
            >
                Thông tin chung
            </button>
            <button
                className={classNames(
                    "px-4 py-2 text-sm font-medium",
                    activeTab === 'goodsInfo'
                        ? "border-b-2 border-[#1e3a8a] text-[#1e3a8a]"
                        : "text-gray-500 hover:text-gray-700"
                )}
                onClick={() => onTabChange('goodsInfo')}
            >
                Thông tin hàng hóa
            </button>
        </nav>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative bg-white w-full w-full mx-12 max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-[#1e3a8a]">Số đăng ký {document.registrationNo || ""}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <IoCloseCircle size={28} />
                    </button>
                </div>

                <DossierNav activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="flex-grow overflow-y-auto p-4 font-sans text-base text-gray-800">
                    {activeTab === 'generalInfo' && (
                        <>
                            ;

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
                                            {document.registrationNo || ""}
                                        </span>
                                    </div>
                                </div>
                            </div>;
                            <div className="flex flex-col items-center mb-3">
                                <div className="flex items-center text-base text-gray-800 space-x-1">
                                    <span className="font-bold italic underline text-[#1e3a8a]">Kính gửi:</span>
                                    <div className="flex items-center text-xl font-bold space-x-1">
                                        <span className="text-[#1e3a8a]">
                                            CÔNG TY CỔ PHẦN DỊCH VỤ VÀ GIÁM ĐỊNH
                                        </span>
                                        <span className="text-red-600">
                                            BẢO MINH
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-1 text-center italic text-[#1e3a8a] text-base space-x-6">
                                    Điện thoại :
                                    <span className="font-normal px-1 inline-block text-base" style={{ width: '100px' }}>
                                        0911.76.80.08
                                    </span>
                                    Email:
                                    <span className="font-normal px-1 inline-block text-base" style={{ width: '200px' }}>
                                        info@baominhinspection.com
                                    </span>
                                </p>
                            </div>

                            <table className="w-full border-collapse">
                                <tbody>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Đơn vị nhập khẩu</td>
                                        <td className={classNames(tableDataClass, "font-semibold")}>
                                            <span className={classNames(inputClass, "text-[#1e3a8a] text-sm")}>
                                                {document.customerSubmit?.name || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Địa chỉ</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-sm")}>
                                                {document.customerSubmit?.address || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Mã số thuế</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-sm")}>
                                                {document.customerSubmit?.taxCode || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Người liên hệ/ Điện thoại</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-sm")}>
                                                {document.contact || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Email nhận hóa đơn:</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-blue-700 underline text-sm")}>
                                                {document.customerSubmit?.email || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300 bg-gray-50">
                                        <td
                                            colSpan={2}
                                            className="px-3 py-2 text-sm font-semibold text-[#1e3a8a] uppercase tracking-wide"
                                        >
                                            Thông tin khách hàng nhập khẩu
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={classNames(tableHeaderClass, "font-bold")}>
                                            Đơn vị nhập khẩu
                                        </td>
                                        <td className={classNames(tableDataClass, "font-semibold")}>
                                            <span className={classNames(inputClass, "text-[#1e3a8a] text-sm")}>
                                                {document.customerRelated?.name || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Địa chỉ</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-sm")}>
                                                {document.customerRelated?.address || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Mã số thuế</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-sm")}>
                                                {document.customerRelated?.taxCode || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Điện thoại</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-sm")}>
                                                {document.customerRelated?.phone || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={tableHeaderClass}>Email</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-blue-700 underline text-sm")}>
                                                {document.customerRelated?.email || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={classNames(tableHeaderClass, "font-bold align-top")}>Phạm vi yêu cầu giám định:</td>
                                        <td className={classNames(tableDataClass, "text-[#1e3a8a] text-sm")}>
                                            Máy móc, thiết bị đã qua sử dụng nhập khẩu quy định tại Điều 6, Quyết định số 18/2019/QĐ-TTg ngày 19 tháng 4 năm 2019 của Thủ tướng Chính Phủ.
                                        </td>
                                    </tr>

                                    <tr className="border border-gray-300">
                                        <td className="w-full p-3 text-sm text-[#1e3a8a] italic font-light leading-relaxed text-justify" colSpan={2}>
                                            Khách hàng cam kết nhập khẩu máy móc, thiết bị đã qua sử dụng nêu trên để trực tiếp
                                            phục vụ hoạt động sản xuất tại Doanh nghiệp; máy móc, thiết bị đáp ứng yêu cầu về an
                                            toàn, tiết kiệm năng lượng, bảo vệ môi trường; chịu trách nhiệm trước pháp luật về cam
                                            kết này và tính chính xác của các thông tin cung cấp. Cam kết thực hiện đúng theo các
                                            quy định pháp luật liên quan đến việc nhập khẩu hàng hóa của Khách hàng.
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={classNames(tableHeaderClass, "font-bold")}>Hàng hóa yêu cầu giám định:</td>
                                        <td className={classNames(tableDataClass, italicTextClass, "text-sm")}>Theo danh mục đính kèm</td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={classNames(tableHeaderClass, "font-bold")}>Thuộc vận đơn số:</td>
                                        <td className={classNames(tableDataClass, "flex justify-between items-center")}>
                                            <span className={classNames(inputClass, "flex-grow mr-2 text-sm")}>
                                                {document.billOfLading || ''}
                                            </span>
                                            <span className={classNames(italicTextClass, "text-sm")}>Ngày:</span>
                                            <span className={classNames(inputClass, "text-sm w-[100px] italic")}>
                                                {document.billOfLadingDate || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={classNames(tableHeaderClass, "font-bold")}>Thuộc tờ khai số:</td>
                                        <td className={classNames(tableDataClass, "flex justify-between items-center")}>
                                            <span className={classNames(inputClass, "flex-grow mr-2 text-sm")}>
                                                {document.declarationNo || ''}
                                            </span>
                                            <span className={classNames(italicTextClass, "text-sm")}>Ngày:</span>
                                            <span className={classNames(inputClass, "text-sm w-[100px] italic")}>
                                                {document.declarationDate || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={classNames(tableHeaderClass, "font-bold")}>Thuộc hóa đơn số:</td>
                                        <td className={classNames(tableDataClass, "flex justify-between items-center")}>
                                            <span className={classNames(inputClass, "flex-grow mr-2 text-sm")}>
                                                {document.invoiceNo || ''}
                                            </span>
                                            <span className={classNames(italicTextClass, "text-sm")}>Ngày:</span>
                                            <span className={classNames(inputClass, "text-sm w-[100px] italic")}>
                                                {document.invoiceDate || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={classNames(tableHeaderClass, "font-bold")}>Dự kiến thời gian giám định:</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-sm")}>
                                                {document.inspectionDate || ''}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className={classNames(tableHeaderClass, "font-bold")}>Dự kiến địa điểm giám định:</td>
                                        <td className={tableDataClass}>
                                            <span className={classNames(inputClass, "text-sm")}>
                                                {document.inspectionLocation || ''}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}
                    {activeTab === 'goodsInfo' && (
                        <MachineInfoSectionView
                            dossierId={String(document.dossierId)}
                            isActive={activeTab === 'goodsInfo'}
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

export default DossierViewModal;
