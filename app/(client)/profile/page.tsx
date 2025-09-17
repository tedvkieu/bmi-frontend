"use client";

import { useEffect, useState } from "react";
import { authApi, User } from "../../services/authApi";
import { useRouter } from "next/navigation";
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon, // Giữ lại icon dù trường DOB đã bị loại bỏ theo yêu cầu của bạn, để dễ dàng thêm lại nếu cần
    MapPinIcon, // Giữ lại icon
    PencilSquareIcon,
    ClipboardDocumentListIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

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

    const handleLogout = () => {
        authApi.clearAuthData();
        router.push("/");
    };

    // Hàm formatDOB này không còn được sử dụng do trường DOB đã bị loại bỏ khỏi UI theo yêu cầu của bạn
    // nhưng tôi vẫn giữ lại nó trong trường hợp bạn muốn thêm lại DOB vào sau này.
    const formatDOB = (dobString: string | undefined) => {
        if (!dobString) return "Chưa cập nhật";
        try {
            const date = new Date(dobString);
            return date.toLocaleDateString("vi-VN");
        } catch {
            return dobString;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-base text-gray-600 animate-pulse">Đang tải hồ sơ...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-base text-red-500">Bạn chưa đăng nhập.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-8 sm:px-8 sm:py-10 flex flex-col items-center">
                    {/* Header: User Avatar, Name, Role */}
                    <div className="text-center mb-6">
                        <UserCircleIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" /> {/* Avatar Placeholder */}
                        <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
                        <p className="text-sm text-blue-600 font-medium">{user.role === "CUSTOMER" ? "Khách hàng" : user.role}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="w-full max-w-lg space-y-4 mb-8">
                        <InfoCard icon={<EnvelopeIcon className="w-5 h-5 text-gray-500" />} label="Email" value={user.email} />
                        <InfoCard icon={<PhoneIcon className="w-5 h-5 text-gray-500" />} label="Số điện thoại" value="Chưa cập nhật" />
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <ActionButton onClick={() => router.push("/profile/edit")} color="blue" icon={<PencilSquareIcon className="w-5 h-5 mr-2" />}>
                            Chỉnh sửa
                        </ActionButton>
                        <ActionButton onClick={() => alert("Xem lịch sử giao dịch")} color="indigo" icon={<ClipboardDocumentListIcon className="w-5 h-5 mr-2" />}>
                            Lịch sử
                        </ActionButton>
                        <ActionButton onClick={handleLogout} color="red" icon={<ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />}>
                            Đăng xuất
                        </ActionButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center p-3 rounded-md border border-gray-200 bg-white">
            <div className="mr-3 flex-shrink-0">{icon}</div>
            <div>
                <span className="block text-xs text-gray-500">{label}</span>
                <span className="block text-sm font-medium text-gray-800">{value}</span>
            </div>
        </div>
    );
}

function ActionButton({ onClick, color, icon, children }: { onClick: () => void; color: string; icon: React.ReactNode; children: React.ReactNode }) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-500 hover:bg-blue-600",
        indigo: "bg-indigo-500 hover:bg-indigo-600",
        red: "bg-red-500 hover:bg-red-600",
    };
    return (
        <button
            onClick={onClick}
            className={`${colorMap[color]} text-white text-sm font-semibold py-2.5 px-4 rounded-md transition-colors duration-200 shadow-sm flex items-center justify-center`}
        >
            {icon} {children}
        </button>
    );
}