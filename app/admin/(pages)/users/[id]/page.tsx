'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/admin/component/ui/button';
import { Input } from '@/app/admin/component/ui/input';
import { Label } from '@/app/admin/component/ui/label';
import { Textarea } from '@/app/admin/component/ui/textarea';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/app/admin/component/ui/tabs';
import {
    ArrowLeft,
    User,
    Award,
    Edit,
    Save,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userApi, type UserResponse } from '@/app/admin/services/userApi';
import InspectorProfile from '@/app/admin/component/InspectorProfile';

interface UserDetailPageProps {
    params: {
        id: string;
    };
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
    const userId = parseInt(params.id);
    const router = useRouter();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        note: '',
        isActive: true
    });

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            const userData = await userApi.getById(userId);
            setUser(userData);
            setEditForm({
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone || '',
                dob: userData.dob || '',
                note: userData.note || '',
                isActive: userData.isActive
            });
        } catch (error: any) {
            toast.error('Không thể tải thông tin người dùng');
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleSave = async () => {
        try {
            if (!user) return;

            await userApi.update(userId, {
                ...editForm,
                role: user.role,
                passwordHash: undefined
            });

            toast.success('Cập nhật thông tin thành công');
            setIsEditing(false);
            fetchUser();
        } catch (error: any) {
            toast.error('Không thể cập nhật thông tin');
            console.error('Error updating user:', error);
        }
    };

    const handleCancel = () => {
        if (user) {
            setEditForm({
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || '',
                dob: user.dob || '',
                note: user.note || '',
                isActive: user.isActive
            });
        }
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Không tìm thấy thông tin người dùng</p>
                <Button onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            </div>
        );
    }

    const roleDisplayNames: Record<string, string> = {
        ADMIN: "Admin",
        MANAGER: "Quản lý",
        INSPECTOR: "Kiểm định viên",
        DOCUMENT_STAFF: "Nhân viên tài liệu",
        ISO_STAFF: "Nhân viên ISO",
        CUSTOMER: "Khách hàng",
        GUEST: "Khách",
    };

    const roleColors: Record<string, { bg: string; text: string }> = {
        ADMIN: { bg: "bg-red-100", text: "text-red-800" },
        MANAGER: { bg: "bg-purple-100", text: "text-purple-800" },
        INSPECTOR: { bg: "bg-yellow-100", text: "text-yellow-800" },
        DOCUMENT_STAFF: { bg: "bg-blue-100", text: "text-blue-800" },
        ISO_STAFF: { bg: "bg-indigo-100", text: "text-indigo-800" },
        CUSTOMER: { bg: "bg-green-100", text: "text-green-800" },
        GUEST: { bg: "bg-gray-100", text: "text-gray-800" },
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                        <p className="text-gray-600">{roleDisplayNames[user.role]}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="w-4 h-4 mr-2" />
                                Hủy
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                Lưu
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Thông tin cá nhân
                    </TabsTrigger>
                    <TabsTrigger value="competency" className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Năng lực chuyên môn
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="fullName">Họ và tên</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={isEditing ? editForm.fullName : user.fullName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={isEditing ? editForm.email : user.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={isEditing ? editForm.phone : user.phone || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dob">Ngày sinh</Label>
                                <Input
                                    id="dob"
                                    name="dob"
                                    type="date"
                                    value={isEditing ? editForm.dob : user.dob || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="username">Tên đăng nhập</Label>
                                <Input
                                    id="username"
                                    value={user.username}
                                    disabled
                                    className="mt-1 bg-gray-50"
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">Vị trí</Label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role].bg} ${roleColors[user.role].text}`}>
                                        {roleDisplayNames[user.role]}
                                    </span>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="note">Ghi chú</Label>
                                <Textarea
                                    id="note"
                                    name="note"
                                    value={isEditing ? editForm.note : user.note || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={isEditing ? editForm.isActive : user.isActive}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <Label htmlFor="isActive" className="ml-2">
                                    Tài khoản hoạt động
                                </Label>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Competency Tab */}
                <TabsContent value="competency" className="space-y-6">
                    <InspectorProfile userId={userId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
