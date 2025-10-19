import AdminLayout from "@/app/admin/component/AdminLayout";
import BackToBottomButton from "@/app/admin/component/BackToBottom";
import Breadcrumb from "@/app/admin/component/breadcrumb/Breadcrumb";
import InspectionForm from "@/app/admin/component/InspectionForm";



export const metadata = {
  title: "BMI - TẠO HỒ SƠ GIÁM ĐỊNH",
};



const CreateDossierCustomer = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Hồ sơ giám định" pageNameSecond="Tạo hồ sơ giám định" pageHref="/admin/hoso"/>
      <InspectionForm />
    <BackToBottomButton />

    </AdminLayout>
  );
};

export default CreateDossierCustomer;
