"use client";

import React, { useState, useEffect } from "react";
// Removed icons import for cleaner display
import { competencyApi, type Certification, type ProductCategory } from "../services/competencyApi";

interface CompetencyCreateSectionProps {
    selectedCertificationIds: number[];
    selectedProductCategoryIds: number[];
    competencyFormData: {
        obtainedDate: string;
        expiryDate: string;
        certificateNumber: string;
        issuingOrganization: string;
        assignedDate: string;
        experienceLevel: string;
        notes: string;
    };
    onCertificationChange: (ids: number[]) => void;
    onProductCategoryChange: (ids: number[]) => void;
    onFormDataChange: (data: any) => void;
}

const CompetencyCreateSection: React.FC<CompetencyCreateSectionProps> = ({
    selectedCertificationIds,
    selectedProductCategoryIds,
    onCertificationChange,
    onProductCategoryChange
}) => {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [certsResponse, categoriesResponse] = await Promise.all([
                competencyApi.getCertifications(),
                competencyApi.getProductCategories()
            ]);

            setCertifications(certsResponse.data || []);
            setProductCategories(categoriesResponse.data || []);
        } catch (error: any) {
            console.error('Không thể tải dữ liệu năng lực:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCertificationToggle = (certId: number) => {
        const newIds = selectedCertificationIds.includes(certId)
            ? selectedCertificationIds.filter(id => id !== certId)
            : [...selectedCertificationIds, certId];
        onCertificationChange(newIds);
    };

    const handleProductCategoryToggle = (categoryId: number) => {
        const newIds = selectedProductCategoryIds.includes(categoryId)
            ? selectedProductCategoryIds.filter(id => id !== categoryId)
            : [...selectedProductCategoryIds, categoryId];
        onProductCategoryChange(newIds);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg text-gray-900">Năng lực chuyên môn/Chức danh</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chứng chỉ */}
                <div className="space-y-4">
                    <div className="mb-4">
                        <span className="font-medium text-gray-900">
                            Chứng chỉ ISO ({selectedCertificationIds.length})
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Đang tải...</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {certifications.length === 0 ? (
                                <p className="text-gray-500 italic">Không có chứng chỉ nào</p>
                            ) : (
                                certifications.map(cert => (
                                    <label key={cert.certificationId} className="flex items-center gap-3 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedCertificationIds.includes(cert.certificationId)}
                                            onChange={() => handleCertificationToggle(cert.certificationId)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-900">{cert.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Nhóm sản phẩm */}
                <div className="space-y-4">
                    <div className="mb-4">
                        <span className="font-medium text-gray-900">
                            Nhóm sản phẩm ({selectedProductCategoryIds.length})
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                            <span className="ml-2 text-gray-600">Đang tải...</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {productCategories.length === 0 ? (
                                <p className="text-gray-500 italic">Không có nhóm sản phẩm nào</p>
                            ) : (
                                productCategories.map(category => (
                                    <label key={category.productCategoryId} className="flex items-center gap-3 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedProductCategoryIds.includes(category.productCategoryId)}
                                            onChange={() => handleProductCategoryToggle(category.productCategoryId)}
                                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-900">{category.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompetencyCreateSection;
