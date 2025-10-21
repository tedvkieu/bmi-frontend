'use client';

import React from "react";
import AdminLayout from "../../../component/AdminLayout";
import Breadcrumb from "../../../component/breadcrumb/Breadcrumb";
import QualifiedInspectorsClient from "../qualified/QualifiedInspectorsClient"; 

const QualifiedInspectorsPage: React.FC = () => {
    return (
        <AdminLayout>
            <Breadcrumb pageName="Tìm giám định viên có đủ năng lực" />
            <QualifiedInspectorsClient />
        </AdminLayout>
    );
};

export default QualifiedInspectorsPage;