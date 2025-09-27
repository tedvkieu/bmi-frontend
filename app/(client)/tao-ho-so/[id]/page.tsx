import AdminLayout from "@/app/admin/component/AdminLayout";
import NavbarClient from "../../components/NavbarClient";
import InspectionFormClient from "@/app/admin/component/InspectionFormClient";

const CreateDossierCustomer = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavbarClient  />
      <InspectionFormClient />
    </div>
  );
};

export default CreateDossierCustomer;
