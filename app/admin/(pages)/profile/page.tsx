"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    PencilSquareIcon,
    FolderIcon,
    BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { authApi, User } from "@/app/services/authApi";
import AdminLayout from "../../component/AdminLayout";
import LoadingSpinner from "../../component/document/LoadingSpinner";


// --- Customer Details Interface ---
interface CustomerDetails {
    customerId: number;
    name: string;
    address: string;
    email: string;
    dob: string;
    phone: string;
    note: string | null;
    taxCode: string;
    customerType: string;
    createdAt: string;
    updatedAt: string;
}

// --- Staff Details Interface (Assuming a similar structure for users API) ---
interface StaffDetails {
    userId: number; // or employeeId, etc.
    username: string;
    email: string;
    phoneNumber: string | null;
    address: string | null;
    // Add other fields relevant to staff/admin users
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = authApi.getUser();
        if (storedUser) {
            setUser(storedUser);
        } else {
            router.push("/auth/login");
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
           <LoadingSpinner />
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-lg text-red-600 font-normal">
                    Bạn chưa đăng nhập. Vui lòng đăng nhập lại.
                </div>
            </div>
        );
    }

    return (
        <>
            <AdminLayout>
                <div className="w-full">
                    <div className="">
                        <div className="overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
                            {/* Main Content Area */}
                            <div className="lg:w-3/4 p-6 lg:p-10 bg-gray-50">
                                    <OverviewSection user={user} router={router} />
                            </div>
                        </div>
                    </div>
                    <div className="h-20" />
                </div>
            </AdminLayout>
        </>

    );
}


function InfoCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex flex-col p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="mb-2 text-gray-500">{icon}</div>
            <span className="block text-xs font-normal text-gray-500 mb-1">
                {label}
            </span>
            <span className="block text-sm font-normal text-gray-900">
                {value}
            </span>
        </div>
    );
}

function OverviewSection({ user, router }: { user: User; router: any }) {
    const [additionalDetails, setAdditionalDetails] = useState<CustomerDetails | StaffDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdditionalDetails = async () => {
            if (!user || !user.userId) {
                setLoadingDetails(false);
                return;
            }

            setLoadingDetails(true);
            setErrorDetails(null);

            let apiUrl = '';
            if (user.role === "SERVICE_MANAGER" || user.role === "IMPORTER") {
                apiUrl = `/api/customers/${user.userId}`;
            } else {
                apiUrl = `/api/users/${user.userId}`;
            }

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch details for ${user.role} with ID ${user.userId}`);
                }
                const data = await response.json();
                setAdditionalDetails(data);
            } catch (error: any) {
                console.error("Error fetching additional details:", error);
                setErrorDetails("Không thể tải thêm thông tin chi tiết. Vui lòng thử lại.");
                toast.error("Lỗi: Không thể tải thông tin chi tiết!");
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchAdditionalDetails();
    }, [user]);

    if (loadingDetails) {
        return (
            <div className="animate-fade-in flex items-center justify-center h-48">
                <div className="text-lg text-gray-600 animate-pulse font-normal">
                    Đang tải thông tin chi tiết...
                </div>
            </div>
        );
    }

    if (errorDetails) {
        return (
            <div className="animate-fade-in bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-md text-base" role="alert">
                <strong className="font-normal">Lỗi!</strong>
                <span className="block sm:inline ml-2">{errorDetails}</span>
            </div>
        );
    }

    const isCustomer = user.role === "SERVICE_MANAGER" || user.role === "IMPORTER";
    const displayAddress = additionalDetails?.address || user.address || "Chưa cập nhật";
    const displayName = isCustomer ? (additionalDetails as CustomerDetails)?.name || user.username : user.username;
    const displayEmail = isCustomer ? (additionalDetails as CustomerDetails)?.email || user.email : user.email;
    const displayPhone = isCustomer ? (additionalDetails as CustomerDetails)?.phone || user.phoneNumber : user.phoneNumber;
    const displayTaxCode = isCustomer ? (additionalDetails as CustomerDetails)?.taxCode : null;
    const displayDob = isCustomer ? (additionalDetails as CustomerDetails)?.dob : null;


    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-blue-600">
                Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <InfoCard
                    icon={<UserCircleIcon className="w-6 h-6 text-indigo-600" />}
                    label="Tên người dùng"
                    value={displayName}
                />
                <InfoCard
                    icon={<EnvelopeIcon className="w-6 h-6 text-green-600" />}
                    label="Email"
                    value={displayEmail}
                />
                <InfoCard
                    icon={<PhoneIcon className="w-6 h-6 text-purple-600" />}
                    label="Số điện thoại"
                    value={displayPhone || "Chưa cập nhật"}
                />
                <InfoCard
                    icon={<BuildingOffice2Icon className="w-6 h-6 text-red-600" />}
                    label="Địa chỉ"
                    value={displayAddress}
                />
                {displayTaxCode && (
                    <InfoCard
                        icon={<FolderIcon className="w-6 h-6 text-yellow-600" />}
                        label="Mã số thuế"
                        value={displayTaxCode}
                    />
                )}
                {displayDob && (
                    <InfoCard
                        icon={<PencilSquareIcon className="w-6 h-6 text-orange-600" />}
                        label="Ngày sinh"
                        value={new Date(displayDob).toLocaleDateString("vi-VN")}
                    />
                )}
            </div>
            <button
                onClick={() => router.push("/profile/edit")}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-normal rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all duration-200"
            >
                <PencilSquareIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                Chỉnh sửa thông tin
            </button>
        </div>
    );
}
