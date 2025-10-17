"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TeamMemberSection from "../../evaluation/components/TeamMemberSection";
import type { DossierInfo, TeamMember, InspectorUser } from "../../evaluation/types/evaluation";
import toast from "react-hot-toast";

const AssignmentManager: React.FC = () => {
  const searchParams = useSearchParams();
  const [registerNo, setRegisterNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dossierInfo, setDossierInfo] = useState<DossierInfo | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inspectors, setInspectors] = useState<InspectorUser[]>([]);
  const [selectedBUsers, setSelectedBUsers] = useState<number[]>([]);

  // Fetch inspectors
  const fetchInspectors = async () => {
    try {
      const res = await fetch(`/api/users/inspectors`);
      if (!res.ok) return;
      const data = await res.json();
      setInspectors(
        (data || []).map((u: any) => ({
          userId: u.userId,
          fullName: u.fullName,
        }))
      );
    } catch (e) {
      console.error("Error fetching inspectors:", e);
    }
  };

  // Fetch team members for dossier
  const fetchTeamMembers = async (dossierId: number) => {
    try {
      const response = await fetch(`/api/evaluations/teams/by-dossier/${dossierId}`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);

        // Pre-select users with task "B"
        const bUsers = (data || [])
          .filter((m: any) =>
            (m.assignTask || "")
              .split(",")
              .map((s: string) => s.trim().toUpperCase())
              .includes("B")
          )
          .map((m: any) => m.userId);

        setSelectedBUsers(bUsers);
      }
    } catch (e) {
      console.error("Error fetching team members:", e);
    }
  };

  // Handle manual search
  const handleSearch = async (regNo: string) => {
    if (!regNo.trim()) {
      setError("Vui lòng nhập số đăng ký");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/dossiers/search?registerNo=${encodeURIComponent(regNo)}`);
      if (response.ok) {
        const data = await response.json();
        setDossierInfo(data);
        await fetchTeamMembers(data.receiptId);
      } else {
        setError("Không tìm thấy hồ sơ với số đăng ký này");
        setDossierInfo(null);
        setTeamMembers([]);
      }
    } catch (e) {
      console.error(e);
      setError("Lỗi khi tìm kiếm hồ sơ");
      setDossierInfo(null);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto search if registerNo in query
  useEffect(() => {
    const q = (searchParams?.get("registerNo") || "").trim();
    if (q) {
      setRegisterNo(q);
      handleSearch(q);
    }
    fetchInspectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
          {/* Tiêu đề */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Phân công giám định viên
          </h1>
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
            <p className="text-sm text-gray-600 mb-3 sm:max-w-xs leading-snug">
              Bạn cũng có thể đánh giá hồ sơ tại quản lý hồ sơ.
            </p>

            <button
              onClick={() => (window.location.href = "/admin/hoso")}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-gray-600 transition"
            >
              Di chuyển tới Quản lý hồ sơ
            </button>
          </div>
        </div>

        {/* Search box */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block font-bold text-gray-700 mb-1">
                Tìm kiếm hồ sơ
              </label>
              <input
                type="text"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                placeholder="VD: BMI/2024/GD-001/KT"
                className="w-full text-gray-700 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => handleSearch(registerNo)}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang tìm..." : "Tìm hồ sơ"}
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {dossierInfo && (
            <div className="mt-4 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-700">Hồ sơ:</span>{" "}
                {dossierInfo.registrationNo} (ID: {dossierInfo.receiptId})
              </div>
              {dossierInfo.billOfLading && (
                <div>
                  <span className="font-medium">Vận đơn:</span>{" "}
                  {dossierInfo.billOfLading}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dossier intro */}
        {dossierInfo && (
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {dossierInfo.registrationNo}
            </h2>
            <p className="text-base text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Lãnh đạo Công ty cổ phần dịch vụ và giám định Bảo Minh, Quyết định
              phân công giám định viên có tên sau thực hiện các nội dung yêu cầu
              theo kế hoạch giám định sau.
            </p>
          </div>
        )}

        {/* Assigned members */}
        {dossierInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Nhân viên đã phân công
            </h3>
            {teamMembers && teamMembers.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-800">
                {teamMembers.map((m) => (
                  <li key={`${m.userId}-${m.roleCode}`}>{m.fullName}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600">Chưa phân công nhân viên</div>
            )}
          </div>
        )}

        {/* Team member assignment section */}
        {dossierInfo && (
          <TeamMemberSection
            teamMembers={teamMembers}
            inspectors={inspectors}
            showBSelector={true}
            selectedBUsers={selectedBUsers}
            onToggleBSelector={() => { }}
            onSelectBUsers={setSelectedBUsers}
            onAssignB={async (members) => {
              try {
                const res = await fetch(
                  `/api/evaluations/teams/assign-b-with-roles/${dossierInfo.receiptId}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ members }),
                  }
                );
                if (!res.ok) {
                  const txt = await res.text();
                  console.error("Assign B failed:", txt);
                  toast.error("Lưu phân công B thất bại: " + txt);
                } else {
                  await fetchTeamMembers(dossierInfo.receiptId);
                  toast.success("Đã lưu phân công mục B");
                }
              } catch (e) {
                console.error(e);
                toast.error("Có lỗi khi lưu phân công");
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AssignmentManager;
