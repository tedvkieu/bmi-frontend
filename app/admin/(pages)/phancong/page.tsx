import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import AssignmentClient from "./(components)/AssignmentClient";

export default function AssignmentPage() {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Phân công giám định viên (Mục B)"/>
      <AssignmentClient />
    </AdminLayout>
  )

  }