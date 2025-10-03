"use client";
import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  UserPlus,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import AdminLayout from "./component/AdminLayout"; // Đảm bảo đường dẫn đúng
import { useRouter } from "next/navigation";
import LoadingSpinner from "./component/document/LoadingSpinner";

interface MiscData {
  users: number;
  customers: number;
  dossiers: number;
  evaluationResults: number;
  usersLastMonth: number;
  customersLastMonth: number;
  dossiersLastMonth: number;
  evaluationResultsLastMonth: number;
}

const fetchMiscData = async (): Promise<MiscData> => {
  try {
    const response = await fetch("/api/misc");

    if (!response.ok) {
      // Xử lý lỗi HTTP (ví dụ: 404, 500)
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể tải dữ liệu dashboard.");
    }

    const data: MiscData = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu dashboard:", error);
    // Bạn có thể muốn xử lý các loại lỗi khác nhau ở đây (ví dụ: Network Error)
    throw new Error("Không thể kết nối đến máy chủ hoặc dữ liệu không hợp lệ.");
  }
};

// const calculateChange = (current: number, previous: number) => {
//   if (previous === 0) return { percentage: 0, type: "neutral" };
//   const percentage = ((current - previous) / previous) * 100;
//   return {
//     percentage: parseFloat(percentage.toFixed(1)),
//     type: percentage >= 0 ? "up" : "down",
//   };
// };

const DashboardPage = () => {
  const [miscData, setMiscData] = useState<MiscData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchAndSetMiscData = async () => {
      try {
        const data: MiscData = await fetchMiscData(); // Gọi hàm fetch API thực tế
        setMiscData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetMiscData();
  }, []);

  // const totalDocuments = miscData?.dossiers || 0;
  // const totalUsers = miscData?.users || 0;
  // const totalCustomers = miscData?.customers || 0;
  // const completedDocuments = miscData?.evaluationResults || 0;

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center p-6 text-red-600 bg-red-50 rounded-lg mx-auto max-w-md mt-10 shadow-sm">
          <p className="font-semibold mb-2">Đã xảy ra lỗi!</p>
          <p>Lỗi: {error}. Vui lòng thử lại sau.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 lg:p-3 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center"></h1>
          <button
            onClick={() => router.push("/admin/analytic")}
            className="flex items-center text-blue-600 hover:text-blue-700 hover:underline text-sm transition duration-200"
          >
            Xem báo cáo chi tiết <ArrowRight size={16} className="ml-1" />
          </button>
        </div>

        <div>
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Hoạt động gần đây
              </h3>
            </div>
            <div className="space-y-5">
              <ActivityItem
                icon={CheckCircle}
                iconBg="bg-green-50 text-green-600"
                text={
                  <>
                    <span className="font-medium">Nguyễn Văn A</span> đã hoàn
                    thành giám định máy móc{" "}
                    <span className="text-blue-600 font-medium">BMI001</span>
                  </>
                }
                time="2 giờ trước"
              />
              <ActivityItem
                icon={FileText}
                iconBg="bg-blue-50 text-blue-600"
                text={
                  <>
                    <span className="font-medium">Trần Thị B</span> đã tạo tài
                    liệu mới{" "}
                    <span className="text-blue-600 font-medium">BMI005</span>
                  </>
                }
                time="4 giờ trước"
              />
              <ActivityItem
                icon={Clock}
                iconBg="bg-yellow-50 text-yellow-600"
                text={
                  <>
                    Tài liệu{" "}
                    <span className="text-blue-600 font-medium">BMI002</span>{" "}
                    đang chờ phê duyệt
                  </>
                }
                time="6 giờ trước"
              />
              <ActivityItem
                icon={UserPlus}
                iconBg="bg-purple-50 text-purple-600"
                text={
                  <>
                    <span className="font-medium">Lê Văn C</span> đã đăng ký tài
                    khoản nhân viên mới
                  </>
                }
                time="1 ngày trước"
              />
              <ActivityItem
                icon={BookOpen}
                iconBg="bg-teal-50 text-teal-600"
                text={
                  <>
                    Hồ sơ{" "}
                    <span className="text-blue-600 font-medium">BMI003</span> đã
                    được cập nhật thông tin
                  </>
                }
                time="2 ngày trước"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Helper component for Activity Item
interface ActivityItemProps {
  icon: React.ElementType;
  iconBg: string;
  text: React.ReactNode;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon: Icon,
  iconBg,
  text,
  time,
}) => (
  <div className="flex items-center space-x-4">
    <div
      className={`flex-shrink-0 w-10 h-10 ${iconBg} rounded-full flex items-center justify-center shadow-sm`}
    >
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-700 leading-tight">{text}</p>
      <p className="text-xs text-gray-500 mt-0.5">{time}</p>
    </div>
  </div>
);

export default DashboardPage;
