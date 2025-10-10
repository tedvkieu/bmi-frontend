"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerApi } from "../../../services/customerApi"; // Make sure this path is correct
import toast from "react-hot-toast";
import { Edit2 } from "lucide-react";
import LoadingSpinner from "@/app/admin/component/document/LoadingSpinner"; // Make sure this path is correct
import AdminLayout from "@/app/admin/component/AdminLayout"; // Make sure this path is correct
import Breadcrumb from "@/app/admin/component/breadcrumb/Breadcrumb";

export type Customer = {
    customerId: number;
    name: string;
    address: string;
    email: string;
    dob: string | null;
    phone: string | null;
    note: string | null;
    taxCode: string;
    customerType: "IMPORTER" | "SERVICE_MANAGER";
    createdAt: string;
    updatedAt: string;
};

// Define the request body type based on your Java DTO
export type CustomerUpdateRequest = {
    name: string;
    address: string;
    email: string; // Email is not editable in UI but backend DTO includes it
    dob: string | null;
    phone: string | null;
    note: string | null;
    taxCode: string; // Tax code is also in backend DTO, but not in UI form
    customerType: "IMPORTER" | "SERVICE_MANAGER";
};

const EditCustomerPage = () => {
    const params = useParams();
    const router = useRouter();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    // Use the update request type for formData
    const [formData, setFormData] = useState<Partial<CustomerUpdateRequest>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (customerId) {
            const fetchCustomer = async () => {
                try {
                    setLoading(true);
                    setError(null); // Clear previous errors
                    const data = await customerApi.getCustomerById(parseInt(customerId));
                    // Assuming getCustomerById returns a single customer object,
                    // not an array. Adjust if your API returns an array.
                    const customerData: Customer = Array.isArray(data) ? data[0] : data;
                    setCustomer(customerData);

                    // Initialize form data with existing customer data
                    setFormData({
                        name: customerData?.name ?? "",
                        address: customerData?.address ?? "",
                        email: customerData?.email ?? "", // Include email for the DTO, even if not editable
                        dob: customerData?.dob ? new Date(customerData.dob).toISOString().split('T')[0] : '',
                        phone: customerData?.phone ?? "",
                        note: customerData?.note ?? "",
                        taxCode: customerData?.taxCode ?? "", // Include taxCode for the DTO
                        customerType: customerData?.customerType ?? "",
                    });
                } catch (err: any) {
                    setError(err.message || "Không thể tải thông tin khách hàng.");
                    toast.error(err.message || "Lỗi khi tải thông tin khách hàng!");
                } finally {
                    setLoading(false);
                }
            };
            fetchCustomer();
        }
    }, [customerId]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission behavior
        setIsSubmitting(true);
        setError(null); // Clear previous errors

        // Basic validation
        if (!formData.name || !formData.customerType) {
            toast.error("Vui lòng nhập Tên khách hàng và chọn Loại khách hàng.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Ensure customerId is a number
            const id = parseInt(customerId);
            if (isNaN(id)) {
                throw new Error("ID khách hàng không hợp lệ.");
            }

            // Prepare the data for the backend
            const updatePayload: CustomerUpdateRequest = {
                name: formData.name,
                address: formData.address || "",
                email: formData.email || "", // Use existing email from initial load
                dob: formData.dob || null,
                phone: formData.phone || null,
                note: formData.note || null,
                taxCode: formData.taxCode || "", // Use existing taxCode from initial load
                customerType: formData.customerType as "IMPORTER" | "SERVICE_MANAGER",
            };

            await customerApi.updateCustomer(id, updatePayload); // This method needs to be implemented in customerApi
            toast.success("Cập nhật thông tin khách hàng thành công!");
            router.push("/admin/khachhang"); // Redirect to customer list after successful update
        } catch (err: any) {
            console.error("Lỗi khi cập nhật khách hàng:", err);
            setError(err.message || "Lỗi khi cập nhật thông tin khách hàng.");
            toast.error(err.message || "Không thể cập nhật thông tin khách hàng.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 text-red-600 bg-red-50 rounded-lg max-w-md mx-auto my-10">
                <p className="font-semibold">Lỗi:</p>
                <p>{error}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center p-6 text-gray-600 bg-gray-50 rounded-lg max-w-md mx-auto my-10">
                <p>Không tìm thấy khách hàng.</p>
                <button
                    onClick={() => router.push("/admin/khachhang")}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Về danh sách khách hàng
                </button>
            </div>
        );
    }
    return (
        <AdminLayout>
            <Breadcrumb pageName="Khách hàng" pageNameSecond="Chỉnh sửa khách hàng" pageHref="/admin/khachhang" />

            <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                    <Edit2 size={20} className="text-blue-500" />
                    <h2 className="text-xl font-bold text-blue-500">
                        Chỉnh sửa thông tin khách hàng
                    </h2>
                </div>


                <form className="space-y-5 text-gray-600" onSubmit={handleSubmit}> {/* Add onSubmit handler here */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Tên khách hàng */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm text-gray-700 mb-1"
                            >
                                Tên khách hàng
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name || ""}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-light"
                                required
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            {/* Display email from the initial customer object, as it's not in formData for direct editing */}
                            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm text-gray-600">
                                {customer.email || "—"}
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm text-gray-700 mb-1"
                            >
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone || ""}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        {/* Loại khách hàng */}
                        <div>
                            <label
                                htmlFor="customerType"
                                className="block text-sm text-gray-700 mb-1"
                            >
                                Loại khách hàng
                            </label>
                            <select
                                id="customerType"
                                name="customerType"
                                value={formData.customerType || ""}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                            >
                                <option value="">Chọn loại khách hàng</option>
                                <option value="IMPORTER">Nhà nhập khẩu</option>
                                <option value="SERVICE_MANAGER">Quản lý dịch vụ</option>
                            </select>
                        </div>

                        {/* Ngày sinh */}
                        <div>
                            <label
                                htmlFor="dob"
                                className="block text-sm text-gray-700 mb-1"
                            >
                                Ngày sinh (Tùy chọn)
                            </label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={formData.dob || ""}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        {/* Địa chỉ */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="address"
                                className="block text-sm text-gray-700 mb-1"
                            >
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address || ""}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="note"
                                className="block text-sm text-gray-700 mb-1"
                            >
                                Ghi chú
                            </label>
                            <textarea
                                id="note"
                                name="note"
                                rows={3}
                                value={formData.note || ""}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-5 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm border border-transparent rounded-md shadow-sm text-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditCustomerPage;