'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/app/admin/component/AdminLayout';
import Breadcrumb from '@/app/admin/component/breadcrumb/Breadcrumb';
import { competencyApi, UserCertification, UserProductCategory, Certification, ProductCategory, UserCertificationFormData, UserProductCategoryFormData } from '@/app/admin/services/competencyApi';
import { Button } from '@/app/admin/component/ui/button';
import { Input } from '@/app/admin/component/ui/input';
import { Label } from '@/app/admin/component/ui/label';
import { Textarea } from '@/app/admin/component/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/app/admin/component/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/app/admin/component/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/app/admin/component/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/app/admin/component/ui/alert-dialog';
import {
    Plus,
    X,
    Award,
    Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserCompetencyPage() {
    const params = useParams();
    const userId = parseInt(params.id as string);

    const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
    const [userProductCategories, setUserProductCategories] = useState<UserProductCategory[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isAssignCertificationModalOpen, setIsAssignCertificationModalOpen] = useState(false);
    const [isAssignProductCategoryModalOpen, setIsAssignProductCategoryModalOpen] = useState(false);
    const [isDeleteCertificationDialogOpen, setIsDeleteCertificationDialogOpen] = useState(false);
    const [isDeleteProductCategoryDialogOpen, setIsDeleteProductCategoryDialogOpen] = useState(false);

    // Form data
    const [certificationFormData, setCertificationFormData] = useState<UserCertificationFormData>({
        certificationIds: [],
        obtainedDate: '',
        expiryDate: '',
        certificateNumber: '',
        issuingOrganization: ''
    });
    const [productCategoryFormData, setProductCategoryFormData] = useState<UserProductCategoryFormData>({
        productCategoryIds: [],
        assignedDate: '',
        experienceLevel: '',
        notes: ''
    });

    // Delete states
    const [deletingCertificationIds, setDeletingCertificationIds] = useState<number[]>([]);
    const [deletingProductCategoryIds, setDeletingProductCategoryIds] = useState<number[]>([]);

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            // Load all available certifications and product categories (for dropdowns)
            const certs = await competencyApi.getCertifications({ limit: 1000 });
            const categories = await competencyApi.getProductCategories({ limit: 1000 });

            // Handle different response formats
            const certsData = certs.data || certs; // Backend returns {success, data} or direct array
            const categoriesData = categories.data || categories;

            setCertifications(Array.isArray(certsData) ? certsData : []);
            setProductCategories(Array.isArray(categoriesData) ? categoriesData : []);

            // Load user's current certifications and product categories (separate try-catch)
            try {
                const userCerts = await competencyApi.getUserCertifications(userId);
                setUserCertifications(userCerts);
            } catch (userCertError) {
                console.warn('Failed to load user certifications:', userCertError);
                setUserCertifications([]);
            }

            try {
                const userCategories = await competencyApi.getUserProductCategories(userId);
                setUserProductCategories(userCategories);
            } catch (userCategoryError) {
                console.warn('Failed to load user product categories:', userCategoryError);
                setUserProductCategories([]);
            }

        } catch (error: any) {
            console.error('Error loading data:', error);
            toast.error(error.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle assign certifications
    const handleAssignCertifications = async () => {
        const loadingToast = toast.loading('Đang cập nhật chứng chỉ...');

        try {
            await competencyApi.assignUserCertifications(userId, certificationFormData);
            toast.success('Cập nhật chứng chỉ thành công', { id: loadingToast });
            setIsAssignCertificationModalOpen(false);
            setCertificationFormData({
                certificationIds: [],
                obtainedDate: '',
                expiryDate: '',
                certificateNumber: '',
                issuingOrganization: ''
            });

            // Reload only user certifications, not the entire page
            const userCerts = await competencyApi.getUserCertifications(userId);
            setUserCertifications(userCerts);
        } catch (error: any) {
            console.error('Error assigning certifications:', error);
            toast.error(error.message || 'Không thể Cập nhật chứng chỉ', { id: loadingToast });
        }
    };

    // Handle assign product categories
    const handleAssignProductCategories = async () => {
        const loadingToast = toast.loading('Đang cập nhật nhóm sản phẩm...');

        try {
            await competencyApi.assignUserProductCategories(userId, productCategoryFormData);
            toast.success('Cập nhật nhóm sản phẩm thành công', { id: loadingToast });
            setIsAssignProductCategoryModalOpen(false);
            setProductCategoryFormData({
                productCategoryIds: [],
                assignedDate: '',
                experienceLevel: '',
                notes: ''
            });

            // Reload only user product categories, not the entire page
            const userCategories = await competencyApi.getUserProductCategories(userId);
            setUserProductCategories(userCategories);
        } catch (error: any) {
            console.error('Error assigning product categories:', error);
            toast.error(error.message || 'Không thể Cập nhật nhóm sản phẩm', { id: loadingToast });
        }
    };

    // Handle remove certifications from user
    const handleDeleteCertifications = async () => {
        const loadingToast = toast.loading('Đang gỡ chứng chỉ...');

        try {
            await competencyApi.removeUserCertifications(userId, deletingCertificationIds);
            toast.success('Gỡ chứng chỉ thành công', { id: loadingToast });
            setIsDeleteCertificationDialogOpen(false);
            setDeletingCertificationIds([]);

            // Reload only user certifications, not the entire page
            const userCerts = await competencyApi.getUserCertifications(userId);
            setUserCertifications(userCerts);
        } catch (error: any) {
            console.error('Error removing certifications:', error);
            toast.error(error.message || 'Không thể gỡ chứng chỉ', { id: loadingToast });
        }
    };

    // Handle remove product categories from user
    const handleDeleteProductCategories = async () => {
        const loadingToast = toast.loading('Đang gỡ nhóm sản phẩm...');

        try {
            await competencyApi.removeUserProductCategories(userId, deletingProductCategoryIds);
            toast.success('Gỡ nhóm sản phẩm thành công', { id: loadingToast });
            setIsDeleteProductCategoryDialogOpen(false);
            setDeletingProductCategoryIds([]);

            // Reload only user product categories, not the entire page
            const userCategories = await competencyApi.getUserProductCategories(userId);
            setUserProductCategories(userCategories);
        } catch (error: any) {
            console.error('Error removing product categories:', error);
            toast.error(error.message || 'Không thể gỡ nhóm sản phẩm', { id: loadingToast });
        }
    };

    // Handle certification checkbox change
    const handleCertificationCheckboxChange = (certificationId: number, checked: boolean) => {
        setCertificationFormData(prev => ({
            ...prev,
            certificationIds: checked
                ? [...prev.certificationIds, certificationId]
                : prev.certificationIds.filter(id => id !== certificationId)
        }));
    };

    // Handle product category checkbox change
    const handleProductCategoryCheckboxChange = (productCategoryId: number, checked: boolean) => {
        setProductCategoryFormData(prev => ({
            ...prev,
            productCategoryIds: checked
                ? [...prev.productCategoryIds, productCategoryId]
                : prev.productCategoryIds.filter(id => id !== productCategoryId)
        }));
    };

    // Open delete certification dialog
    const openDeleteCertificationDialog = (certificationIds: number[]) => {
        setDeletingCertificationIds(certificationIds);
        setIsDeleteCertificationDialogOpen(true);
    };

    // Open delete product category dialog
    const openDeleteProductCategoryDialog = (productCategoryIds: number[]) => {
        setDeletingProductCategoryIds(productCategoryIds);
        setIsDeleteProductCategoryDialogOpen(true);
    };

    // Filter available certifications (only show those user doesn't have)
    const availableCertifications = certifications.filter(
        cert => !userCertifications.some(uc => uc.certificationId === cert.certificationId)
    );

    // Filter available product categories (only show those user doesn't have)
    const availableProductCategories = productCategories.filter(
        category => !userProductCategories.some(upc => upc.productCategoryId === category.productCategoryId)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải...</span>
            </div>
        );
    }

    return (
        <AdminLayout>
            <Breadcrumb pageName="Quản lý Năng lực Chuyên môn" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý Năng lực Chuyên môn</h1>
                        <p className="text-gray-600">Quản lý chứng chỉ và nhóm sản phẩm của giám định viên</p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="certifications" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                        <TabsTrigger
                            value="certifications"
                            className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900"
                        >
                            <Award className="w-4 h-4" />
                            <span>Chứng chỉ</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="product-categories"
                            className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900"
                        >
                            <Package className="w-4 h-4" />
                            <span>Nhóm sản phẩm</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Certifications Tab */}
                    <TabsContent value="certifications" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Danh sách chứng chỉ</h2>
                            <Dialog open={isAssignCertificationModalOpen} onOpenChange={setIsAssignCertificationModalOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={availableCertifications.length === 0}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Cập nhật chứng chỉ
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl bg-white border-gray-200">
                                    <DialogHeader>
                                        <DialogTitle className="text-gray-900">Cập nhật chứng chỉ cho giám định viên</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-base font-semibold mb-3 block text-gray-900">Chọn chứng chỉ</Label>
                                            <div className="text-sm text-gray-500 mb-2">Tổng số chứng chỉ có thể gán: {availableCertifications.length}</div>
                                            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white">
                                                {availableCertifications.length === 0 ? (
                                                    <div className="text-center text-gray-500 py-4">
                                                        Người dùng đã có tất cả chứng chỉ
                                                    </div>
                                                ) : (
                                                    availableCertifications.map((cert) => (
                                                        <div key={cert.certificationId} className="flex items-center space-x-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`cert-${cert.certificationId}`}
                                                                checked={certificationFormData.certificationIds.includes(cert.certificationId)}
                                                                onChange={(e) => handleCertificationCheckboxChange(cert.certificationId, e.target.checked)}
                                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-400 rounded bg-white"
                                                            />
                                                            <Label htmlFor={`cert-${cert.certificationId}`} className="text-sm font-medium cursor-pointer flex-1 text-gray-900">
                                                                {cert.name}
                                                            </Label>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="obtainedDate" className="text-gray-900">Ngày cấp</Label>
                                                <Input
                                                    id="obtainedDate"
                                                    type="date"
                                                    value={certificationFormData.obtainedDate}
                                                    onChange={(e) => setCertificationFormData({ ...certificationFormData, obtainedDate: e.target.value })}
                                                    className="bg-white border-gray-300 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="expiryDate" className="text-gray-900">Ngày hết hạn</Label>
                                                <Input
                                                    id="expiryDate"
                                                    type="date"
                                                    value={certificationFormData.expiryDate}
                                                    onChange={(e) => setCertificationFormData({ ...certificationFormData, expiryDate: e.target.value })}
                                                    className="bg-white border-gray-300 text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="certificateNumber" className="text-gray-900">Số chứng chỉ</Label>
                                                <Input
                                                    id="certificateNumber"
                                                    value={certificationFormData.certificateNumber}
                                                    onChange={(e) => setCertificationFormData({ ...certificationFormData, certificateNumber: e.target.value })}
                                                    placeholder="Nhập số chứng chỉ"
                                                    className="bg-white border-gray-300 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="issuingOrganization" className="text-gray-900">Tổ chức cấp</Label>
                                                <Input
                                                    id="issuingOrganization"
                                                    value={certificationFormData.issuingOrganization}
                                                    onChange={(e) => setCertificationFormData({ ...certificationFormData, issuingOrganization: e.target.value })}
                                                    placeholder="Nhập tổ chức cấp"
                                                    className="bg-white border-gray-300 text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsAssignCertificationModalOpen(false)}
                                                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-4 py-2 rounded-lg shadow-sm"
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                onClick={handleAssignCertifications}
                                                disabled={certificationFormData.certificationIds.length === 0}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Cập nhật chứng chỉ
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase">Tên chứng chỉ</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase">Ngày cấp</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase">Ngày hết hạn</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase">Số chứng chỉ</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase">Tổ chức cấp</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userCertifications.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                Chưa có chứng chỉ nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        userCertifications.map((userCert) => {
                                            const cert = certifications.find(c => c.certificationId === userCert.certificationId);
                                            return (
                                                <TableRow key={`${userCert.userId}-${userCert.certificationId}`} className="hover:bg-blue-50 transition-colors duration-200">
                                                    <TableCell className="text-sm text-gray-900 font-medium">{cert?.name || 'N/A'}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">
                                                        {userCert.obtainedDate ? new Date(userCert.obtainedDate).toLocaleDateString('vi-VN') : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-700">
                                                        {userCert.expiryDate ? new Date(userCert.expiryDate).toLocaleDateString('vi-VN') : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-700">{userCert.certificateNumber || '-'}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">{userCert.issuingOrganization || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteCertificationDialog([userCert.certificationId])}
                                                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                            title="Gỡ chứng chỉ khỏi người dùng"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Product Categories Tab */}
                    <TabsContent value="product-categories" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Danh sách nhóm sản phẩm</h2>
                            <Dialog open={isAssignProductCategoryModalOpen} onOpenChange={setIsAssignProductCategoryModalOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={availableProductCategories.length === 0}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Cập nhật nhóm sản phẩm
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl bg-white border-gray-200">
                                    <DialogHeader>
                                        <DialogTitle className="text-gray-900">Cập nhật nhóm sản phẩm cho giám định viên</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-base font-semibold mb-3 block text-gray-900">Chọn nhóm sản phẩm</Label>
                                            <div className="text-sm text-gray-500 mb-2">Tổng số nhóm sản phẩm có thể gán: {availableProductCategories.length}</div>
                                            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white">
                                                {availableProductCategories.length === 0 ? (
                                                    <div className="text-center text-gray-500 py-4">
                                                        Người dùng đã có tất cả nhóm sản phẩm
                                                    </div>
                                                ) : (
                                                    availableProductCategories.map((category) => (
                                                        <div key={category.productCategoryId} className="flex items-center space-x-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`category-${category.productCategoryId}`}
                                                                checked={productCategoryFormData.productCategoryIds.includes(category.productCategoryId)}
                                                                onChange={(e) => handleProductCategoryCheckboxChange(category.productCategoryId, e.target.checked)}
                                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-400 rounded bg-white"
                                                            />
                                                            <Label htmlFor={`category-${category.productCategoryId}`} className="text-sm font-medium cursor-pointer flex-1 text-gray-900">
                                                                {category.name}
                                                            </Label>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="assignedDate" className="text-gray-900">Ngày phê duyệt</Label>
                                                <Input
                                                    id="assignedDate"
                                                    type="date"
                                                    value={productCategoryFormData.assignedDate}
                                                    onChange={(e) => setProductCategoryFormData({ ...productCategoryFormData, assignedDate: e.target.value })}
                                                    className="bg-white border-gray-300 text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="notes" className="text-gray-900">Ghi chú</Label>
                                            <Textarea
                                                id="notes"
                                                value={productCategoryFormData.notes}
                                                onChange={(e) => setProductCategoryFormData({ ...productCategoryFormData, notes: e.target.value })}
                                                placeholder="Nhập ghi chú"
                                                rows={3}
                                                className="bg-white border-gray-300 text-gray-900"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsAssignProductCategoryModalOpen(false)}
                                                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-4 py-2 rounded-lg shadow-sm"
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                onClick={handleAssignProductCategories}
                                                disabled={productCategoryFormData.productCategoryIds.length === 0}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Cập nhật nhóm sản phẩm
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase">Tên nhóm sản phẩm</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase">Ngày phê duyệt</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase">Ghi chú</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-900 uppercase text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userProductCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                Chưa có nhóm sản phẩm nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        userProductCategories.map((userCategory) => {
                                            const category = productCategories.find(c => c.productCategoryId === userCategory.productCategoryId);
                                            return (
                                                <TableRow key={`${userCategory.userId}-${userCategory.productCategoryId}`} className="hover:bg-green-50 transition-colors duration-200">
                                                    <TableCell className="text-sm text-gray-900 font-medium">{category?.name || 'N/A'}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">
                                                        {userCategory.assignedDate ? new Date(userCategory.assignedDate).toLocaleDateString('vi-VN') : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-700 max-w-xs truncate">{userCategory.notes || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteProductCategoryDialog([userCategory.productCategoryId])}
                                                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                            title="Gỡ nhóm sản phẩm khỏi người dùng"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Delete Certification Dialog */}
                <AlertDialog open={isDeleteCertificationDialogOpen} onOpenChange={setIsDeleteCertificationDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận gỡ chứng chỉ</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn gỡ chứng chỉ khỏi người dùng này? Chứng chỉ sẽ không bị xóa khỏi hệ thống, chỉ bị gỡ khỏi người dùng.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-4 py-2 rounded-lg shadow-sm">Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteCertifications}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm"
                            >
                                Gỡ chứng chỉ
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Delete Product Category Dialog */}
                <AlertDialog open={isDeleteProductCategoryDialogOpen} onOpenChange={setIsDeleteProductCategoryDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận gỡ nhóm sản phẩm</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn gỡ nhóm sản phẩm khỏi người dùng này? Nhóm sản phẩm sẽ không bị xóa khỏi hệ thống, chỉ bị gỡ khỏi người dùng.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-4 py-2 rounded-lg shadow-sm">Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteProductCategories}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm"
                            >
                                Gỡ nhóm sản phẩm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}