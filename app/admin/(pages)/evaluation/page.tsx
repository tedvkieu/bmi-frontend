import { Suspense } from "react";
import AdminLayout from "../../component/AdminLayout";
import LoadingSpinner from "../../component/document/LoadingSpinner";
import EvaluationPageInner from "./components/EvaluationPageInner";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

export const metadata = {
  title: "BMI - ĐÁNH GIÁ HỒ SƠ",
};


export default function EvaluationPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <Breadcrumb pageName="ĐÁNH GIÁ HỒ SƠ" />
          <LoadingSpinner />
        </AdminLayout>
      }
    >
      <AdminLayout>
        <Breadcrumb pageName="ĐÁNH GIÁ HỒ SƠ" />
        <EvaluationPageInner />
      </AdminLayout>
    </Suspense>
  );
}
