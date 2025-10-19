import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import AuthWrapper from "./authWrapper";
import GuideOverWrapper from "./guideWrapper";

export const metadata: Metadata = {
  title: "BMI - CÔNG TY CỔ PHẦN DỊCH VỤ VÀ GIÁM ĐỊNH BẢO MINH",
  description: "Công ty cổ phần dịch vụ và giám định Bảo Minh (BMI) là tổ chức thực hiện các dịch vụ Khử trùng – Giám định – Kiểm định – Chứng nhận sản phẩm, hàng hóa xuất nhập khẩu, theo yêu cầu của khách hàng và phục vụ yêu cầu của các cơ quan quản lý Nhà nước. Công ty cổ phần dịch vụ và giám định Bảo Minh được thành lập theo giấy chứng nhận đăng ký doanh nghiệp số 0315978642 do Phòng đăng ký kinh doanh thuộc Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh cấp.",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "BMI - CÔNG TY CỔ PHẦN DỊCH VỤ VÀ GIÁM ĐỊNH BẢO MINH",
    description: "Công ty cổ phần dịch vụ và giám định Bảo Minh (BMI) là tổ chức thực hiện các dịch vụ Khử trùng – Giám định – Kiểm định – Chứng nhận sản phẩm, hàng hóa xuất nhập khẩu, theo yêu cầu của khách hàng và phục vụ yêu cầu của các cơ quan quản lý Nhà nước. Công ty cổ phần dịch vụ và giám định Bảo Minh được thành lập theo giấy chứng nhận đăng ký doanh nghiệp số 0315978642 do Phòng đăng ký kinh doanh thuộc Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh cấp.",
    url: "https://bmi.nguuyen.io.vn/",
    siteName: "GIÁM ĐỊNH BẢO MINH",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Giám định Bảo Minh",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthWrapper
      allowedRoles={[
        "SERVICE_MANAGER",
        "ADMIN",
        "MANAGER",
        "DOCUMENT_STAFF",
        "ISO_STAFF",
      ]}
    >
      {children}
      <GuideOverWrapper />
      <Toaster position="top-right" reverseOrder={false} />
    </AuthWrapper>
  );
}
