// "use client";

import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import EvaluationClient from "./components/EvaluationClient";


export default function EvaluationPage() {
  return (
    <>
      <AdminLayout>
        <Breadcrumb pageName="Biểu mẫu đánh giá quy trình giám định"/>
        <EvaluationClient />
      </AdminLayout>
    </>
  )
}
