"use client";

import { useEffect, useRef, useState, type SVGProps } from "react";
import { useSearchParams } from "next/navigation";
import TeamMemberSection from "../../evaluation/components/TeamMemberSection";
import type {
  DossierInfo,
  TeamMember,
  InspectorUser,
  InspectionPlan,
} from "../../evaluation/types/evaluation";
import toast from "react-hot-toast";

const ArrowUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0-6-6m6 6 6-6" />
  </svg>
);

const ArrowDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0-6 6m6-6 6 6" />
  </svg>
);

const TrashIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9.75l-.346 9m-4.788 0l-.346-9m9.624-3.21a48.108 48.108 0 00-3.478-.397m-12 .562c.243-.064.48-.12.712-.168m3.478-.397V4.48c0-.916.684-1.682 1.596-1.763a48.64 48.64 0 013.708 0c.912.081 1.596.847 1.596 1.763v1.271m-9.083 0a48.667 48.667 0 013.478-.397m0 0a48.108 48.108 0 013.478.397"
    />
  </svg>
);

const AssignmentManager: React.FC = () => {
  const searchParams = useSearchParams();
  const [registerNo, setRegisterNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dossierInfo, setDossierInfo] = useState<DossierInfo | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inspectors, setInspectors] = useState<InspectorUser[]>([]);
  const [selectedBUsers, setSelectedBUsers] = useState<number[]>([]);
  const [inspectionPlans, setInspectionPlans] = useState<InspectionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [savingPlans, setSavingPlans] = useState(false);
  const assignedBMembers = teamMembers.filter((m) =>
    (m.assignTask || "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .includes("B")
  );
  const [inspectionDateValue, setInspectionDateValue] = useState("");
  const [inspectionDateISO, setInspectionDateISO] = useState("");
  const [savingInspectionDate, setSavingInspectionDate] = useState(false);
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  const generateTempId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 11);
  const reindexPlans = (plans: InspectionPlan[]) =>
    plans.map((plan, index) => ({ ...plan, planOrder: index + 1 }));

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
      const response = await fetch(
        `/api/evaluations/teams/by-dossier/${dossierId}`
      );
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

  const fetchInspectionPlans = async (dossierId: number) => {
    setLoadingPlans(true);
    try {
      const res = await fetch(`/api/dossiers/${dossierId}/inspection-plans`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      const plans: InspectionPlan[] = (data || [])
        .sort(
          (a: InspectionPlan, b: InspectionPlan) =>
            (a.planOrder ?? 0) - (b.planOrder ?? 0)
        )
        .map((plan: any, index: number) => ({
          planId: plan.planId,
          tempId: generateTempId(),
          planOrder: index + 1,
          taskTitle: plan.taskTitle || "",
          taskDescription: plan.taskDescription || "",
          location: plan.location || "",
          executionDate: plan.executionDate || "",
        }));
      setInspectionPlans(plans);
    } catch (e) {
      console.error("Error fetching inspection plans:", e);
      setInspectionPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Handle manual search
  const handleSearch = async (regNo: string) => {
    if (!regNo.trim()) {
      setError("Vui lòng nhập số đăng ký");
      return;
    }
    setInspectionPlans([]);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/dossiers/search?registerNo=${encodeURIComponent(regNo)}`
      );
      if (response.ok) {
        const data = await response.json();
        setDossierInfo(data);
        await Promise.all([
          fetchTeamMembers(data.receiptId),
          fetchInspectionPlans(data.receiptId),
        ]);
      } else {
        setError("Không tìm thấy hồ sơ với số đăng ký này");
        setDossierInfo(null);
        setTeamMembers([]);
        setInspectionPlans([]);
      }
    } catch (e) {
      console.error(e);
      setError("Lỗi khi tìm kiếm hồ sơ");
      setDossierInfo(null);
      setTeamMembers([]);
      setInspectionPlans([]);
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

  const buildDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  };

  const parseDateString = (value: string | null | undefined) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/;
    const isoResult = trimmed.match(isoMatch);
    if (isoResult) {
      const [, y, m, d] = isoResult;
      return buildDate(Number(y), Number(m), Number(d));
    }

    const vnMatch = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/;
    const vnResult = trimmed.match(vnMatch);
    if (vnResult) {
      const [, d, m, yRaw] = vnResult;
      let year = Number(yRaw);
      if (yRaw.length === 2) {
        year += year >= 50 ? 1900 : 2000;
      }
      return buildDate(year, Number(m), Number(d));
    }

    return null;
  };

  const formatDateToISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateToVN = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  const deriveInspectionDateState = (raw: string | null | undefined) => {
    const parsed = parseDateString(raw);
    if (parsed) {
      return {
        vn: formatDateToVN(parsed),
        iso: formatDateToISO(parsed),
      };
    }
    return {
      vn: raw ?? "",
      iso: "",
    };
  };

  const getCreatedAtDate = () => {
    if (!dossierInfo?.createdAt) return null;
    const parsed = new Date(dossierInfo.createdAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  useEffect(() => {
    if (dossierInfo) {
      const derived = deriveInspectionDateState(dossierInfo.inspectionDate);
      setInspectionDateValue(derived.vn);
      setInspectionDateISO(derived.iso);
    } else {
      setInspectionDateValue("");
      setInspectionDateISO("");
    }
  }, [dossierInfo]);


  const handleOpenDatePicker = () => {
    const input = datePickerRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  const handleDatePickerChange = (isoValue: string) => {
    setInspectionDateISO(isoValue);
    const parsed = parseDateString(isoValue);
    setInspectionDateValue(parsed ? formatDateToVN(parsed) : "");
  };

  const handleInspectionDateTextChange = (value: string) => {
    setInspectionDateValue(value);
    const parsed = parseDateString(value);
    setInspectionDateISO(parsed ? formatDateToISO(parsed) : "");
  };

  const handleSaveInspectionDate = async () => {
    if (!dossierInfo) return;
    const value = inspectionDateValue.trim();
    if (!value) {
      toast.error("Vui lòng nhập ngày đi giám định");
      return;
    }
    const parsed = parseDateString(value);
    if (!parsed) {
      toast.error("Định dạng ngày không hợp lệ (dd/mm/yyyy)");
      return;
    }
    const formatted = formatDateToVN(parsed);
    const createdDate = getCreatedAtDate();
    const parsedDate = new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate()
    );
    if (createdDate && parsedDate < createdDate) {
      toast.error("Ngày đi giám định không được trước ngày tạo hồ sơ");
      return;
    }

    setSavingInspectionDate(true);
    try {
      const res = await fetch(
        `/api/dossiers/${dossierInfo.receiptId}/inspection-date`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inspectionDate: formatted }),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        toast.error(`Cập nhật ngày đi giám định thất bại: ${txt}`);
        return;
      }
      const updated = (await res.json()) as DossierInfo;
      setDossierInfo(updated);
      const derived = deriveInspectionDateState(updated.inspectionDate);
      setInspectionDateValue(derived.vn);
      setInspectionDateISO(derived.iso);
      toast.success("Đã cập nhật ngày đi giám định");
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi khi cập nhật ngày đi giám định");
    } finally {
      setSavingInspectionDate(false);
    }
  };

  const handlePlanFieldChange = <K extends keyof InspectionPlan>(
    index: number,
    field: K,
    value: InspectionPlan[K]
  ) => {
    setInspectionPlans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddPlan = () => {
    setInspectionPlans((prev) =>
      reindexPlans([
        ...prev,
        {
          planOrder: prev.length + 1,
          taskTitle: "",
          taskDescription: "",
          location: "",
          executionDate: "",
          tempId: generateTempId(),
        },
      ])
    );
  };

  const handleRemovePlan = (index: number) => {
    setInspectionPlans((prev) =>
      reindexPlans(prev.filter((_, i) => i !== index))
    );
  };

  const movePlan = (index: number, direction: number) => {
    setInspectionPlans((prev) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(newIndex, 0, item);
      return reindexPlans(next);
    });
  };

  const handleSavePlans = async () => {
    if (!dossierInfo) return;
    const createdDate = getCreatedAtDate();
    for (let i = 0; i < inspectionPlans.length; i += 1) {
      const plan = inspectionPlans[i];
      if (!plan.taskTitle || !plan.taskTitle.trim()) {
        toast.error(`Vui lòng nhập tiêu đề cho mục số ${i + 1}`);
        return;
      }
      if (!plan.taskDescription || !plan.taskDescription.trim()) {
        toast.error(`Vui lòng nhập nội dung chi tiết cho mục số ${i + 1}`);
        return;
      }
      if (createdDate && plan.executionDate) {
        const executionDate = new Date(`${plan.executionDate}T00:00:00`);
        if (!Number.isNaN(executionDate.getTime())) {
          const normalized = new Date(
            executionDate.getFullYear(),
            executionDate.getMonth(),
            executionDate.getDate()
          );
          if (normalized < createdDate) {
            toast.error(
              `Thời gian thực hiện của mục số ${
                i + 1
              } không được trước ngày tạo hồ sơ`
            );
            return;
          }
        }
      }
    }

    setSavingPlans(true);
    try {
      const payload = {
        plans: inspectionPlans.map((plan, index) => ({
          planId: plan.planId ?? null,
          planOrder: index + 1,
          taskTitle: plan.taskTitle.trim(),
          taskDescription: plan.taskDescription.trim(),
          location: plan.location ? plan.location.trim() : null,
          executionDate: plan.executionDate ? plan.executionDate : null,
        })),
      };

      const res = await fetch(
        `/api/dossiers/${dossierInfo.receiptId}/inspection-plans`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        toast.error(`Lưu kế hoạch thất bại: ${txt}`);
        return;
      }

      const data = await res.json();
      const plans: InspectionPlan[] = (data || [])
        .sort(
          (a: InspectionPlan, b: InspectionPlan) =>
            (a.planOrder ?? 0) - (b.planOrder ?? 0)
        )
        .map((plan: any, idx: number) => ({
          planId: plan.planId,
          tempId: generateTempId(),
          planOrder: idx + 1,
          taskTitle: plan.taskTitle || "",
          taskDescription: plan.taskDescription || "",
          location: plan.location || "",
          executionDate: plan.executionDate || "",
        }));
      setInspectionPlans(plans);
      toast.success("Đã lưu kế hoạch giám định");
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi khi lưu kế hoạch giám định");
    } finally {
      setSavingPlans(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Tiêu đề */}
          <h1 className="text-center text-3xl font-semibold text-slate-900 sm:text-left">
            Phân công giám định viên
          </h1>
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
            <p className="mb-3 text-sm leading-snug text-slate-500 sm:max-w-xs">
              Bạn cũng có thể đánh giá hồ sơ trong phần Quản lý hồ sơ.
            </p>

            <button
              onClick={() => (window.location.href = "/admin/hoso")}
              className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Di chuyển tới Quản lý hồ sơ
            </button>
          </div>
        </div>

        {/* Search box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
                Tìm kiếm hồ sơ
              </label>
              <input
                type="text"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                placeholder="VD: BMI/2024/GD-001/KT"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={() => handleSearch(registerNo)}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang tìm..." : "Tìm hồ sơ"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {dossierInfo && (
            <dl className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3 sm:gap-6">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hồ sơ
                </dt>
                <dd className="font-medium text-slate-900">
                  {dossierInfo.registrationNo}
                </dd>
                <dd className="text-xs text-slate-500">ID: {dossierInfo.receiptId}</dd>
              </div>
              {dossierInfo.createdAt && (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ngày lên hồ sơ
                  </dt>
                  <dd className="font-medium text-slate-900">
                    {getCreatedAtDate()
                      ?.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      .replace(/-/g, "/") || dossierInfo.createdAt}
                  </dd>
                </div>
              )}
              {dossierInfo.billOfLading && (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Vận đơn
                  </dt>
                  <dd className="font-medium text-slate-900">
                    {dossierInfo.billOfLading}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>

        {/* Dossier intro */}
        {dossierInfo && (
          <div className="rounded-2xl border border-white bg-gradient-to-r from-blue-50 to-slate-50 p-10 text-center shadow-sm">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">
              {dossierInfo.registrationNo}
            </h2>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600">
              Lãnh đạo Công ty cổ phần dịch vụ và giám định Bảo Minh, Quyết định
              phân công giám định viên có tên sau thực hiện các nội dung yêu cầu
              theo kế hoạch giám định sau.
            </p>
          </div>
        )}

        {/* Assigned members */}
        {dossierInfo && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              Nhân viên đã phân công
            </h3>
            {assignedBMembers.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {assignedBMembers.map((m) => (
                  <li
                    key={`${m.userId}-${m.roleCode}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="font-medium text-slate-900">{m.fullName}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Chưa phân công nhân viên
              </div>
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
            onToggleBSelector={() => {}}
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

        {dossierInfo && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              Ngày đi giám định
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={inspectionDateValue}
                  onChange={(e) =>
                    handleInspectionDateTextChange(e.target.value)
                  }
                  placeholder="VD: 15/09/2025"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={handleOpenDatePicker}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                  aria-label="Chọn ngày trên lịch"
                >
                  Lịch
                </button>
              </div>
              <button
                onClick={handleSaveInspectionDate}
                disabled={savingInspectionDate}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingInspectionDate ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
            <input
              ref={datePickerRef}
              type="date"
              value={inspectionDateISO}
              onChange={(e) => handleDatePickerChange(e.target.value)}
              className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        )}

        {dossierInfo && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                III. Kế hoạch thực hiện sự vụ giám định
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAddPlan}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                >
                  Thêm dòng
                </button>
                <button
                  onClick={handleSavePlans}
                  disabled={savingPlans}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPlans ? "Đang lưu..." : "Lưu kế hoạch"}
                </button>
              </div>
            </div>
            <div className="mb-5 space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-xs italic text-slate-500">
              <p className="font-semibold text-slate-600">Ghi chú:</p>
              <p>
                1. Kế hoạch giám định này có thể thay đổi, tùy thuộc vào thực tế
                giám định.
              </p>
              <p>
                2. Trong quá trình thực hiện kế hoạch giám định, các bộ phận
                liên quan có thể đề xuất thay đổi, điều chỉnh kế hoạch giám định
                này.
              </p>
            </div>

            {loadingPlans ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Đang tải kế hoạch...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border border-slate-200 text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="w-20 border border-slate-200 px-3 py-2 text-left">
                        STT
                      </th>
                      <th className="border border-slate-200 px-3 py-2 text-left">
                        Nội dung thực hiện
                      </th>
                      <th className="w-48 border border-slate-200 px-3 py-2 text-left">
                        Địa điểm
                      </th>
                      <th className="w-40 border border-slate-200 px-3 py-2 text-left">
                        Thời gian
                      </th>
                      <th className="w-32 border border-slate-200 px-3 py-2 text-left">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectionPlans.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="border border-slate-200 px-3 py-6 text-center text-slate-500"
                        >
                          Chưa có kế hoạch. Nhấn &quot;Thêm dòng&quot; để bổ
                          sung.
                        </td>
                      </tr>
                    ) : (
                      inspectionPlans.map((plan, index) => (
                        <tr
                          key={plan.planId ?? plan.tempId ?? index}
                          className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                        >
                          <td className="border border-slate-200 px-3 py-4 align-top text-sm font-semibold text-slate-900">
                            {index + 1}
                          </td>
                          <td className="border border-slate-200 px-3 py-4 align-top">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Tiêu đề
                            </label>
                            <input
                              type="text"
                              value={plan.taskTitle}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  index,
                                  "taskTitle",
                                  e.target.value
                                )
                              }
                              placeholder="Tiêu đề / công tác"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            <label className="mt-4 mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Nội dung chi tiết
                            </label>
                            <textarea
                              value={plan.taskDescription}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  index,
                                  "taskDescription",
                                  e.target.value
                                )
                              }
                              placeholder="Nội dung thực hiện chi tiết"
                              className="w-full min-h-[120px] rounded-lg border border-slate-200 px-3 py-3 text-sm leading-relaxed text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                          </td>
                          <td className="border border-slate-200 px-3 py-4 align-top">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Địa điểm
                            </label>
                            <input
                              type="text"
                              value={plan.location || ""}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  index,
                                  "location",
                                  e.target.value
                                )
                              }
                              placeholder="Địa điểm thực hiện"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                          </td>
                          <td className="border border-slate-200 px-3 py-4 align-top">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Thời gian
                            </label>
                            <input
                              type="date"
                              value={plan.executionDate || ""}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  index,
                                  "executionDate",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                          </td>
                          <td className="border border-slate-200 px-3 py-4 align-top">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => movePlan(index, -1)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                disabled={index === 0}
                                title="Di chuyển lên"
                              >
                                <ArrowUpIcon className="h-5 w-5" />
                                <span className="sr-only">Di chuyển lên</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => movePlan(index, 1)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                disabled={index === inspectionPlans.length - 1}
                                title="Di chuyển xuống"
                              >
                                <ArrowDownIcon className="h-5 w-5" />
                                <span className="sr-only">Di chuyển xuống</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePlan(index)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white text-red-600 shadow-sm transition hover:bg-red-50"
                                title="Xóa mục này"
                              >
                                <TrashIcon className="h-5 w-5" />
                                <span className="sr-only">Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentManager;
