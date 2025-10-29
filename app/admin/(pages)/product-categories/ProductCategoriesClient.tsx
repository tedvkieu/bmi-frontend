'use client';

import { useState, useEffect, useCallback } from 'react';
import { competencyApi, ProductCategory, ProductCategoryFormData } from '@/app/admin/services/competencyApi';
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

export default function ProductCategoriesClient() {
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
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
    const [editingProductCategory, setEditingProductCategory] = useState<ProductCategory | null>(null);
    const [viewingProductCategory, setViewingProductCategory] = useState<ProductCategory | null>(null);
    const [deletingProductCategory, setDeletingProductCategory] = useState<ProductCategory | null>(null);
    const [formData, setFormData] = useState<ProductCategoryFormData>({
        name: '',
        description: '',
        isActive: true
    });
    const [formErrors, setFormErrors] = useState<Partial<ProductCategoryFormData>>({});
    const [submitting, setSubmitting] = useState(false);

    const itemsPerPage = 10;

    // Load product categories
    const loadProductCategories = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            // If search term exists, use search API
            if (searchTerm.trim()) {
                response = await competencyApi.searchProductCategories(searchTerm.trim());
            } else if (statusFilter === 'active') {
                response = await competencyApi.getActiveProductCategories({
                    page: currentPage,
                    limit: itemsPerPage
                });
            } else if (statusFilter === 'inactive') {
                response = await competencyApi.getInactiveProductCategories({
                    page: currentPage,
                    limit: itemsPerPage
                });
            } else {
                response = await competencyApi.getProductCategories({
                    page: currentPage,
                    limit: itemsPerPage
                });
            }

            setProductCategories(response.data);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error) {
            console.error('Error loading product categories:', error);
            toast.error('Không thể tải danh sách nhóm sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter]);

    useEffect(() => {
        loadProductCategories();
    }, [loadProductCategories]);

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

    // Handle create product category
    const handleCreateProductCategory = async () => {
        try {
            setSubmitting(true);
            setFormErrors({});

            if (!formData.name.trim()) {
                setFormErrors({ name: 'Tên nhóm sản phẩm là bắt buộc' });
                return;
            }

            await competencyApi.createProductCategory(formData);
            toast.success('Tạo nhóm sản phẩm thành công');
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '' });
            loadProductCategories();
        } catch (error: any) {
            console.error('Error creating product category:', error);
            toast.error(error.message || 'Không thể tạo nhóm sản phẩm');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit product category
    const handleEditProductCategory = async () => {
        if (!editingProductCategory) return;

        try {
            setSubmitting(true);
            setFormErrors({});

            if (!formData.name.trim()) {
                setFormErrors({ name: 'Tên nhóm sản phẩm là bắt buộc' });
                return;
            }

            await competencyApi.updateProductCategory(editingProductCategory.productCategoryId, formData);
            toast.success('Cập nhật nhóm sản phẩm thành công');
            setIsEditModalOpen(false);
            setEditingProductCategory(null);
            setFormData({ name: '', description: '' });
            loadProductCategories();
        } catch (error: any) {
            console.error('Error updating product category:', error);
            toast.error(error.message || 'Không thể cập nhật nhóm sản phẩm');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete product category
    const handleDeleteProductCategory = async () => {
        if (!deletingProductCategory) return;

        try {
            await competencyApi.deleteProductCategory(deletingProductCategory.productCategoryId);
            toast.success('Xóa nhóm sản phẩm thành công');
            setIsDeleteDialogOpen(false);
            setDeletingProductCategory(null);
            loadProductCategories();
        } catch (error: any) {
            console.error('Error deleting product category:', error);
            toast.error(error.message || 'Không thể xóa nhóm sản phẩm');
        }
    };

    // Open edit modal
    const openEditModal = (productCategory: ProductCategory) => {
        setEditingProductCategory(productCategory);
        setFormData({
            name: productCategory.name,
            description: productCategory.description || '',
            isActive: productCategory.isActive
        });
        setIsEditModalOpen(true);
    };

    // Open view modal
    const openViewModal = (productCategory: ProductCategory) => {
        setViewingProductCategory(productCategory);
        setIsViewModalOpen(true);
    };

    // Open delete dialog
    const openDeleteDialog = (productCategory: ProductCategory) => {
        setDeletingProductCategory(productCategory);
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhóm sản phẩm</h1>
                    <p className="text-gray-600">Quản lý các nhóm sản phẩm giám định</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={resetForm}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm nhóm sản phẩm
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-xl font-semibold text-gray-900">Thêm nhóm sản phẩm mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tên nhóm sản phẩm *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên nhóm sản phẩm"
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
                                    placeholder="Nhập mô tả nhóm sản phẩm"
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
                                    onClick={handleCreateProductCategory}
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
                                <TableHead className="w-1/4 font-bold text-gray-900 text-left py-4" style={{ color: '#000000' }}>Tên nhóm sản phẩm</TableHead>
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
                            ) : productCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Không có nhóm sản phẩm nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                productCategories.map((productCategory) => (
                                    <TableRow key={productCategory.productCategoryId} className="hover:bg-gray-50">
                                        <TableCell className="font-semibold text-gray-900">
                                            {productCategory.name}
                                        </TableCell>
                                        <TableCell className="text-gray-600 leading-relaxed">
                                            <div className="max-w-md">
                                                <p className="line-clamp-2 break-words">{productCategory.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${productCategory.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {productCategory.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-700">
                                            {new Date(productCategory.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => openViewModal(productCategory)}
                                                    className="p-2.5 rounded-full transition-colors duration-200 focus:outline-none text-gray-600 hover:bg-green-100 hover:text-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                    title="Xem"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(productCategory)}
                                                    className="p-2.5 rounded-full transition-colors duration-200 focus:outline-none text-gray-600 hover:bg-blue-100 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                                    title="Sửa"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(productCategory)}
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
                        Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} nhóm sản phẩm
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
                        <DialogTitle className="text-xl font-semibold text-gray-900">Chỉnh sửa nhóm sản phẩm</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Tên nhóm sản phẩm *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập tên nhóm sản phẩm"
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
                                placeholder="Nhập mô tả nhóm sản phẩm"
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
                                onClick={handleEditProductCategory}
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
                            Bạn có chắc chắn muốn xóa nhóm sản phẩm &quot;{deletingProductCategory?.name}&quot;?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200">
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProductCategory}
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
                        <DialogTitle className="text-xl font-semibold text-gray-900">Chi tiết nhóm sản phẩm</DialogTitle>
                    </DialogHeader>
                    {viewingProductCategory && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Tên nhóm sản phẩm</Label>
                                <div className="w-full h-12 text-base bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-md px-3 py-2 flex items-center">
                                    {viewingProductCategory.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Mô tả</Label>
                                <div className="w-full text-base bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-md px-3 py-2 min-h-[120px] whitespace-pre-wrap">
                                    {viewingProductCategory.description || 'Không có mô tả'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-6 h-6 rounded-full border-2 ${viewingProductCategory.isActive ? 'bg-green-500 border-green-500' : 'bg-gray-300 border-gray-300'}`}></div>
                                    <span className="text-sm text-gray-600">
                                        {viewingProductCategory.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Ngày tạo</Label>
                                <div className="w-full h-12 text-base bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-md px-3 py-2 flex items-center">
                                    {new Date(viewingProductCategory.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Cập nhật lần cuối</Label>
                                <div className="w-full h-12 text-base bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-md px-3 py-2 flex items-center">
                                    {new Date(viewingProductCategory.updatedAt).toLocaleDateString('vi-VN')}
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