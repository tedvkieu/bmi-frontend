"use client"
import { dossierApi } from "@/app/admin/services/dossierApi";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, ChangeEvent } from "react";
import classNames from 'classnames';
import DossierNav from './DossierNav';
import { DossierDetails } from "@/app/types/dossier";
import MachineInfoSection from "./MachineInfoSection";
import Image from "next/image";
import toast from "react-hot-toast";

export default function DossierDetail() {
    const { id } = useParams();
    const [dossier, setDossier] = useState<DossierDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('generalInfo');

    const fetchDossier = useCallback(async () => {
        let dossierId: string = '';
        if (Array.isArray(id)) {
            dossierId = id[0];
        } else if (typeof id === 'string') {
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDossier(prevDossier => {
            if (!prevDossier) return null;

            // Handle nested properties for customerSubmit
            if (name.startsWith("customerSubmit.")) {
                const customerSubmitField = name.split('.')[1];
                return {
                    ...prevDossier,
                    customerSubmit: {
                        ...prevDossier.customerSubmit,
                        [customerSubmitField]: value
                    }
                };
            }

            return {
                ...prevDossier,
                [name]: value
            };
        });
    };

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDossier(prevDossier => {
            if (!prevDossier) return null;
            return {
                ...prevDossier,
                [name]: value
            };
        });
    };

    const handleSave = async () => {
        if (!dossier) return;

        const dossierId = Array.isArray(id) ? id[0] : typeof id === "string" ? id : dossier.dossierId?.toString();

        if (!dossierId) {
            toast.error("Không xác định được hồ sơ cần cập nhật");
            return;
        }

        setSaving(true);
        try {
            const submitId = dossier.customerSubmit?.id ? Number(dossier.customerSubmit.id) : NaN;
            const relatedId = dossier.customerRelated?.id ? Number(dossier.customerRelated.id) : NaN;

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
            setDossier(updated as DossierDetails);
            toast.success("Đã lưu thông tin hồ sơ");
        } catch (error: any) {
            const message = error?.message || "Lưu thông tin hồ sơ thất bại";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const editableInputClass = "w-full border-b border-gray-500 text-[#1e3a8a] outline-none px-1 text-sm";
    const tableHeaderClass = "w-1/3 p-2 text-[#1e3a8a] bg-gray-50 border-r border-gray-300 text-sm";
    const tableDataClass = "w-2/3 p-2 text-sm";
    const italicTextClass = "italic text-[#1e3a8a] text-sm";

    if (loading) {
        return <div className="text-center p-4 text-gray-700 text-base">Đang tải thông tin hồ sơ...</div>;
    }

    if (!dossier) {
        return <div className="text-center p-4 text-red-600 text-base">Không tìm thấy hồ sơ.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <DossierNav activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-grow w-full mx-auto -mt-px p-4 bg-white border border-gray-300 shadow-lg font-sans text-base text-gray-800">

                {activeTab === 'generalInfo' && (
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
                                        <input
                                            type="text"
                                            name="customerSubmit.name"
                                            value={dossier.customerSubmit.name || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "text-[#1e3a8a] text-sm")}
                                        />
                                    </td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className={tableHeaderClass}>Địa chỉ</td>
                                    <td className={tableDataClass}>
                                        <input
                                            type="text"
                                            name="customerSubmit.address"
                                            value={dossier.customerSubmit.address || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "text-sm")}
                                        />
                                    </td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className={tableHeaderClass}>Mã số thuế</td>
                                    <td className={tableDataClass}>
                                        <input
                                            type="text"
                                            name="customerSubmit.taxCode"
                                            value={dossier.customerSubmit.taxCode || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "text-sm")}
                                        />
                                    </td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className={tableHeaderClass}>Người liên hệ/ Điện thoại</td>
                                    <td className={tableDataClass}>
                                        <input
                                            type="text"
                                            name="contact"
                                            value={dossier.contact || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "text-sm")}
                                        />
                                    </td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className={tableHeaderClass}>Email nhận hóa đơn:</td>
                                    <td className={tableDataClass}>
                                        <input
                                            type="email"
                                            name="customerSubmit.email"
                                            value={dossier.customerSubmit.email || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "text-blue-700 underline text-sm")}
                                        />
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
                                        <input
                                            type="text"
                                            name="billOfLading"
                                            value={dossier.billOfLading || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "flex-grow mr-2 text-sm")}
                                        />
                                        <span className={classNames(italicTextClass, "text-sm")}>Ngày:</span>
                                        <input
                                            type="date"
                                            name="billOfLadingDate"
                                            value={dossier.billOfLadingDate || ''}
                                            onChange={handleDateChange}
                                            className={classNames(editableInputClass, "text-sm w-[100px] italic")}
                                        />
                                    </td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className={classNames(tableHeaderClass, "font-bold")}>Thuộc tờ khai số:</td>
                                    <td className={classNames(tableDataClass, "flex justify-between items-center")}>
                                        <input
                                            type="text"
                                            name="declarationNo"
                                            value={dossier.declarationNo || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "flex-grow mr-2 text-sm")}
                                        />
                                        <span className={classNames(italicTextClass, "text-sm")}>Ngày:</span>
                                        <input
                                            type="date"
                                            name="declarationDate"
                                            value={dossier.declarationDate || ''}
                                            onChange={handleDateChange}
                                            className={classNames(editableInputClass, "text-sm w-[100px] italic")}
                                        />
                                    </td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className={classNames(tableHeaderClass, "font-bold")}>Thuộc hóa đơn số:</td>
                                    <td className={classNames(tableDataClass, "flex justify-between items-center")}>
                                        <input
                                            type="text"
                                            name="invoiceNo"
                                            value={dossier.invoiceNo || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "flex-grow mr-2 text-sm")}
                                        />
                                        <span className={classNames(italicTextClass, "text-sm")}>Ngày:</span>
                                        <input
                                            type="date"
                                            name="invoiceDate"
                                            value={dossier.invoiceDate || ''}
                                            onChange={handleDateChange}
                                            className={classNames(editableInputClass, "text-sm w-[100px] italic")}
                                        />
                                    </td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className={classNames(tableHeaderClass, "font-bold")}>Dự kiến thời gian giám định:</td>
                                    <td className={tableDataClass}>
                                        <input
                                            type="text"
                                            name="inspectionDate"
                                            value={dossier.inspectionDate || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "text-sm")}
                                        />
                                    </td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className={classNames(tableHeaderClass, "font-bold")}>Dự kiến địa điểm giám định:</td>
                                    <td className={tableDataClass}>
                                        <input
                                            type="text"
                                            name="inspectionLocation"
                                            value={dossier.inspectionLocation || ''}
                                            onChange={handleInputChange}
                                            className={classNames(editableInputClass, "text-sm")}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-5 mb-3 text-[#1e3a8a]">
                            <p className="font-bold text-center mb-2">Chứng từ kèm theo:</p>
                            <div className="grid grid-cols-3 gap-y-2 text-sm mx-auto">
                                <div className="flex items-center justify-start">
                                    <input type="checkbox" id="contract" name="contract" className="mr-2 accent-[#1e3a8a]" />
                                    <label htmlFor="contract">Hợp đồng</label>
                                </div>
                                <div className="flex items-center justify-start">
                                    <input type="checkbox" id="pl" name="pl" className="mr-2 accent-[#1e3a8a]" />
                                    <label htmlFor="pl">P/L</label>
                                </div>
                                <div className="flex items-center justify-start">
                                    <input type="checkbox" id="co" name="co" className="mr-2 accent-[#1e3a8a]" />
                                    <label htmlFor="co">C/O</label>
                                </div>
                                <div className="flex items-center justify-start">
                                    <input type="checkbox" id="bl" name="bl" className="mr-2 accent-[#1e3a8a]" />
                                    <label htmlFor="bl">B/L</label>
                                </div>
                                <div className="flex items-center justify-start">
                                    <input type="checkbox" id="iv" name="iv" className="mr-2 accent-[#1e3a8a]" />
                                    <label htmlFor="iv">I/V</label>
                                </div>
                                <div className="flex items-center justify-start">
                                    <input type="checkbox" id="cq" name="cq" className="mr-2 accent-[#1e3a8a]" />
                                    <label htmlFor="cq">C/Q</label>
                                </div>
                                <div className="flex items-center justify-start">
                                    <input type="checkbox" id="xnkDeclaration" name="xnkDeclaration" className="mr-2 accent-[#1e3a8a]" />
                                    <label htmlFor="xnkDeclaration">Tờ khai hàng hóa XNK</label>
                                </div>
                                <div className="flex items-center justify-start">
                                    <input type="checkbox" id="manufacturerDocs" name="manufacturerDocs" className="mr-2 accent-[#1e3a8a]" />
                                    <label htmlFor="manufacturerDocs">Hồ sơ của nhà sản xuất</label>
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
                                <p className="font-bold text-lg mt-2 text-[#1e3a8a] font-bold">TỔ CHỨC GIÁM ĐỊNH</p>
                                <p className="italic text-center mt-1 text-sm text-[#1e3a8a]">(Công ty Bảo Minh đồng ý tiếp nhận yêu cầu giám định.)</p>
                            </div>
                            <div className="flex flex-col items-center text-[#1e3a8a]  w-1/2 pl-3">
                                <p className="text-right w-full pr-6 text-sm">
                                    Đồng Nai, ngày
                                </p>
                                <p className="font-bold text-lg mt-2 font-bold">ĐƠN VỊ/ NGƯỜI YÊU CẦU</p>
                                <p className="italic text-center mt-1 text-sm">(Đồng ý các điều kiện chung để thực hiện giám định)</p>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'goodsInfo' && (
                    <>
                        <MachineInfoSection
                            dossierId={id as string}
                            isActive={activeTab === 'goodsInfo'}
                        />

                    </>
                )}
            </div>
        </div>
    );
}
