'use client';

import React from "react";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import ProductCategoriesClient from "./ProductCategoriesClient";

const ProductCategoriesPage: React.FC = () => {
    return (
        <AdminLayout>
            <Breadcrumb pageName="Quản lý nhóm sản phẩm" />
            <ProductCategoriesClient />
        </AdminLayout>
    );
};

export default ProductCategoriesPage;