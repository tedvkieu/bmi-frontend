// components/DossierInfo.tsx
import { DossierInfo as DossierInfoType } from "../types/evaluation";

interface DossierInfoProps {
  dossierInfo: DossierInfoType;
}
const getStatusLabel = (status: string) => {
  switch (status) {
    case "OBTAINED":
      return "Đạt";
    case "NOT_OBTAINED":
      return "Không đạt";
    case "NOT_WITHIN_SCOPE":
      return "Không thuộc phạm vi";
    case "PENDING":
      return "Đang xử lý";
    default:
      return "Không xác định";
  }
};

export default function DossierInfo({ dossierInfo }: DossierInfoProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Chưa có";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Chưa có";
    return parsed.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl text-gray-700 font-semibold mb-4">
        Thông tin hồ sơ
      </h2>
      <div className="grid text-gray-600 grid-cols-1 md:grid-cols-2 gap-4 text-base">
        <div>
          <strong>Số đăng ký:</strong> {dossierInfo.registrationNo}
        </div>
        <div>
          <strong>Số tờ khai:</strong> {dossierInfo.declarationNo}
        </div>
        <div>
          <strong>Số vận đơn:</strong> {dossierInfo.billOfLading}
        </div>
        <div>
          <strong>Tên tàu:</strong> {dossierInfo.shipName}
        </div>
        <div>
          <strong>Nơi khai báo:</strong> {dossierInfo.declarationPlace}
        </div>
        <div>
          <strong>Địa điểm giám định:</strong> {dossierInfo.inspectionLocation}
        </div>
        <div>
          <strong>Dự kiến giám định:</strong>{" "}
          {formatDate(dossierInfo.scheduledInspectionDate ?? null)}
        </div>
        <div>
          <strong>Ngày giám định thực tế:</strong>{" "}
          {formatDate(dossierInfo.inspectionDate ?? null)}
        </div>
        <div>
          <strong>Ngày cấp chứng thư:</strong>{" "}
          {formatDate(dossierInfo.certificateDate ?? null)}
        </div>
        <div>
          <strong>Trạng thái:</strong>
          <span
            className={`ml-2 px-2 py-1 rounded text-base ${getStatusColor(
              dossierInfo.certificateStatus
            )}`}
          >
            {getStatusLabel(dossierInfo.certificateStatus)}
          </span>
        </div>
      </div>
    </div>
  );
}
