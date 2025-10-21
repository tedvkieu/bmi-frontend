'use client';

import React from "react";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import CertificationsClient from "../certifications/CertificationsClient";

const CertificationsPage: React.FC = () => {
    return (
        <AdminLayout>
            <Breadcrumb pageName="Quản lý chứng chỉ" />
            <CertificationsClient />
        </AdminLayout>
    );
};

export default CertificationsPage;