'use client';

import { useState } from 'react';
import { competencyApi, QualifiedInspector, QualifiedInspectorSearchParams, InspectorQualificationCheck } from '@/app/admin/services/competencyApi';
import { Button } from '@/app/admin/component/ui/button';
import { Label } from '@/app/admin/component/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/app/admin/component/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/app/admin/component/ui/dialog';
import {
    Search,
    CheckCircle,
    XCircle,
    Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function QualifiedInspectorsClient() {
    const [inspectors, setInspectors] = useState<QualifiedInspector[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useState<QualifiedInspectorSearchParams>({});
    const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
    const [selectedInspector, setSelectedInspector] = useState<QualifiedInspector | null>(null);
    const [qualificationCheck, setQualificationCheck] = useState<InspectorQualificationCheck | null>(null);
    const [checkingQualification, setCheckingQualification] = useState(false);

    // Mock data for certifications and product categories
    const certifications = [
        { certificationId: 1, name: 'ISO/IEC 17020:2012' },
        { certificationId: 2, name: 'ISO/IEC 17065:2012' },
        { certificationId: 3, name: 'ISO/IEC 17025:2017' },
        { certificationId: 4, name: 'An toàn bức xạ' },
        { certificationId: 5, name: 'Phòng chống mối và côn trùng' },
        { certificationId: 6, name: 'ISO 9001:2015 Lead Auditor' }
    ];

    const productCategories = [
        { productCategoryId: 1, name: 'Máy móc thiết bị' },
        { productCategoryId: 2, name: 'Phế liệu' },
        { productCategoryId: 3, name: 'Kim loại' },
        { productCategoryId: 4, name: 'Phương tiện' },
        { productCategoryId: 5, name: 'Hóa chất' },
        { productCategoryId: 6, name: 'Thực phẩm' }
    ];

    // Handle certification selection
    const handleCertificationChange = (certificationId: string) => {
        const id = parseInt(certificationId);
        setSearchParams(prev => ({
            ...prev,
            certificationId: prev.certificationId === id ? undefined : id
        }));
    };

    // Handle product category selection
    const handleProductCategoryChange = (productCategoryId: string) => {
        const id = parseInt(productCategoryId);
        setSearchParams(prev => ({
            ...prev,
            productCategoryId: prev.productCategoryId === id ? undefined : id
        }));
    };

    // Search qualified inspectors
    const searchQualifiedInspectors = async () => {
        if (!searchParams.certificationId && !searchParams.productCategoryId) {
            toast.error('Vui lòng chọn ít nhất một tiêu chí tìm kiếm');
            return;
        }

        try {
            setLoading(true);
            const response = await competencyApi.getQualifiedInspectors(searchParams);
            const results = response.data || [];

            setInspectors(results);

            if (!results || results.length === 0) {
                toast.success('Không tìm thấy giám định viên nào phù hợp với tiêu chí');
            } else {
                toast.success(`Tìm thấy ${results.length} giám định viên phù hợp`);
            }
        } catch (error: any) {
            console.error('Error searching qualified inspectors:', error);
            toast.error(error.message || 'Không thể tìm kiếm giám định viên');
        } finally {
            setLoading(false);
        }
    };

    // Reset search
    const resetSearch = () => {
        setSearchParams({});
        setInspectors([]);
    };

    // Check inspector qualification
    const checkInspectorQualification = async (inspector: QualifiedInspector) => {
        try {
            setCheckingQualification(true);
            setSelectedInspector(inspector);

            const result = await competencyApi.checkInspectorQualification(inspector.userId, searchParams);
            setQualificationCheck(result);
            setIsQualificationModalOpen(true);
        } catch (error: any) {
            console.error('Error checking qualification:', error);
            toast.error(error.message || 'Không thể kiểm tra năng lực');
        } finally {
            setCheckingQualification(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tìm giám định viên có đủ năng lực</h1>
                <p className="text-gray-600">Tìm kiếm giám định viên phù hợp với yêu cầu chứng chỉ và nhóm sản phẩm</p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Tiêu chí tìm kiếm</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Certifications */}
                    <div>
                        <Label className="text-base font-semibold text-gray-800 mb-3 block">Chứng chỉ yêu cầu</Label>
                        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                            {certifications.map((cert) => (
                                <div key={cert.certificationId} className="flex items-center space-x-3 py-2">
                                    <input
                                        type="checkbox"
                                        id={`cert-${cert.certificationId}`}
                                        checked={searchParams.certificationId === cert.certificationId}
                                        onChange={() => handleCertificationChange(cert.certificationId.toString())}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-400 rounded cursor-pointer"
                                    />
                                    <Label htmlFor={`cert-${cert.certificationId}`} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                        {cert.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Categories */}
                    <div>
                        <Label className="text-base font-semibold text-gray-800 mb-3 block">Nhóm sản phẩm yêu cầu</Label>
                        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                            {productCategories.map((category) => (
                                <div key={category.productCategoryId} className="flex items-center space-x-3 py-2">
                                    <input
                                        type="checkbox"
                                        id={`category-${category.productCategoryId}`}
                                        checked={searchParams.productCategoryId === category.productCategoryId}
                                        onChange={() => handleProductCategoryChange(category.productCategoryId.toString())}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-400 rounded cursor-pointer"
                                    />
                                    <Label htmlFor={`category-${category.productCategoryId}`} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                        {category.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <Button
                        onClick={searchQualifiedInspectors}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
                    >
                        <Search className="w-5 h-5 mr-2" />
                        {loading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={resetSearch}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-6 py-2 rounded-lg shadow-sm"
                    >
                        Đặt lại
                    </Button>
                </div>
            </div>

            {/* Results */}
            {inspectors.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Kết quả tìm kiếm ({inspectors.length} giám định viên)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="font-semibold text-gray-800">Tên</TableHead>
                                    <TableHead className="font-semibold text-gray-800">Email</TableHead>
                                    <TableHead className="font-semibold text-gray-800">Chứng chỉ</TableHead>
                                    <TableHead className="font-semibold text-gray-800">Nhóm sản phẩm</TableHead>
                                    <TableHead className="font-semibold text-gray-800">Điểm năng lực</TableHead>
                                    <TableHead className="font-semibold text-gray-800">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-gray-800">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inspectors.map((inspector) => (
                                    <TableRow key={inspector.userId} className="hover:bg-blue-50 transition-colors">
                                        <TableCell className="font-semibold text-gray-900">{inspector.fullName}</TableCell>
                                        <TableCell className="text-gray-700">{inspector.email}</TableCell>
                                        <TableCell>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                                                {inspector.certificationName}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                                                {inspector.productCategoryName}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${(inspector.qualificationScore || 100) >= 80 ? 'bg-green-100 text-green-800 border border-green-200' :
                                                (inspector.qualificationScore || 100) >= 60 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                    'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                {inspector.qualificationScore || 100}%
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-green-700 text-sm font-medium">Đủ năng lực</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => checkInspectorQualification(inspector)}
                                                disabled={checkingQualification}
                                                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-4 py-2 rounded-lg shadow-sm"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Chi tiết
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Qualification Check Modal */}
            <Dialog open={isQualificationModalOpen} onOpenChange={setIsQualificationModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Chi tiết năng lực giám định viên</DialogTitle>
                    </DialogHeader>
                    {selectedInspector && qualificationCheck && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">{selectedInspector.fullName}</h3>
                                <p className="text-gray-600">{selectedInspector.email}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium text-gray-900">Chứng chỉ yêu cầu</span>
                                    <div className="flex items-center space-x-2">
                                        {qualificationCheck.hasCertification ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-green-700 font-medium">Có</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <span className="text-red-700 font-medium">Không</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium text-gray-900">Nhóm sản phẩm yêu cầu</span>
                                    <div className="flex items-center space-x-2">
                                        {qualificationCheck.hasProductCategory ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-green-700 font-medium">Có</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <span className="text-red-700 font-medium">Không</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-900">Kết luận</span>
                                    <div className="flex items-center space-x-2">
                                        {qualificationCheck.isQualified ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-green-700 font-medium">Đủ năng lực</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <span className="text-red-700 font-medium">Không đủ năng lực</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}