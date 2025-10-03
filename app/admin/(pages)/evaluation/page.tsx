"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminLayout from "../../component/AdminLayout";
import SearchSection from "./components/SearchSection";
import DossierInfo from "./components/DossierInfo";
import EvaluationForm from "./components/EvaluationForm";
import {
  DossierInfo as DossierInfoType,
  TeamMember,
  Category,
  Criteria,
  DocumentType,
  EvaluationData,
  DocumentCheckData,
  InspectorUser,
} from "./types/evaluation";
import toast from "react-hot-toast";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

function EvaluationPageInner() {
  const searchParams = useSearchParams();
  const [registerNo, setRegisterNo] = useState("");
  const [dossierInfo, setDossierInfo] = useState<DossierInfoType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({});
  const [documentCheckData, setDocumentCheckData] = useState<DocumentCheckData>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [inspectors, setInspectors] = useState<InspectorUser[]>([]);
  const [showBSelector, setShowBSelector] = useState(false);
  const [selectedBUsers, setSelectedBUsers] = useState<number[]>([]);
  const [selectedAssigneesByTask, setSelectedAssigneesByTask] = useState<
    Record<string, number | undefined | null>
  >({ A: undefined, C: undefined, D: undefined });
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [autoSearched, setAutoSearched] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0-100
  const [downloadStatus, setDownloadStatus] = useState("");

  // Fetch inspectors immediately when page loads
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

  // Fetch initial data including inspectors
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, criteriaRes, documentTypesRes] =
          await Promise.all([
            fetch("/api/evaluations/categories/all"),
            fetch("/api/evaluations/criteria/all"),
            fetch("/api/evaluations/document-types/all"),
          ]);

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data);
        }

        if (criteriaRes.ok) {
          const data = await criteriaRes.json();
          setCriteria(data);
        }

        if (documentTypesRes.ok) {
          const data = await documentTypesRes.json();
          setDocumentTypes(data);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
    // Load inspectors immediately when page loads
    fetchInspectors();
  }, []);

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
        await fetchTeamMembers(data.receiptId);
        await fetchSavedForm(data.receiptId);
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

  const handleDownloadDocx = async () => {
    if (!dossierInfo) return;
    try {
      setDownloading(true);
      setDownloadProgress(0);
      setDownloadStatus("Chuẩn bị tải...");

      const url = `/api/evaluations/export/${
        dossierInfo.receiptId
      }/docx?templateName=${encodeURIComponent("sample-form2.docx")}`;
      const res = await fetch(url);
      if (!res.ok || !res.body) {
        const txt = await res.text();
        toast.error("Xuất DOCX thất bại");
        console.error("Export failed:", txt);
        return;
      }

      const contentLength = Number(res.headers.get("content-length") || 0);
      const disposition = res.headers.get("content-disposition") || "";
      let fileName = `evaluation_form_${dossierInfo.receiptId}.docx`;
      const match = disposition.match(/filename="?([^";]+)"?/i);
      if (match && match[1]) fileName = match[1];

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          if (contentLength > 0) {
            const percent = Math.min(
              100,
              Math.floor((received / contentLength) * 100)
            );
            setDownloadProgress(percent);
            setDownloadStatus(`Đang tải ${percent}%`);
          } else {
            // Indeterminate style: bump progress until 90%
            setDownloadProgress((p) => (p < 90 ? p + 5 : p));
            setDownloadStatus("Đang tải...");
          }
        }
      }

      setDownloadStatus("Hoàn tất, chuẩn bị lưu...");
      setDownloadProgress(100);

      const blob = new Blob(chunks as any, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success("Đã tải xuống hồ sơ đánh giá");
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi khi tải xuống");
    } finally {
      // small delay so users can see 100%
      setTimeout(() => {
        setDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus("");
      }, 600);
    }
  };

  // Read registerNo from query and auto search once
  useEffect(() => {
    const qReg = (searchParams?.get("registerNo") || "").trim();
    if (qReg && !autoSearched) {
      setRegisterNo(qReg);
      // Wait for state to settle and then search
      const t = setTimeout(() => {
        setAutoSearched(true);
        // Use current state value which we just set
        (async () => {
          if (!qReg) return;
          setLoading(true);
          setError("");
          try {
            const response = await fetch(
              `/api/dossiers/search?registerNo=${encodeURIComponent(qReg)}`
            );
            if (response.ok) {
              const data = await response.json();
              setDossierInfo(data);
              await fetchTeamMembers(data.receiptId);
              await fetchSavedForm(data.receiptId);
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
        })();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [searchParams, autoSearched]);

  const fetchTeamMembers = async (dossierId: number) => {
    try {
      const response = await fetch(
        `/api/evaluations/teams/by-dossier/${dossierId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
        const bUsers = (data || [])
          .filter((m: any) =>
            (m.assignTask || "")
              .split(",")
              .map((s: string) => s.trim().toUpperCase())
              .includes("B")
          )
          .map((m: any) => m.userId);
        setSelectedBUsers(bUsers);

        // Initialize A/C/D single selections from current team assignments
        const current: any = { A: undefined, C: undefined, D: undefined };
        (data || []).forEach((m: any) => {
          const tasks = ((m.assignTask || "") as string)
            .split(",")
            .map((s) => s.trim().toUpperCase());
          ["A", "C", "D"].forEach((t) => {
            if (tasks.includes(t) && current[t] == null) {
              current[t] = m.userId;
            }
          });
        });
        setSelectedAssigneesByTask(current);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const fetchSavedForm = async (dossierId: number) => {
    try {
      const res = await fetch(`/api/evaluations/form/by-dossier/${dossierId}`);
      if (!res.ok) return;
      const data = await res.json();

      const evalMap: EvaluationData = {} as any;
      if (Array.isArray(data?.results)) {
        for (const r of data.results) {
          if (r?.criteriaId == null) continue;
          if (r.checkboxValue === true) evalMap[r.criteriaId] = "YES";
          else if (r.checkboxValue === false) evalMap[r.criteriaId] = "NO";
        }
      }
      setEvaluationData(evalMap);

      const docMap: DocumentCheckData = {} as any;
      if (Array.isArray(data?.documents)) {
        for (const d of data.documents) {
          if (d?.documentTypeId == null) continue;
          docMap[d.documentTypeId] = {
            hasHardCopy: !!d.hasPhysicalCopy,
            hasElectronic: !!d.hasElectronicCopy,
          };
        }
      }
      setDocumentCheckData(docMap);
    } catch (e) {
      console.error("Error fetching saved form:", e);
    }
  };

  const handleEvaluationChange = async (
    criteriaId: number,
    value: "YES" | "NO"
  ) => {
    setEvaluationData((prev) => {
      const next = { ...prev } as EvaluationData;
      next[criteriaId] = prev[criteriaId] === value ? null : value;
      return next;
    });

    // Autosave
    try {
      if (!dossierInfo) return;
      const current = evaluationData[criteriaId];
      const nextVal = current === value ? null : value;
      const checkboxValue = nextVal === null ? null : nextVal === "YES";
      await fetch(`/api/evaluations/form/save-criteria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId: dossierInfo.receiptId,
          criteriaId,
          checkboxValue,
        }),
      });
      setLastSavedAt(new Date());
    } catch (e) {
      console.error("Autosave criteria failed:", e);
    }
  };

  const handleDocumentCheckChange = (
    documentTypeId: number,
    type: "hasHardCopy" | "hasElectronic",
    value: boolean
  ) => {
    setDocumentCheckData((prev) => ({
      ...prev,
      [documentTypeId]: {
        ...prev[documentTypeId],
        [type]: value,
      },
    }));
    // Autosave single document checklist item
    (async () => {
      try {
        if (!dossierInfo) return;
        const hasPhysicalCopy =
          type === "hasHardCopy"
            ? value
            : documentCheckData[documentTypeId]?.hasHardCopy || false;
        const hasElectronicCopy =
          type === "hasElectronic"
            ? value
            : documentCheckData[documentTypeId]?.hasElectronic || false;
        await fetch(`/api/evaluations/form/save-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dossierId: dossierInfo.receiptId,
            documentTypeId,
            hasPhysicalCopy,
            hasElectronicCopy,
          }),
        });
        setLastSavedAt(new Date());
      } catch (e) {
        console.error("Autosave document failed:", e);
      }
    })();
  };

  const handleSaveEvaluation = async () => {
    if (!dossierInfo) return;
    setSaving(true);
    try {
      const totalCriteria = criteria.length;
      const criteriaAnswered = Object.values(evaluationData).filter(
        (v) => v === "YES" || v === "NO"
      ).length;
      const totalDocuments = documentTypes.length;
      const documentsCompleted = documentTypes.filter((doc) => {
        const d = documentCheckData[doc.documentTypeId];
        return !!(d?.hasHardCopy || d?.hasElectronic);
      }).length;
      const criteriaCompleted =
        totalCriteria > 0 && criteriaAnswered === totalCriteria;
      const docsCompleted =
        totalDocuments > 0 && documentsCompleted === totalDocuments;

      const resultsPayload = Object.entries(evaluationData)
        .filter(([, v]) => v === "YES" || v === "NO")
        .map(([k, v]) => ({
          criteriaId: Number(k),
          checkboxValue: v === "YES",
        }));

      const docsPayload = documentTypes.map((doc) => ({
        documentTypeId: doc.documentTypeId,
        hasPhysicalCopy:
          documentCheckData[doc.documentTypeId]?.hasHardCopy || false,
        hasElectronicCopy:
          documentCheckData[doc.documentTypeId]?.hasElectronic || false,
      }));

      const payload = {
        dossierId: dossierInfo.receiptId,
        results: resultsPayload,
        documents: docsPayload,
        status:
          criteriaCompleted && docsCompleted && teamReadyForACD
            ? "COMPLETED"
            : undefined,
      };

      const res = await fetch(`/api/evaluations/form/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Save failed:", txt);
        toast.error("Lưu thất bại");
      } else {
        await fetchSavedForm(dossierInfo.receiptId);
        setLastSavedAt(new Date());
        toast.success("Đã lưu đánh giá");
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("Có lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  // Compute readiness for assigning A/C/D: must have at least one B assignment and exactly 1 TEAM_LEADER
  const teamReadyForACD = (() => {
    if (!teamMembers || teamMembers.length === 0) return false;
    const hasB = teamMembers.some((m) =>
      (m.assignTask || "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .includes("B")
    );
    const leaderCount = teamMembers.filter(
      (m) => m.roleCode === "TEAM_LEADER"
    ).length;
    return hasB && leaderCount === 1;
  })();

  // Progress metrics for UI
  const totalCriteria = criteria.length;
  const criteriaAnswered = Object.values(evaluationData).filter(
    (v) => v === "YES" || v === "NO"
  ).length;
  const totalDocuments = documentTypes.length;
  const documentsCompleted = documentTypes.filter((doc) => {
    const d = documentCheckData[doc.documentTypeId];
    return !!(d?.hasHardCopy || d?.hasElectronic);
  }).length;

  return (
    <AdminLayout>
      <Breadcrumb pageName="Đánh giá hồ sơ giám định" />
      <div className="min-h-screen bg-gray-50 py-8">
        {downloading && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="bg-white/90 backdrop-blur border-b border-gray-200">
              <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
                <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-2 bg-blue-600 transition-all"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {downloadStatus || "Đang tải..."}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Biểu mẫu đánh giá quy trình giám định
          </h1>

          <SearchSection
            registerNo={registerNo}
            setRegisterNo={setRegisterNo}
            onSearch={handleSearch}
            loading={loading}
            error={error}
          />

          {dossierInfo && (
            <div className="mb-3">
              <DossierInfo dossierInfo={dossierInfo} />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  disabled={downloading}
                  className={`px-4 py-2 rounded text-white ${
                    downloading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {downloading ? "Đang xuất..." : "Tải xuống hồ sơ đánh giá"}
                </button>
              </div>
            </div>
          )}

          {dossierInfo && categories.length > 0 && criteria.length > 0 && (
            <EvaluationForm
              dossierInfo={dossierInfo}
              categories={categories}
              criteria={criteria}
              teamMembers={teamMembers}
              documentTypes={documentTypes}
              evaluationData={evaluationData}
              documentCheckData={documentCheckData}
              inspectors={inspectors}
              showBSelector={showBSelector}
              selectedBUsers={selectedBUsers}
              saving={saving}
              criteriaAnswered={criteriaAnswered}
              totalCriteria={totalCriteria}
              documentsCompleted={documentsCompleted}
              totalDocuments={totalDocuments}
              lastSavedAt={lastSavedAt}
              onEvaluationChange={handleEvaluationChange}
              onDocumentCheckChange={handleDocumentCheckChange}
              onToggleBSelector={() => {
                setShowBSelector((v) => !v);
              }}
              onSelectBUsers={setSelectedBUsers}
              onAssignB={async (members) => {
                if (!dossierInfo) return;
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
                    fetchTeamMembers(dossierInfo.receiptId);
                    setLastSavedAt(new Date());
                    toast.success("Đã lưu phân công mục B");
                  }
                } catch (e) {
                  console.error(e);
                  alert("Lỗi khi lưu phân công B");
                }
              }}
              onAssignTaskLetter={async (task, userId) => {
                if (!dossierInfo) return;
                try {
                  // Only one assignee allowed: backend will remove others
                  const res = await fetch(
                    `/api/evaluations/teams/assign-task/${dossierInfo.receiptId}`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        task,
                        userIds: userId ? [userId] : [],
                      }),
                    }
                  );
                  if (!res.ok) {
                    const txt = await res.text();
                    console.error("Assign", task, "failed:", txt);
                    alert(`Lưu phân công mục ${task} thất bại`);
                  } else {
                    setSelectedAssigneesByTask((prev) => ({
                      ...prev,
                      [task]: userId || undefined,
                    }));
                    fetchTeamMembers(dossierInfo.receiptId);
                    setLastSavedAt(new Date());
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              selectedAssigneesByTask={selectedAssigneesByTask}
              teamReadyForACD={teamReadyForACD}
              onSave={handleSaveEvaluation}
              onBack={() => {
                setDossierInfo(null);
                setRegisterNo("");
                setTeamMembers([]);
                setEvaluationData({});
                setDocumentCheckData({});
                setSelectedBUsers([]);
                setSelectedAssigneesByTask({
                  A: undefined,
                  C: undefined,
                  D: undefined,
                });
                setLastSavedAt(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

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

export default function EvaluationPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <div className="p-6">Đang tải...</div>
        </AdminLayout>
      }
    >
      <EvaluationPageInner />
    </Suspense>
  );
}
