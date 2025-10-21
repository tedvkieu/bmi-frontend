'use client';

import { useState, useEffect, useCallback } from 'react';
import { competencyApi, Certification, CertificationFormData } from '@/app/admin/services/competencyApi';
import { Button } from '@/app/admin/component/ui/button';
import { Input } from '@/app/admin/component/ui/input';
import { Label } from '@/app/admin/component/ui/label';
import { Textarea } from '@/app/admin/component/ui/textarea';
import { Switch } from '@/app/admin/component/ui/switch';
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
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CertificationsClient() {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
    const [viewingCertification, setViewingCertification] = useState<Certification | null>(null);
    const [deletingCertification, setDeletingCertification] = useState<Certification | null>(null);
    const [formData, setFormData] = useState<CertificationFormData>({
        name: '',
        description: '',
        isActive: true
    });
    const [formErrors, setFormErrors] = useState<Partial<CertificationFormData>>({});
    const [submitting, setSubmitting] = useState(false);

    const itemsPerPage = 10;

    // Load certifications
    const loadCertifications = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            if (statusFilter === 'active') {
                response = await competencyApi.getActiveCertifications({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm
                });
            } else if (statusFilter === 'inactive') {
                response = await competencyApi.getInactiveCertifications({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm
                });
            } else {
                response = await competencyApi.getCertifications({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm
                });
            }

            setCertifications(response.data);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error) {
            console.error('Error loading certifications:', error);
            toast.error('Không thể tải danh sách chứng chỉ');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter]);

    useEffect(() => {
        loadCertifications();
    }, [loadCertifications]);

    // Handle search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Handle status filter
    const handleStatusFilterChange = (status: 'all' | 'active' | 'inactive') => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle create certification
    const handleCreateCertification = async () => {
        try {
            setSubmitting(true);
            setFormErrors({});

            if (!formData.name.trim()) {
                setFormErrors({ name: 'Tên chứng chỉ là bắt buộc' });
                return;
            }

            await competencyApi.createCertification(formData);
            toast.success('Tạo chứng chỉ thành công');
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '' });
            loadCertifications();
        } catch (error: any) {
            console.error('Error creating certification:', error);
            toast.error(error.message || 'Không thể tạo chứng chỉ');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit certification
    const handleEditCertification = async () => {
        if (!editingCertification) return;

        try {
            setSubmitting(true);
            setFormErrors({});

            if (!formData.name.trim()) {
                setFormErrors({ name: 'Tên chứng chỉ là bắt buộc' });
                return;
            }

            await competencyApi.updateCertification(editingCertification.certificationId, formData);
            toast.success('Cập nhật chứng chỉ thành công');
            setIsEditModalOpen(false);
            setEditingCertification(null);
            setFormData({ name: '', description: '' });
            loadCertifications();
        } catch (error: any) {
            console.error('Error updating certification:', error);
            toast.error(error.message || 'Không thể cập nhật chứng chỉ');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete certification
    const handleDeleteCertification = async () => {
        if (!deletingCertification) return;

        try {
            await competencyApi.deleteCertification(deletingCertification.certificationId);
            toast.success('Xóa chứng chỉ thành công');
            setIsDeleteDialogOpen(false);
            setDeletingCertification(null);
            loadCertifications();
        } catch (error: any) {
            console.error('Error deleting certification:', error);
            toast.error(error.message || 'Không thể xóa chứng chỉ');
        }
    };

    // Open edit modal
    const openEditModal = (certification: Certification) => {
        setEditingCertification(certification);
        setFormData({
            name: certification.name,
            description: certification.description || '',
            isActive: certification.isActive
        });
        setIsEditModalOpen(true);
    };

    // Open view modal
    const openViewModal = (certification: Certification) => {
        setViewingCertification(certification);
        setIsViewModalOpen(true);
    };

    // Open delete dialog
    const openDeleteDialog = (certification: Certification) => {
        setDeletingCertification(certification);
        setIsDeleteDialogOpen(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({ name: '', description: '', isActive: true });
        setFormErrors({});
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Chứng chỉ</h1>
                    <p className="text-gray-600">Quản lý các chứng chỉ ISO và chuyên môn</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={resetForm}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm chứng chỉ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-xl font-semibold text-gray-900">Thêm chứng chỉ mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tên chứng chỉ *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên chứng chỉ"
                                    className={`w-full h-12 text-base bg-white text-gray-900 border-2 transition-colors duration-200 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                                />
                                {formErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Nhập mô tả chứng chỉ"
                                    rows={5}
                                    className="w-full text-base bg-white text-gray-900 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                                <div className="flex items-center space-x-3">
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    />
                                    <span className="text-sm text-gray-600">
                                        {formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleCreateCertification}
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                >
                                    {submitting ? 'Đang tạo...' : 'Tạo'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilterChange('all')}
                            className={statusFilter === 'all'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                        >
                            Tất cả
                        </Button>
                        <Button
                            variant={statusFilter === 'active' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilterChange('active')}
                            className={statusFilter === 'active'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Hoạt động
                        </Button>
                        <Button
                            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilterChange('inactive')}
                            className={statusFilter === 'inactive'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                        >
                            <EyeOff className="w-4 h-4 mr-1" />
                            Không hoạt động
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100 border-b-2 border-gray-200">
                                <TableHead className="w-1/4 font-bold text-gray-900 text-left py-4" style={{ color: '#000000' }}>Tên chứng chỉ</TableHead>
                                <TableHead className="w-2/5 font-bold text-gray-900 text-left py-4" style={{ color: '#000000' }}>Mô tả</TableHead>
                                <TableHead className="w-1/6 font-bold text-gray-900 text-left py-4" style={{ color: '#000000' }}>Trạng thái</TableHead>
                                <TableHead className="w-1/6 font-bold text-gray-900 text-left py-4" style={{ color: '#000000' }}>Ngày tạo</TableHead>
                                <TableHead className="w-32 font-bold text-gray-900 text-center py-4" style={{ color: '#000000' }}>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-2">Đang tải...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : certifications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Không có chứng chỉ nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                certifications.map((certification) => (
                                    <TableRow key={certification.certificationId} className="hover:bg-gray-50">
                                        <TableCell className="font-semibold text-gray-900">
                                            {certification.name}
                                        </TableCell>
                                        <TableCell className="text-gray-600 leading-relaxed">
                                            <div className="max-w-md">
                                                <p className="line-clamp-2 break-words">{certification.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${certification.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {certification.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-700">
                                            {new Date(certification.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => openViewModal(certification)}
                                                    className="p-2.5 rounded-full transition-colors duration-200 focus:outline-none text-gray-600 hover:bg-green-100 hover:text-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                    title="Xem"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(certification)}
                                                    className="p-2.5 rounded-full transition-colors duration-200 focus:outline-none text-gray-600 hover:bg-blue-100 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                                    title="Sửa"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(certification)}
                                                    className="p-2.5 rounded-full transition-colors duration-200 focus:outline-none text-gray-600 hover:bg-red-100 hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} chứng chỉ
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-700">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-semibold text-gray-900">Chỉnh sửa chứng chỉ</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Tên chứng chỉ *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập tên chứng chỉ"
                                className={`w-full h-12 text-base bg-white text-gray-900 border-2 transition-colors duration-200 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                            />
                            {formErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">Mô tả</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Nhập mô tả chứng chỉ"
                                rows={5}
                                className="w-full text-base bg-white text-gray-900 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                            <div className="flex items-center space-x-3">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <span className="text-sm text-gray-600">
                                    {formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleEditCertification}
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                                {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa chứng chỉ &quot;{deletingCertification?.name}&quot;?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200">
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCertification}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors duration-200"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-semibold text-gray-900">Chi tiết chứng chỉ</DialogTitle>
                    </DialogHeader>
                    {viewingCertification && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Tên chứng chỉ</Label>
                                <div className="w-full h-12 text-base bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-md px-3 py-2 flex items-center">
                                    {viewingCertification.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Mô tả</Label>
                                <div className="w-full text-base bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-md px-3 py-2 min-h-[120px] whitespace-pre-wrap">
                                    {viewingCertification.description || 'Không có mô tả'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-6 h-6 rounded-full border-2 ${viewingCertification.isActive ? 'bg-green-500 border-green-500' : 'bg-gray-300 border-gray-300'}`}></div>
                                    <span className="text-sm text-gray-600">
                                        {viewingCertification.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Ngày tạo</Label>
                                <div className="w-full h-12 text-base bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-md px-3 py-2 flex items-center">
                                    {new Date(viewingCertification.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Cập nhật lần cuối</Label>
                                <div className="w-full h-12 text-base bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-md px-3 py-2 flex items-center">
                                    {new Date(viewingCertification.updatedAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                                >
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}