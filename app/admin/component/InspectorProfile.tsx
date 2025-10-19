'use client';

import { useState, useEffect, useCallback } from 'react';
import { competencyApi, UserCertification, UserProductCategory, Certification, ProductCategory } from '@/app/admin/services/competencyApi';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/app/admin/component/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/app/admin/component/ui/table';
import {
    Award,
    Package,
    Calendar,
    FileText,
    Building,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

interface InspectorProfileProps {
    userId: number;
}

export default function InspectorProfile({ userId }: InspectorProfileProps) {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
    const [userProductCategories, setUserProductCategories] = useState<UserProductCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Load all data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [userCerts, userCategories, certs, categories] = await Promise.all([
                competencyApi.getUserCertifications(userId),
                competencyApi.getUserProductCategories(userId),
                competencyApi.getCertifications({ limit: 1000 }),
                competencyApi.getProductCategories({ limit: 1000 })
            ]);

            setUserCertifications(userCerts);
            setUserProductCategories(userCategories);
            setCertifications(certs.data);
            setProductCategories(categories.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Get certification name by ID
    const getCertificationName = (certificationId: number) => {
        const cert = certifications.find(c => c.certificationId === certificationId);
        return cert ? cert.name : 'Unknown';
    };

    // Get product category name by ID
    const getProductCategoryName = (productCategoryId: number) => {
        const category = productCategories.find(c => c.productCategoryId === productCategoryId);
        return category ? category.name : 'Unknown';
    };

    // Check if certification is expired
    const isCertificationExpired = (expiryDate?: string) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    // Check if certification is expiring soon (within 30 days)
    const isCertificationExpiringSoon = (expiryDate?: string) => {
        if (!expiryDate) return false;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return new Date(expiryDate) <= thirtyDaysFromNow && new Date(expiryDate) > new Date();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải thông tin năng lực...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Năng lực chuyên môn</h2>
                <p className="text-gray-600">Thông tin chứng chỉ và nhóm sản phẩm của giám định viên</p>
            </div>

            <Tabs defaultValue="certifications" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="certifications" className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Chứng chỉ ({userCertifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Nhóm sản phẩm ({userProductCategories.length})
                    </TabsTrigger>
                </TabsList>

                {/* Certifications Tab */}
                <TabsContent value="certifications" className="space-y-4">
                    {userCertifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Chưa có chứng chỉ nào được gán</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên chứng chỉ</TableHead>
                                        <TableHead>Ngày cấp</TableHead>
                                        <TableHead>Ngày hết hạn</TableHead>
                                        <TableHead>Số chứng chỉ</TableHead>
                                        <TableHead>Tổ chức cấp</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userCertifications.map((userCert) => {
                                        const isExpired = isCertificationExpired(userCert.expiryDate);
                                        const isExpiringSoon = isCertificationExpiringSoon(userCert.expiryDate);

                                        return (
                                            <TableRow key={`${userCert.userId}-${userCert.certificationId}`}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Award className="w-4 h-4 text-blue-600" />
                                                        {getCertificationName(userCert.certificationId)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {userCert.obtainedDate ? new Date(userCert.obtainedDate).toLocaleDateString('vi-VN') : '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {userCert.expiryDate ? new Date(userCert.expiryDate).toLocaleDateString('vi-VN') : '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        {userCert.certificateNumber || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-gray-400" />
                                                        {userCert.issuingOrganization || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {isExpired ? (
                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                        ) : isExpiringSoon ? (
                                                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        )}
                                                        <span className={`px-2 py-1 rounded-full text-xs ${isExpired
                                                            ? 'bg-red-100 text-red-800'
                                                            : isExpiringSoon
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : userCert.isActive
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {isExpired
                                                                ? 'Hết hạn'
                                                                : isExpiringSoon
                                                                    ? 'Sắp hết hạn'
                                                                    : userCert.isActive
                                                                        ? 'Hoạt động'
                                                                        : 'Không hoạt động'
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                {/* Product Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    {userProductCategories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Chưa có nhóm sản phẩm nào được gán</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên nhóm sản phẩm</TableHead>
                                        <TableHead>Ngày gán</TableHead>
                                        <TableHead>Mức kinh nghiệm</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userProductCategories.map((userCategory) => (
                                        <TableRow key={`${userCategory.userId}-${userCategory.productCategoryId}`}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-blue-600" />
                                                    {getProductCategoryName(userCategory.productCategoryId)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {userCategory.assignedDate ? new Date(userCategory.assignedDate).toLocaleDateString('vi-VN') : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${userCategory.experienceLevel === 'expert' ? 'bg-purple-100 text-purple-800' :
                                                    userCategory.experienceLevel === 'advanced' ? 'bg-blue-100 text-blue-800' :
                                                        userCategory.experienceLevel === 'intermediate' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {userCategory.experienceLevel ? userCategory.experienceLevel.charAt(0).toUpperCase() + userCategory.experienceLevel.slice(1) : '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate" title={userCategory.notes || ''}>
                                                    {userCategory.notes || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {userCategory.isActive ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                    )}
                                                    <span className={`px-2 py-1 rounded-full text-xs ${userCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {userCategory.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng chứng chỉ</p>
                            <p className="text-2xl font-semibold">{userCertifications.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Nhóm sản phẩm</p>
                            <p className="text-2xl font-semibold">{userProductCategories.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Chứng chỉ hoạt động</p>
                            <p className="text-2xl font-semibold">
                                {userCertifications.filter(uc => uc.isActive && !isCertificationExpired(uc.expiryDate)).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}