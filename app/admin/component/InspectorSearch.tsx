"use client";

import React, { useState, useEffect } from "react";
import { Search, RefreshCcw, CheckCircle, Award, Package } from "lucide-react";
import { competencyApi, type Certification, type ProductCategory, type QualifiedInspector } from "../services/competencyApi";
import toast from "react-hot-toast";

interface InspectorSearchProps {
    onInspectorSelect?: (inspector: QualifiedInspector) => void;
}

const InspectorSearch: React.FC<InspectorSearchProps> = () => {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [selectedCertificationId, setSelectedCertificationId] = useState<number | null>(null);
    const [selectedProductCategoryId, setSelectedProductCategoryId] = useState<number | null>(null);
    const [inspectors, setInspectors] = useState<QualifiedInspector[]>([]);
    const [loading, setLoading] = useState(false);

    // Load certifications and product categories
    useEffect(() => {
        const loadData = async () => {
            try {
                const [certsResponse, categoriesResponse] = await Promise.all([
                    competencyApi.getCertifications(),
                    competencyApi.getProductCategories()
                ]);
                setCertifications(certsResponse.data || []);
                setProductCategories(categoriesResponse.data || []);
            } catch {
                toast.error('Không thể tải dữ liệu');
            }
        };
        loadData();
    }, []);

    // Search qualified inspectors
    const searchInspectors = async () => {
        if (!selectedCertificationId && !selectedProductCategoryId) {
            toast.error('Vui lòng chọn ít nhất một tiêu chí tìm kiếm');
            return;
        }

        try {
            setLoading(true);
            const response = await competencyApi.getQualifiedInspectors({
                certificationId: selectedCertificationId || undefined,
                productCategoryId: selectedProductCategoryId || undefined,
            });

            const results = response.data || [];
            setInspectors(results);

            if (results.length === 0) {
                toast.success('Không tìm thấy giám định viên nào phù hợp với tiêu chí');
            } else {
                toast.success(`Tìm thấy ${results.length} giám định viên phù hợp`);
            }
        } catch {
            toast.error('Không thể tìm kiếm giám định viên');
        } finally {
            setLoading(false);
        }
    };

    // Reset search
    const resetSearch = () => {
        setSelectedCertificationId(null);
        setSelectedProductCategoryId(null);
        setInspectors([]);
    };

    return (
        <div className="space-y-6">
            {/* Search Criteria */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Tìm giám định viên có đủ năng lực</h2>
                    <p className="text-gray-600 mt-1">Tìm kiếm giám định viên phù hợp với yêu cầu chứng chỉ và nhóm sản phẩm</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Certifications */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3">
                                <Award className="w-4 h-4 inline mr-2" />
                                Chứng chỉ yêu cầu
                            </label>
                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                {certifications.map((cert) => (
                                    <label key={cert.certificationId} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                                        <input
                                            type="radio"
                                            name="certification"
                                            checked={selectedCertificationId === cert.certificationId}
                                            onChange={() => setSelectedCertificationId(cert.certificationId)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="text-sm font-medium text-gray-900">{cert.name}</div>
                                            <div className="text-xs text-gray-500">{cert.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Product Categories */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3">
                                <Package className="w-4 h-4 inline mr-2" />
                                Nhóm sản phẩm yêu cầu
                            </label>
                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                {productCategories.map((category) => (
                                    <label key={category.productCategoryId} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                                        <input
                                            type="radio"
                                            name="productCategory"
                                            checked={selectedProductCategoryId === category.productCategoryId}
                                            onChange={() => setSelectedProductCategoryId(category.productCategoryId)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            <div className="text-xs text-gray-500">{category.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            onClick={searchInspectors}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Search className="w-5 h-5" />
                            {loading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
                        </button>
                        <button
                            onClick={resetSearch}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                            <RefreshCcw className="w-5 h-5" />
                            Đặt lại
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {inspectors.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Kết quả tìm kiếm ({inspectors.length} giám định viên)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Chứng chỉ</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Nhóm sản phẩm</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Điểm năng lực</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {inspectors.map((inspector) => (
                                    <tr key={inspector.userId} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{inspector.fullName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{inspector.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                                                {inspector.certificationName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                                                {inspector.productCategoryName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${(inspector.qualificationScore || 100) >= 80 ? 'bg-green-100 text-green-800 border border-green-200' :
                                                (inspector.qualificationScore || 100) >= 60 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                    'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                {inspector.qualificationScore || 100}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-green-700 text-sm font-medium">Đủ năng lực</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InspectorSearch;
