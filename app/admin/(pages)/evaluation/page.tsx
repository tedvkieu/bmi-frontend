"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../component/AdminLayout";

// Types
interface DossierInfo {
  receiptId: number;
  registrationNo: string;
  customerSubmitId: number;
  customerRelatedId: number;
  inspectionTypeId: string;
  declarationNo: string;
  billOfLading: string;
  shipName: string;
  cout10: number;
  cout20: number;
  bulkShip: boolean;
  declarationDoc: string;
  declarationPlace: string;
  inspectionDate: string;
  certificateDate: string;
  inspectionLocation: string;
  files: string;
  certificateStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  teamId: number;
  dossierId: number;
  userId: number;
  fullName: string;
  roleId: number;
  roleCode: string;
  roleName: string;
  assignedDate: string;
  isActive: boolean;
}

interface Category {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  categoryOrder: number;
  isActive: boolean;
}

interface Criteria {
  criteriaId: number;
  categoryId: number;
  criteriaCode: string;
  criteriaOrder: number;
  criteriaText: string;
  inputType: string;
  isRequired: boolean;
  isActive: boolean;
}

interface EvaluationData {
  [criteriaId: number]: "YES" | "NO" | null;
}

export default function EvaluationPage() {
  const [registerNo, setRegisterNo] = useState("");
  const [dossierInfo, setDossierInfo] = useState<DossierInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/evaluations/categories/all"
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchCriteria = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/evaluations/criteria/all"
        );
        if (response.ok) {
          const data = await response.json();
          setCriteria(data);
        }
      } catch (error) {
        console.error("Error fetching criteria:", error);
      }
    };

    fetchCategories();
    fetchCriteria();
  }, []);

  // Search dossier
  const handleSearch = async () => {
    if (!registerNo.trim()) {
      setError("Vui lòng nhập số đăng ký");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/dossiers/search?registerNo=${encodeURIComponent(registerNo)}`
      );

      if (response.ok) {
        const data = await response.json();
        setDossierInfo(data);
        // Fetch team members after getting dossier info
        fetchTeamMembers(data.receiptId);
      } else {
        setError("Không tìm thấy hồ sơ với số đăng ký này");
        setDossierInfo(null);
      }
    } catch (error) {
      setError("Lỗi khi tìm kiếm hồ sơ");
      console.log("check error: ", error);
      setDossierInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async (dossierId: number) => {
    try {
      const response = await fetch(
        `/api/evaluations/teams/by-dossier/${dossierId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  // Handle evaluation change
  const handleEvaluationChange = (criteriaId: number, value: "YES" | "NO") => {
    setEvaluationData((prev) => ({
      ...prev,
      [criteriaId]: prev[criteriaId] === value ? null : value,
    }));
  };

  // Group criteria by category
  const getCriteriaByCategory = (categoryId: number) => {
    return criteria
      .filter((c) => c.categoryId === categoryId && c.isActive)
      .sort((a, b) => a.criteriaOrder - b.criteriaOrder);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Biểu mẫu đánh giá quy trình giám định
          </h1>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl text-gray-700 font-semibold mb-4">
              Tìm kiếm hồ sơ
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Nhập số đăng ký (VD: BMI/2024/GD-001/KT)"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Dossier Info */}
          {dossierInfo && (
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
                  <strong>Địa điểm giám định:</strong>{" "}
                  {dossierInfo.inspectionLocation}
                </div>
                <div>
                  <strong>Ngày giám định:</strong>{" "}
                  {new Date(dossierInfo.inspectionDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </div>
                <div>
                  <strong>Ngày cấp chứng thư:</strong>{" "}
                  {new Date(dossierInfo.certificateDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </div>
                <div>
                  <strong>Trạng thái:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      dossierInfo.certificateStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : dossierInfo.certificateStatus === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {dossierInfo.certificateStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Form */}
          {dossierInfo && categories.length > 0 && criteria.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl text-gray-700 font-semibold mb-6">
                Biểu mẫu đánh giá
              </h2>

              {categories
                .sort((a, b) => a.categoryOrder - b.categoryOrder)
                .map((category) => {
                  const categoryCriteria = getCriteriaByCategory(
                    category.categoryId
                  );

                  if (categoryCriteria.length === 0) return null;

                  return (
                    <div key={category.categoryId} className="mb-8">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4 p-3 bg-blue-50 rounded-lg">
                        {category.categoryName}
                      </h3>

                      {/* Team Members Table for Category B (Preparation) */}
                      {category.categoryCode === "PREPARATION" &&
                        teamMembers.length > 0 && (
                          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <table className="w-full border border-gray-300">
                              <thead>
                                <tr className="bg-gray-600">
                                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                    STT
                                  </th>
                                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                    Giám định viên thực hiện
                                  </th>
                                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                    Chức vụ
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {teamMembers.map((member, index) => (
                                  <tr key={member.teamId}>
                                    <td className="border border-gray-300 text-gray-600 px-4 py-2 text-center">
                                      {index + 1}
                                    </td>
                                    <td className="border text-gray-600 border-gray-300 px-4 py-2">
                                      {member.fullName}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                      <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={
                                              member.roleCode === "TEAM_LEADER"
                                            }
                                            disabled
                                            className="mr-2 text-gray-600"
                                          />
                                          <span
                                            className={
                                              member.roleCode === "TEAM_LEADER"
                                                ? "text-red-600 font-medium"
                                                : "text-gray-600"
                                            }
                                          >
                                            Trưởng nhóm giám định
                                          </span>
                                        </label>
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={
                                              member.roleCode === "TEAM_LEADER"
                                            }
                                            disabled
                                            className="mr-2 text-gray-600"
                                          />
                                          <span
                                            className={
                                              member.roleCode === "TEAM_LEADER"
                                                ? "text-red-600 font-medium"
                                                : "text-gray-600"
                                            }
                                          >
                                            GĐV
                                          </span>
                                        </label>
                                      </div>
                                      <div className="flex flex-wrap gap-4 mt-2">
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={
                                              member.roleCode === "MEMBER"
                                            }
                                            disabled
                                            className="mr-2 text-gray-600"
                                          />
                                          <span
                                            className={
                                              member.roleCode === "MEMBER"
                                                ? "text-red-600 font-medium"
                                                : "text-gray-600"
                                            }
                                          >
                                            GĐV - thành viên
                                          </span>
                                        </label>
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={
                                              member.roleCode === "TRAINEE"
                                            }
                                            disabled
                                            className="mr-2 text-gray-600"
                                          />
                                          <span
                                            className={
                                              member.roleCode === "TRAINEE"
                                                ? "text-red-600 font-medium"
                                                : "text-gray-600"
                                            }
                                          >
                                            GĐV Tập sự
                                          </span>
                                        </label>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                      <div className="space-y-6">
                        {categoryCriteria.map((criterion) => (
                          <div
                            key={criterion.criteriaId}
                            className="border-l-4 border-gray-200 pl-4"
                          >
                            <div className="mb-3">
                              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium mr-2">
                                {criterion.criteriaCode}
                              </span>
                              <span className="text-gray-900">
                                {criterion.criteriaText}
                              </span>
                            </div>

                            <div className="flex gap-6">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    evaluationData[criterion.criteriaId] ===
                                    "YES"
                                  }
                                  onChange={() =>
                                    handleEvaluationChange(
                                      criterion.criteriaId,
                                      "YES"
                                    )
                                  }
                                  className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="text-green-700 font-medium">
                                  Có
                                </span>
                              </label>

                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    evaluationData[criterion.criteriaId] ===
                                    "NO"
                                  }
                                  onChange={() =>
                                    handleEvaluationChange(
                                      criterion.criteriaId,
                                      "NO"
                                    )
                                  }
                                  className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <span className="text-red-700 font-medium">
                                  Không
                                </span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    console.log("Evaluation Data:", evaluationData);
                    // Handle form submission here
                  }}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Lưu đánh giá
                </button>
              </div>
            </div>
          )}

          {/* No dossier found message */}
          {!dossierInfo && !loading && registerNo && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">
                Vui lòng tìm kiếm hồ sơ để bắt đầu đánh giá
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
