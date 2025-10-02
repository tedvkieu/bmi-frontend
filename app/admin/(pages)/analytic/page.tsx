"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  BarChart2, PieChart, ArrowRight,
  ArrowUpRight, ArrowDownRight, CircleHelp
} from "lucide-react";
import {
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Bar
} from 'recharts';
import { useRouter } from "next/navigation";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import LoadingSpinner from "../../component/document/LoadingSpinner";

interface StatusCounts {
  OBTAINED: number;
  NOT_OBTAINED: number;
  NOT_WITHIN_SCOPE: number;
  PENDING: number;
}

interface MonthlyChartData {
  statusCounts: StatusCounts;
}

interface OverviewData {
  currentMonthCount: number;
  previousMonthCount: number;
  percentageChange: number;
  statusCountsCurrentMonth: StatusCounts;
  statusCountsPreviousMonth: StatusCounts;
}

interface MiscData {
  users: number;
  customers: number;
  dossiers: number;
  evaluationResults: number;
  completedDossiers: number;
}

interface AnalyticState {
  monthlyDossiersData: any[];
  dossierStatusData: any[];
  overviewData: OverviewData | null;
  miscData: MiscData | null;
  selectedMonthDossierCount: number;
  selectedMonthCompletedCount: number;
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md text-sm">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-gray-700">Số hồ sơ: {data.value.toLocaleString('vi-VN')}</p>
        <p className="text-gray-700">Tỷ lệ: {(data.percent * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const CustomComposedTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md text-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value.toLocaleString('vi-VN')}</span>
          </p>
        ))}
        <p className="font-semibold text-gray-800 mt-1">
          Tổng cộng: <span className="font-medium">{payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toLocaleString('vi-VN')}</span>
        </p>
      </div>
    );
  }
  return null;
};

