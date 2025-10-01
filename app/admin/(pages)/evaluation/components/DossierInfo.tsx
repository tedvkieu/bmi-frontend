// components/DossierInfo.tsx
import { DossierInfo as DossierInfoType } from "../types/evaluation";

interface DossierInfoProps {
  dossierInfo: DossierInfoType;
}

export default function DossierInfo({ dossierInfo }: DossierInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
      <div className="grid text-gray-600 grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Số đăng ký:</strong> {dossierInfo.registrationNo}
        </div>
        <div>
          <strong>Số tờ khai:</strong> {dossierInfo.declarationNo}
        </div>
        <div>
          <strong>Bill of Lading:</strong> {dossierInfo.billOfLading}
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
          <strong>Ngày giám định:</strong>{" "}
          {formatDate(dossierInfo.inspectionDate)}
        </div>
        <div>
          <strong>Ngày cấp chứng thư:</strong>{" "}
          {formatDate(dossierInfo.certificateDate)}
        </div>
        <div>
          <strong>Trạng thái:</strong>
          <span
            className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(
              dossierInfo.certificateStatus
            )}`}
          >
            {dossierInfo.certificateStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
