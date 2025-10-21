import { Suspense } from "react";
import LoginPageAdmin from "../../../components/LoginAdminPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageAdmin />
    </Suspense>
  );
}
