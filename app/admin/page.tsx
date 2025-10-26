"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "./component/AdminLayout"; // Đảm bảo đường dẫn đúng
import LoadingSpinner from "./component/document/LoadingSpinner";
import AnalyticDashboard from "./(pages)/analytic/AnalyticDashboard";

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


const DashboardPage = () => {
  const [, setMiscData] = useState<MiscData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div>
        <AnalyticDashboard />
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
