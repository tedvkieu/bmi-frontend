"use client";

import React, { useState, useRef, Fragment, useEffect } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { FaSyncAlt } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";


export enum CustomerType {
    IMPORTER = "IMPORTER",
    SERVICE_MANAGER = "SERVICE_MANAGER",
}

const CustomerTypeDisplay: Record<CustomerType, string> = {
    [CustomerType.IMPORTER]: "Đơn vị / Công ty nhập khẩu",
    [CustomerType.SERVICE_MANAGER]: "Quản lý dịch vụ",
};

interface CustomerFormData {
    name: string;
    address: string;
    email: string;
    phone: string;
    dob: string;
    password: string;
    confirmPassword: string;
    taxCode: string; // Only required for SERVICE_MANAGER
    note: string;
    customerType: CustomerType;
}

const initialFormData: CustomerFormData = {
    name: "",
    address: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
    taxCode: "",
    note: "",
    customerType: CustomerType.IMPORTER, // Default to SERVICE_MANAGER
};

// Function to generate a random password
const generateRandomPassword = (length: number = 12): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export default function AddCustomerForm() {
    const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [useRandomPassword, setUseRandomPassword] = useState(false);
    const [randomPasswordDisplay, setRandomPasswordDisplay] = useState<string>("");

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [createdCustomerData, setCreatedCustomerData] = useState<CustomerFormData | null>(null);
    const [passwordToDisplayInModal, setPasswordToDisplayInModal] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Effect to generate initial random password when checkbox is first checked
    useEffect(() => {
        if (useRandomPassword && !randomPasswordDisplay) {
            handleGenerateNewRandomPassword();
        }
    }, [useRandomPassword, randomPasswordDisplay]);

    // Clear taxCode error when switching from SERVICE_MANAGER to IMPORTER
    useEffect(() => {
        if (formData.customerType === CustomerType.IMPORTER && errors.taxCode) {
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors.taxCode;
                return newErrors;
            });
            setFormData(prevData => ({ ...prevData, taxCode: "" })); // Clear tax code if it's no longer relevant
        }
    }, [formData.customerType]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleGenerateNewRandomPassword = () => {
        const randomPw = generateRandomPassword();
        setFormData((prevData) => ({
            ...prevData,
            password: randomPw,
            confirmPassword: randomPw,
        }));
        setRandomPasswordDisplay(randomPw);
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.password;
            delete newErrors.confirmPassword;
            return newErrors;
        });
    };

    const handleUseRandomPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setUseRandomPassword(checked);
        if (checked) {
            handleGenerateNewRandomPassword();
        } else {
            setFormData((prevData) => ({
                ...prevData,
                password: "",
                confirmPassword: "",
            }));
            setRandomPasswordDisplay("");
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors.password;
                delete newErrors.confirmPassword;
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = formData.customerType === CustomerType.IMPORTER ? "Tên khách hàng là bắt buộc." : "Tên công ty là bắt buộc.";
        if (!formData.email.trim()) {
            newErrors.email = "Email là bắt buộc.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ.";
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Số điện thoại là bắt buộc.";
        } else if (!/^\d{10,11}$/.test(formData.phone)) {
            newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số).";
        }

        if (formData.customerType === CustomerType.SERVICE_MANAGER && !formData.taxCode.trim()) {
            newErrors.taxCode = "Mã số thuế là bắt buộc cho Quản lý dịch vụ.";
        }


        if (!useRandomPassword) {
            if (!formData.password) {
                newErrors.password = "Mật khẩu là bắt buộc.";
            } else if (formData.password.length < 6) {
                newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
            }
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
            }
        } else if (!formData.password) {
            newErrors.password = "Mật khẩu ngẫu nhiên chưa được tạo.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log("Validation failed:", errors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch("/api/customers/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    address: formData.address,
                    dob: formData.dob,
                    note: formData.note,
                    taxCode: formData.customerType === CustomerType.SERVICE_MANAGER ? formData.taxCode : null, // Only send taxCode for SERVICE_MANAGER
                    customerType: formData.customerType,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                setErrors({ general: errorData.message || "Đăng ký thất bại. Vui lòng thử lại." });
                return;
            }

            setCreatedCustomerData(formData);
            setPasswordToDisplayInModal(formData.password);
            setShowConfirmationModal(true);

            setFormData(initialFormData);
            setErrors({});
            setUseRandomPassword(false);
            setRandomPasswordDisplay("");

        } catch (error) {
            console.error("Register error:", error);
            setErrors({ general: "Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(initialFormData);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setUseRandomPassword(false);
        setRandomPasswordDisplay("");
        setErrors({});
        setCreatedCustomerData(null);
        setPasswordToDisplayInModal(null);
        setShowConfirmationModal(false);
    };

    const handleCopyInfo = () => {
        if (createdCustomerData && passwordToDisplayInModal) {
            const infoToCopy = `
    Tên ${createdCustomerData.customerType === CustomerType.IMPORTER ? 'khách hàng' : 'công ty'}: ${createdCustomerData.name}
    Email: ${createdCustomerData.email}
    Mật khẩu: ${passwordToDisplayInModal}
    `.trim();
            navigator.clipboard.writeText(infoToCopy)
                .then(() => alert("Thông tin khách hàng đã được sao chép!"))
                .catch((err) => console.error("Không thể sao chép thông tin:", err));
        } else {
            alert("Không có thông tin khách hàng hoặc mật khẩu để sao chép.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            console.log("Selected file for import:", file.name);
            alert(`File "${file.name}" đã được chọn để nhập. Chức năng xử lý file chưa được triển khai.`);
        }
    };

    const inputClass = "w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-500 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500";
    const labelClass = "mb-1 block text-sm font-medium text-gray-700";
    const errorClass = "text-red-500 text-xs mt-1";
    const requiredSpan = <span className="text-red-500">*</span>;

    const isImporter = formData.customerType === CustomerType.SERVICE_MANAGER;

    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-lg p-6 sm:p-8 relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                style={{ display: 'none' }}
            />

            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tạo khách hàng mới</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {errors.general && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{errors.general}</span>
                    </div>
                )}

                <div>
                    <label htmlFor="customerType" className={labelClass}>
                    Vai trò khách hàng {requiredSpan}
                    </label>
                    <div className="relative">
                        <select
                            id="customerType"
                            name="customerType"
                            value={formData.customerType}
                            onChange={handleChange}
                            required
                            className={`${inputClass} pr-10 text-gray-700 uppercase ${errors.customerType ? 'border-red-500' : ''}`}
                        >
                            {Object.values(CustomerType).map((type) => (
                                <option key={type} value={type} className="text-gray-800">
                                    {CustomerTypeDisplay[type]}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.customerType && <p className={errorClass}>{errors.customerType}</p>}
                </div>

                <div>
                    <label htmlFor="name" className={labelClass}>
                        {isImporter ? 'Tên khách hàng' : 'Đơn vị nhập khẩu'} {requiredSpan}
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={isImporter ? "Nhập tên khách hàng" : "Nhập tên đơn vị nhập khẩu"}
                        required
                        className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="email" className={labelClass}>
                        {isImporter ? 'Email' : 'Email nhận hóa đơn'} {requiredSpan}

                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ email"
                            required
                            className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className={errorClass}>{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className={labelClass}>
                            Số điện thoại {requiredSpan}
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                            required
                            className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`}
                        />
                        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center">
                        <input
                            id="useRandomPassword"
                            name="useRandomPassword"
                            type="checkbox"
                            checked={useRandomPassword}
                            onChange={handleUseRandomPasswordChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="useRandomPassword" className="ml-2 italic flex items-center text-sm text-gray-900">
                            Tạo mật khẩu ngẫu nhiên
                        </label>
                    </div>

                    {useRandomPassword && (
                        <div className="mt-3">
                            <label htmlFor="randomPasswordDisplay" className={labelClass}>
                                Mật khẩu ngẫu nhiên {requiredSpan}
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    id="randomPasswordDisplay"
                                    value={randomPasswordDisplay}
                                    readOnly
                                    className={`${inputClass} pr-16 font-mono text-gray-700`}
                                    placeholder="Mật khẩu ngẫu nhiên sẽ hiển thị ở đây"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <button
                                        type="button"
                                        onClick={handleGenerateNewRandomPassword}
                                        className="ml-1 p-1 rounded-full text-blue-600 transition-colors"
                                        aria-label="Tạo mật khẩu ngẫu nhiên mới"
                                    >
                                        <FaSyncAlt />
                                    </button>
                                </div>
                            </div>
                            {errors.password && <p className={errorClass}>{errors.password}</p>}
                        </div>
                    )}
                </div>

                {!useRandomPassword && (
                    <>
                        <div>
                            <label htmlFor="password" className={labelClass}>
                                Mật khẩu {requiredSpan}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                    required={!useRandomPassword}
                                    minLength={6}
                                    className={`${inputClass} ${errors.password ? "border-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} strokeWidth={1.8} />
                                    ) : (
                                        <Eye size={18} strokeWidth={1.8} />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className={errorClass}>{errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className={labelClass}>
                                Xác nhận mật khẩu {requiredSpan}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required={!useRandomPassword}
                                    className={`${inputClass} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} strokeWidth={1.8} />
                                    ) : (
                                        <Eye size={18} strokeWidth={1.8} />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
                        </div>
                    </>
                )}

                {/* Conditional rendering for Tax Code and Date of Birth */}
                {isImporter ? (
                    <div>
                        <label htmlFor="dob" className={labelClass}>
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className={`${inputClass} ${errors.dob ? 'border-red-500' : ''}`}
                        />
                        {errors.dob && <p className={errorClass}>{errors.dob}</p>}
                    </div>
                ) : (
                    <div>
                        <label htmlFor="taxCode" className={labelClass}>
                            Mã số thuế {requiredSpan}
                        </label>
                        <input
                            type="text"
                            id="taxCode"
                            name="taxCode"
                            value={formData.taxCode}
                            onChange={handleChange}
                            placeholder="Nhập mã số thuế"
                            required={!isImporter} // Required only for SERVICE_MANAGER
                            className={`${inputClass} ${errors.taxCode ? 'border-red-500' : ''}`}
                        />
                        {errors.taxCode && <p className={errorClass}>{errors.taxCode}</p>}
                    </div>
                )}

                <div>
                    <label htmlFor="address" className={labelClass}>
                        
                        {isImporter ? 'Địa chỉ' : 'Địa chỉ trụ sở đơn vị'} {requiredSpan}

                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                        className={`${inputClass} ${errors.address ? 'border-red-500' : ''}`}
                    />
                    {errors.address && <p className={errorClass}>{errors.address}</p>}
                </div>

                <div>
                    <label htmlFor="note" className={labelClass}>
                        Ghi chú
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Thêm ghi chú..."
                        rows={3}
                        className={`${inputClass} ${errors.note ? 'border-red-500' : ''}`}
                    />
                    {errors.note && <p className={errorClass}>{errors.note}</p>}
                </div>


                <div className="flex justify-center gap-4 text-sm ">
                    <button
                        type="submit"
                        className="w-auto py-2 px-6 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang tạo...
                            </>
                        ) : (
                            "Tạo khách hàng"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="w-auto py-2 px-6 bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        Xóa trắng
                    </button>
                </div>
            </form>

            {/* Confirmation Modal */}
            <Transition appear show={showConfirmationModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setShowConfirmationModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-100 bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 text-center mb-4"
                                    >
                                        Thông tin khách hàng đã tạo thành công
                                    </Dialog.Title>
                                    <div className="mt-2 text-gray-700">
                                        {createdCustomerData && (
                                            <div className="space-y-2 text-sm font-normal">
                                                <p>Tên {createdCustomerData.customerType === CustomerType.IMPORTER ? 'khách hàng' : 'công ty'}: {createdCustomerData.name}</p>
                                                <p>Email: {createdCustomerData.email}</p>
                                                <p className="font-semibold text-blue-600">
                                                    Mật khẩu: {passwordToDisplayInModal}
                                                </p>
                                                {useRandomPassword && (
                                                    <p className="italic text-gray-500 text-xs">
                                                        (Mật khẩu này đã được tạo ngẫu nhiên. Vui lòng sao chép và lưu trữ.)
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={handleCopyInfo}
                                        >
                                            Sao chép thông tin
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                            onClick={() => setShowConfirmationModal(false)}
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}