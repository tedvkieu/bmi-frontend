"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Award, Package, Plus, X } from "lucide-react";
import { competencyApi, type Certification, type ProductCategory, type UserCertification, type UserProductCategory } from "../services/competencyApi";
import toast from "react-hot-toast";

interface CompetencySectionProps {
    userId: number;
    userRole: string;
    isEditing: boolean;
}

const CompetencySection: React.FC<CompetencySectionProps> = ({ userId, userRole, isEditing }) => {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
    const [userProductCategories, setUserProductCategories] = useState<UserProductCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCertificationIds, setSelectedCertificationIds] = useState<number[]>([]);
    const [selectedProductCategoryIds, setSelectedProductCategoryIds] = useState<number[]>([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [certsResponse, categoriesResponse, userCerts, userCats] = await Promise.all([
                competencyApi.getCertifications(),
                competencyApi.getProductCategories(),
                competencyApi.getUserCertifications(userId),
                competencyApi.getUserProductCategories(userId)
            ]);

            setCertifications(certsResponse.data || []);
            setProductCategories(categoriesResponse.data || []);
            setUserCertifications(userCerts || []);
            setUserProductCategories(userCats || []);
        } catch {
            toast.error('Không thể tải dữ liệu năng lực');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userRole === "INSPECTOR") {
            loadData();
        }
    }, [loadData, userRole]);

    // Only show for inspectors
    if (userRole !== "INSPECTOR") {
        return null;
    }

    const loadUserData = async () => {
        try {
            const [userCerts, userCats] = await Promise.all([
                competencyApi.getUserCertifications(userId),
                competencyApi.getUserProductCategories(userId)
            ]);

            setUserCertifications(userCerts || []);
            setUserProductCategories(userCats || []);
        } catch {
            toast.error('Không thể tải dữ liệu năng lực');
        }
    };

    const assignCertification = async () => {
        if (selectedCertificationIds.length === 0) return;

        const loadingToast = toast.loading('Đang cập nhật chứng chỉ...');

        try {
            await competencyApi.assignUserCertifications(userId, { certificationIds: selectedCertificationIds });
            toast.success(`Đã gán ${selectedCertificationIds.length} chứng chỉ thành công`, { id: loadingToast });
            setShowCertModal(false);
            setSelectedCertificationIds([]);
            loadUserData();
        } catch {
            toast.error('Không thể gán chứng chỉ', { id: loadingToast });
        }
    };

    const assignProductCategory = async () => {
        if (selectedProductCategoryIds.length === 0) return;

        const loadingToast = toast.loading('Đang cập nhật nhóm sản phẩm...');

        try {
            await competencyApi.assignUserProductCategories(userId, { productCategoryIds: selectedProductCategoryIds });
            toast.success(`Đã gán ${selectedProductCategoryIds.length} nhóm sản phẩm thành công`, { id: loadingToast });
            setShowCategoryModal(false);
            setSelectedProductCategoryIds([]);
            loadUserData();
        } catch {
            toast.error('Không thể gán nhóm sản phẩm', { id: loadingToast });
        }
    };

    const removeCertification = async (certificationId: number) => {
        const loadingToast = toast.loading('Đang gỡ chứng chỉ...');

        try {
            await competencyApi.removeUserCertifications(userId, [certificationId]);
            toast.success('Đã gỡ chứng chỉ khỏi người dùng', { id: loadingToast });
            loadUserData();
        } catch {
            toast.error('Không thể gỡ chứng chỉ khỏi người dùng', { id: loadingToast });
        }
    };

    const removeProductCategory = async (productCategoryId: number) => {
        const loadingToast = toast.loading('Đang gỡ nhóm sản phẩm...');

        try {
            await competencyApi.removeUserProductCategories(userId, [productCategoryId]);
            toast.success('Đã gỡ nhóm sản phẩm khỏi người dùng', { id: loadingToast });
            loadUserData();
        } catch {
            toast.error('Không thể gỡ nhóm sản phẩm khỏi người dùng', { id: loadingToast });
        }
    };

    const availableCertifications = certifications.filter(
        cert => !userCertifications.some(uc => uc.certificationId === cert.certificationId)
    );

    const availableProductCategories = productCategories.filter(
        cat => !userProductCategories.some(upc => upc.productCategoryId === cat.productCategoryId)
    );

    return (
        <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Năng lực chuyên môn / Chức danh
                </h3>
                {isEditing && !loading && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowCertModal(true)}
                            disabled={availableCertifications.length === 0}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm chứng chỉ
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCategoryModal(true)}
                            disabled={availableProductCategories.length === 0}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm nhóm sản phẩm
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-600">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Đang tải dữ liệu năng lực...</span>
                    </div>
                </div>
            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Certifications */}
                    <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 text-blue-600" />
                           Các chứng chỉ ISO ({userCertifications.length})
                        </h4>
                        <div className="space-y-2">
                            {userCertifications.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">Chưa có chứng chỉ nào</p>
                            ) : (
                                userCertifications.map((uc) => {
                                    const cert = certifications.find(c => c.certificationId === uc.certificationId);
                                    return (
                                        <div key={uc.certificationId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div>
                                                <div className="font-medium text-blue-900">{cert?.name}</div>
                                                <div className="text-blue-700">{cert?.description}</div>
                                            </div>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCertification(uc.certificationId)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Product Categories */}
                    <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-green-600" />
                            Nhóm sản phẩm ({userProductCategories.length})
                        </h4>
                        <div className="space-y-2">
                            {userProductCategories.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">Chưa có nhóm sản phẩm nào</p>
                            ) : (
                                userProductCategories.map((upc) => {
                                    const category = productCategories.find(c => c.productCategoryId === upc.productCategoryId);
                                    return (
                                        <div key={upc.productCategoryId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div>
                                                <div className="font-medium text-green-900">{category?.name}</div>
                                                <div className="text-green-700">{category?.description}</div>
                                            </div>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeProductCategory(upc.productCategoryId)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Certification Assignment Modal */}
            {showCertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" onClick={() => setShowCertModal(false)} />
                    <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-xl">
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex items-center justify-between">
                            <h4 className="text-lg font-semibold">Chọn chứng chỉ</h4>
                            <button
                                onClick={() => setShowCertModal(false)}
                                className="text-white/80 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {availableCertifications.length === 0 ? (
                                    <div className="text-center text-gray-500 py-4">
                                        Không có chứng chỉ nào để chọn
                                    </div>
                                ) : (
                                    availableCertifications.map((cert) => (
                                        <label key={cert.certificationId} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={selectedCertificationIds.includes(cert.certificationId)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCertificationIds(prev => [...prev, cert.certificationId]);
                                                    } else {
                                                        setSelectedCertificationIds(prev => prev.filter(id => id !== cert.certificationId));
                                                    }
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="text-sm font-medium text-gray-900">{cert.name}</div>
                                                <div className="text-sm text-gray-500">{cert.description}</div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCertModal(false);
                                        setSelectedCertificationIds([]);
                                    }}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={assignCertification}
                                    disabled={selectedCertificationIds.length === 0}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 cursor-pointer"
                                >
                                    {selectedCertificationIds.length > 0
                                        ? `Gán ${selectedCertificationIds.length} chứng chỉ`
                                        : 'Gán chứng chỉ'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Category Assignment Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
                    <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-xl">
                        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg flex items-center justify-between">
                            <h4 className="text-lg font-semibold">Chọn nhóm sản phẩm</h4>
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="text-white/80 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {availableProductCategories.length === 0 ? (
                                    <div className="text-center text-gray-500 py-4">
                                        Không có nhóm sản phẩm nào để chọn
                                    </div>
                                ) : (
                                    availableProductCategories.map((category) => (
                                        <label key={category.productCategoryId} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border border-gray-200 rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={selectedProductCategoryIds.includes(category.productCategoryId)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedProductCategoryIds(prev => [...prev, category.productCategoryId]);
                                                    } else {
                                                        setSelectedProductCategoryIds(prev => prev.filter(id => id !== category.productCategoryId));
                                                    }
                                                }}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                <div className="text-sm text-gray-500">{category.description}</div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        setSelectedProductCategoryIds([]);
                                    }}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={assignProductCategory}
                                    disabled={selectedProductCategoryIds.length === 0}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 cursor-pointer"
                                >
                                    {selectedProductCategoryIds.length > 0
                                        ? `Gán ${selectedProductCategoryIds.length} nhóm sản phẩm`
                                        : 'Gán nhóm sản phẩm'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompetencySection;
