import React from "react";
import { InspectionFormData, ReceiptFormData } from "../types/inspection";

interface MachineryFormData {
  receiptId: number;
  registrationNo: string;
  itemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureCountry: string;
  manufacturerName: string;
  manufactureYear?: number;
  quantity: number;
  usage: string;
  note: string;
}

interface CompletionSectionProps {
  customerData: InspectionFormData;
  receiptData: ReceiptFormData;
  machineryData?: MachineryFormData | null;
}

export const CompletionSection: React.FC<CompletionSectionProps> = ({
  customerData,
  receiptData,
  machineryData,
}) => {
  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNewInspection = () => {
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Không có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Đang chờ xử lý",
      APPROVED: "Đã phê duyệt",
      REJECTED: "Bị từ chối",
      EXPIRED: "Đã hết hạn",
    };
    return statusMap[status] || status;
  };

  const getObjectTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      SERVICE_MANAGER: "Người quản lý dịch vụ",
      IMPORTER: "Nhà nhập khẩu",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="section-container">
      <div className="completion-header">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" className="check-icon">
            <path
              fill="currentColor"
              d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
            />
          </svg>
        </div>
        <h2 className="text-gray-600">Hoàn Thành Hồ Sơ Kiểm Tra</h2>
        <p className="text-gray-600">
          Hồ sơ khách hàng đã được tạo thành công. Dưới đây là thông tin tóm
          tắt:
        </p>
      </div>

      <div className="completion-content">
        <div className="summary-section">
          <h3>Thông Tin Hồ Sơ Khách Hàng</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Mã khách hàng:</label>
              <span>{customerData.customerId}</span>
            </div>
            <div className="summary-item">
              <label>Địa chỉ dịch vụ:</label>
              <span>{customerData.serviceAddress}</span>
            </div>
            <div className="summary-item">
              <label>Mã số thuế:</label>
              <span>{customerData.taxCode}</span>
            </div>
            <div className="summary-item">
              <label>Email:</label>
              <span>{customerData.email}</span>
            </div>
            <div className="summary-item">
              <label>Loại đối tượng:</label>
              <span>{getObjectTypeLabel(customerData.objectType)}</span>
            </div>
            <div className="summary-item">
              <label>Mã loại kiểm tra:</label>
              <span>{customerData.inspectionTypeId}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h3>Thông Tin Yêu Cầu</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Số yêu cầu:</label>
              <span>{receiptData.registrationNo}</span>
            </div>
            <div className="summary-item">
              <label>Số tờ khai:</label>
              <span>{receiptData.declarationNo}</span>
            </div>
            <div className="summary-item">
              <label>Vận đơn:</label>
              <span>{receiptData.billOfLading}</span>
            </div>
            <div className="summary-item">
              <label>Tên tàu:</label>
              <span>{receiptData.shipName}</span>
            </div>
            <div className="summary-item">
              <label>Container 10 feet:</label>
              <span>{receiptData.cout10}</span>
            </div>
            <div className="summary-item">
              <label>Container 20 feet:</label>
              <span>{receiptData.cout20}</span>
            </div>
            <div className="summary-item">
              <label>Tàu đã rời?</label>
              <span>{receiptData.bulkShip ? "Có" : "Không"}</span>
            </div>
            <div className="summary-item">
              <label>Nơi khai báo:</label>
              <span>{receiptData.declarationPlace}</span>
            </div>
            {/* <div className="summary-item">
              <label>Ngày kiểm tra:</label>
              <span>{formatDate(receiptData.inspectionDate)}</span>
            </div>
            <div className="summary-item">
              <label>Ngày cấp chứng chỉ:</label>
              <span>{formatDate(receiptData.certificateDate)}</span>
            </div> */}
            <div className="summary-item">
              <label>Địa điểm kiểm tra:</label>
              <span>{receiptData.inspectionLocation}</span>
            </div>
            <div className="summary-item">
              <label>Trạng thái chứng chỉ:</label>
              <span
                className={`status-badge status-${receiptData.certificateStatus.toLowerCase()}`}
              >
                {getStatusLabel(receiptData.certificateStatus)}
              </span>
            </div>
            {receiptData.declarationDoc && (
              <div className="summary-item">
                <label>Tài liệu tờ khai:</label>
                <span>{receiptData.declarationDoc}</span>
              </div>
            )}
          </div>
        </div>

        {machineryData && (
          <div className="summary-section">
            <h3>Thông Tin Máy Móc Giám Định</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Mã biên nhận:</label>
                <span>{machineryData.receiptId}</span>
              </div>
              <div className="summary-item">
                <label>Số đăng ký:</label>
                <span>{machineryData.registrationNo}</span>
              </div>
              <div className="summary-item">
                <label>Tên thiết bị:</label>
                <span>{machineryData.itemName}</span>
              </div>
              <div className="summary-item">
                <label>Thương hiệu:</label>
                <span>{machineryData.brand}</span>
              </div>
              <div className="summary-item">
                <label>Model:</label>
                <span>{machineryData.model}</span>
              </div>
              <div className="summary-item">
                <label>Số serial:</label>
                <span>{machineryData.serialNumber}</span>
              </div>
              <div className="summary-item">
                <label>Nước sản xuất:</label>
                <span>{machineryData.manufactureCountry}</span>
              </div>
              <div className="summary-item">
                <label>Nhà sản xuất:</label>
                <span>{machineryData.manufacturerName}</span>
              </div>
              <div className="summary-item">
                <label>Năm sản xuất:</label>
                <span>{machineryData.manufactureYear}</span>
              </div>
              <div className="summary-item">
                <label>Số lượng:</label>
                <span>{machineryData.quantity}</span>
              </div>
              <div className="summary-item full-width">
                <label>Mục đích sử dụng:</label>
                <span>{machineryData.usage}</span>
              </div>
              {machineryData.note && (
                <div className="summary-item full-width">
                  <label>Ghi chú:</label>
                  <span>{machineryData.note}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="completion-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrintReceipt}
          >
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z"
              />
            </svg>
            In biên nhận
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNewInspection}
          >
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
            Tạo hồ sơ mới
          </button>
        </div>

        <div className="next-steps">
          <h3>Các bước tiếp theo</h3>
          <ul>
            <li>Hồ sơ của bạn đang được xem xét bởi bộ phận kiểm tra</li>
            <li>
              Thông tin máy móc giám định đã được ghi nhận và sẽ được xử lý
            </li>
            <li>Bạn sẽ nhận được thông báo qua email khi có cập nhật</li>
            <li>Vui lòng chuẩn bị các tài liệu cần thiết cho buổi kiểm tra</li>
            <li>Liên hệ hotline: 1900-xxxx nếu cần hỗ trợ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default CompletionSection;
