import { Suspense } from "react";
import AdminLayout from "../../component/AdminLayout";
import LoadingSpinner from "../../component/document/LoadingSpinner";
import AssignmentManager from "./(components)/AssignmentManager";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

export const metadata = {
  title: "BMI - PHÂN CÔNG GIÁM ĐỊNH",
};

export default function AssignmentPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <Breadcrumb pageName="PHÂN CÔNG GIÁM ĐỊNH" />
          <LoadingSpinner />
        </AdminLayout>
      }
    >
      <AdminLayout>
        <Breadcrumb pageName="PHÂN CÔNG GIÁM ĐỊNH" />
        <AssignmentManager />
      </AdminLayout>
    </Suspense>
  );
}
