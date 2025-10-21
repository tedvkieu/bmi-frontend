import React from "react";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import DocumentRequestList from "./(components)/DocumentRequestList";

export const metadata = {
  title: "BMI - TIẾP NHẬN YÊU CẦU GIÁM ĐỊNH",
};

const DocumentRequestPage: React.FC = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="TIẾP NHẬN YÊU CẦU GIÁM ĐỊNH" />
      <div className="mt-4">
        <DocumentRequestList />
      </div>
    </AdminLayout>
  );
};

export default DocumentRequestPage;
