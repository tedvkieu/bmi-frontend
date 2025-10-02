import AdminLayout from "@/app/admin/component/AdminLayout";
import Breadcrumb from "@/app/admin/component/breadcrumb/Breadcrumb";
import InspectionForm from "@/app/admin/component/InspectionForm";

const CreateDossierCustomer = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Hồ sơ giám định" pageNameSecond="Tạo hồ sơ giám định" pageHref="/admin/hoso"/>
      <InspectionForm />
    </AdminLayout>
  );
};

export default CreateDossierCustomer;