const AnalyticPage = () => {
  const [analyticState, setAnalyticState] = useState<AnalyticState>({
    monthlyDossiersData: [],
    dossierStatusData: [],
    overviewData: null,
    miscData: null,
    selectedMonthDossierCount: 0,
    selectedMonthCompletedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const fetchAnalyticData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, miscRes] = await Promise.all([
        fetch("/api/analytic/dossier/overview"),
        fetch("/api/misc"),
      ]);

      if (!overviewRes.ok) throw new Error(`Lỗi HTTP khi tải dữ liệu tổng quan: ${overviewRes.status}`);
      if (!miscRes.ok) throw new Error(`Lỗi HTTP khi tải dữ liệu khác: ${miscRes.status}`);

      const overviewData: OverviewData = await overviewRes.json();
      const miscData: MiscData = await miscRes.json();

      let monthlyChartData: any[] = [];
      let pieChartData: any[] = [];
      let displayDossierCounts: StatusCounts = { OBTAINED: 0, NOT_OBTAINED: 0, NOT_WITHIN_SCOPE: 0, PENDING: 0 };

      const zeroCounts = { OBTAINED: 0, NOT_OBTAINED: 0, NOT_WITHIN_SCOPE: 0, PENDING: 0 };

      if (selectedMonth === 0) {
        const monthFetches = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          return fetch(`/api/analytic/dossier/status-by-month/${selectedYear}/${month}`)
            .then(async (res) => {
              if (!res.ok) return { statusCounts: zeroCounts };
              try {
                const data: MonthlyChartData = await res.json();
                return data;
              } catch {
                return { statusCounts: zeroCounts };
              }
            })
            .catch((err) => {
              console.warn(`Không thể tải dữ liệu tháng ${month}:`, err);
              return { statusCounts: zeroCounts };
            });
        });

        const monthsData = await Promise.all(monthFetches);

        monthlyChartData = monthsData.map((m, idx) => {
          const s = m?.statusCounts ?? zeroCounts;
          return {
            name: `T${idx + 1}`,
            'Hoàn thành': Number(s.OBTAINED || 0),
            'Đang xử lý': Number(s.PENDING || 0),
            'Không đạt': Number(s.NOT_OBTAINED || 0),
            'Ngoài phạm vi': Number(s.NOT_WITHIN_SCOPE || 0),
          };
        });

        displayDossierCounts = monthsData.reduce(
          (acc, m) => {
            const s = m?.statusCounts ?? zeroCounts;
            acc.OBTAINED += Number(s.OBTAINED || 0);
            acc.PENDING += Number(s.PENDING || 0);
            acc.NOT_OBTAINED += Number(s.NOT_OBTAINED || 0);
            acc.NOT_WITHIN_SCOPE += Number(s.NOT_WITHIN_SCOPE || 0);
            return acc;
          },
          { ...zeroCounts } as StatusCounts
        );
      } else {
        const statusByMonthRes = await fetch(`/api/analytic/dossier/status-by-month/${selectedYear}/${selectedMonth}`);
        if (!statusByMonthRes.ok) throw new Error(`Lỗi HTTP khi tải dữ liệu trạng thái theo tháng: ${statusByMonthRes.status}`);
        const statusByMonthData: MonthlyChartData = await statusByMonthRes.json();
        displayDossierCounts = statusByMonthData.statusCounts ?? displayDossierCounts;

        monthlyChartData = [
          {
            name: `Tháng ${selectedMonth}/${selectedYear}`,
            'Hoàn thành': displayDossierCounts.OBTAINED,
            'Đang xử lý': displayDossierCounts.PENDING,
            'Không đạt': displayDossierCounts.NOT_OBTAINED,
            'Ngoài phạm vi': displayDossierCounts.NOT_WITHIN_SCOPE,
          },
        ];
      }

      const displayMonthTotalDossiers = Object.values(displayDossierCounts).reduce((acc, val) => acc + (Number(val) || 0), 0);
      const displayMonthCompletedDossiers = Number(displayDossierCounts.OBTAINED || 0);

      pieChartData = displayMonthTotalDossiers > 0 ? [
        { name: 'Hoàn thành', value: displayDossierCounts.OBTAINED, color: '#22C55E', percent: (displayDossierCounts.OBTAINED / displayMonthTotalDossiers) },
        { name: 'Đang xử lý', value: displayDossierCounts.PENDING, color: '#FACC15', percent: (displayDossierCounts.PENDING / displayMonthTotalDossiers) },
        { name: 'Không đạt', value: displayDossierCounts.NOT_OBTAINED, color: '#EF4444', percent: (displayDossierCounts.NOT_OBTAINED / displayMonthTotalDossiers) },
        { name: 'Ngoài phạm vi', value: displayDossierCounts.NOT_WITHIN_SCOPE, color: '#858585', percent: (displayDossierCounts.NOT_WITHIN_SCOPE / displayMonthTotalDossiers) },
      ].filter(entry => entry.value > 0)
        : [];

      setAnalyticState({
        monthlyDossiersData: monthlyChartData,
        dossierStatusData: pieChartData,
        overviewData,
        miscData,
        selectedMonthDossierCount: displayMonthTotalDossiers,
        selectedMonthCompletedCount: displayMonthCompletedDossiers,
      });

    } catch (e: any) {
      setError(e.message);
      console.error("Không thể tải dữ liệu phân tích:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchAnalyticData();
  }, [fetchAnalyticData]);
  const percentageChange = analyticState.overviewData?.percentageChange || 0;
  const isPercentagePositive = percentageChange >= 0;

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
        <div className="text-center p-8 text-lg text-red-600 bg-red-50 rounded-lg border border-red-200 m-4 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
          <CircleHelp size={48} className="text-red-500 mb-4" />
          <p className="font-semibold mb-2">Lỗi khi tải dữ liệu:</p>
          <p>{error}. Vui lòng kiểm tra kết nối mạng và thử lại.</p>
          <button
            onClick={fetchAnalyticData}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition duration-200 text-base"
          >
            Thử lại
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName="Phân Tích Dữ Liệu" />
        <button
          onClick={() => router.push("/admin/baocao")}
          className="flex items-center text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium transition duration-200 mt-3 sm:mt-0 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100"
        >
          Xem báo cáo chi tiết <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      <div className="space-y-8 p-3 sm:p-3 lg:p-3 bg-gray-50 rounded-2xl">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base text-gray-700">Tổng hồ sơ</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{analyticState.miscData?.dossiers.toLocaleString('vi-VN') || 0}</p>
            <div className="flex items-center text-sm font-medium">
              {isPercentagePositive ? (
                <ArrowUpRight className="text-green-500 mr-1" size={18} />
              ) : (
                <ArrowDownRight className="text-red-500 mr-1" size={18} />
              )}
              <span className={isPercentagePositive ? "text-green-600" : "text-red-600"}>
                {Math.abs(percentageChange).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base text-gray-700">Người dùng</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{analyticState.miscData?.users.toLocaleString('vi-VN') || 0}</p>
            <span className="text-sm text-gray-500">Tổng số</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base text-gray-700">Khách hàng</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{analyticState.miscData?.customers.toLocaleString('vi-VN') || 0}</p>
            <span className="text-sm text-gray-500">Tổng số</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base text-gray-700">Hồ sơ hoàn thành</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{analyticState.miscData?.completedDossiers.toLocaleString('vi-VN') || 0}</p>
            <span className="text-sm text-gray-500">Tổng số</span>
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-500 transition font-bold text-base uppercase">Dữ liệu hồ sơ</p>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base text-gray-800 flex items-center font-bold">
                <BarChart2 size={20} className="mr-2 text-blue-500" />
                Số lượng hồ sơ theo {selectedMonth === 0 ? 'năm' : 'tháng'}
              </h2>
              <div className="flex space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="p-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value={0}>Cả năm</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                     Tháng {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="p-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                    <option key={year} value={year}>
                      Năm {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={analyticState.monthlyDossiersData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-sm text-gray-600" />
                <YAxis tickLine={false} axisLine={false} className="text-sm text-gray-600" />
                <Tooltip
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  content={<CustomComposedTooltip />}
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} iconType="circle" /> {/* Adjusted font size here */}
                <Bar dataKey="Hoàn thành" stackId="a" fill="#22C55E" name="Hoàn thành" />
                <Bar dataKey="Đang xử lý" stackId="a" fill="#FACC15" name="Đang xử lý" />
                <Bar dataKey="Không đạt" stackId="a" fill="#EF4444" name="Không đạt" />
                <Bar dataKey="Ngoài phạm vi" stackId="a" fill="#858585" name="Ngoài phạm vi" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-base text-gray-800 mb-4 flex items-center font-bold">
              <PieChart size={20} className="mr-2 text-red-500" />
              Trạng thái hồ sơ {selectedMonth === 0 ? `năm ${selectedYear}` : `tháng ${selectedMonth}/${selectedYear}`}
            </h2>
            {analyticState.dossierStatusData.length > 0 && analyticState.selectedMonthDossierCount > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={analyticState.dossierStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={true}
                    labelLine={false}
                    label={analyticState.dossierStatusData.length > 1 || (analyticState.dossierStatusData.length === 1 && analyticState.dossierStatusData[0].value > 0) ? ({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(1)}%` : undefined}
                  >
                    {analyticState.dossierStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '15px', fontSize: '14px' }}
                    iconType="square"
                    layout={analyticState.dossierStatusData.length > 1 ? "horizontal" : "vertical"}
                    verticalAlign={analyticState.dossierStatusData.length > 1 ? "bottom" : "middle"}
                    align={analyticState.dossierStatusData.length > 1 ? "center" : "right"}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100%-40px)] text-center text-gray-500 mt-4 p-4 bg-gray-50 rounded-xl">
                <BarChart2 size={32} className="mb-3 text-gray-400" />
                <p className="text-base font-medium">Không có dữ liệu trạng thái hồ sơ trong {selectedMonth === 0 ? `năm ${selectedYear}` : `tháng ${selectedMonth}/${selectedYear}`}.</p>

                <p className="text-sm text-gray-400">Vui lòng kiểm tra các {selectedMonth === 0 ? 'năm' : 'tháng'} khác hoặc thêm hồ sơ mới.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AnalyticPage;