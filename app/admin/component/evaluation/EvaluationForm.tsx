"use client";
import React, { useMemo, useState } from "react";
import MetaSection from "./MetaSection";
import CriteriaSection from "./CriteriaSection";
import ChecklistSection from "./ChecklistSection";
import SignaturesSection from "./SignaturesSection";
import { InspectionCompletionEvaluationRequest, InspectionCompletionEvaluationResponse, createEvaluation, getEvaluationsByDossier } from "../../services/evaluationApi";
import toast from "react-hot-toast";

export default function EvaluationForm() {
  const [meta, setMeta] = useState<InspectionCompletionEvaluationRequest>({ dossierId: undefined as any, inspectionNumber: "" });
  const [evaluation, setEvaluation] = useState<InspectionCompletionEvaluationResponse | null>(null);
  const [creating, setCreating] = useState(false);

  const canCreate = useMemo(() => meta.dossierId && meta.inspectionNumber, [meta]);

  const startOrLoad = async () => {
    if (!canCreate) return;
    try {
      setCreating(true);
      const exist = await getEvaluationsByDossier(Number(meta.dossierId));
      const first = exist[0];
      if (first) {
        setEvaluation(first);
        toast.success("Đã tải phiếu đánh giá hiện có");
        return;
      }
      const created = await createEvaluation(meta);
      setEvaluation(created);
      toast.success("Đã tạo phiếu đánh giá");
    } catch (e) {
      console.error(e);
      toast.error("Không thể tạo/tải phiếu");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded p-4">
        <div className="font-semibold mb-3">1) Thông tin chung</div>
        <MetaSection value={{
          dossierId: meta.dossierId as any,
          inspectionNumber: meta.inspectionNumber,
          evaluationDate: meta.evaluationDate,
          evaluatorUserId: meta.evaluatorUserId,
          supervisorUserId: meta.supervisorUserId,
          status: meta.status,
          notes: meta.notes
        }} onChange={(patch) => setMeta({ ...meta, ...patch })} />
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
            onClick={startOrLoad}
            disabled={!canCreate || creating}
          >
            {creating ? "Đang xử lý..." : "Tạo/Tải phiếu đánh giá"}
          </button>
          {evaluation && (
            <span className="ml-3 text-sm text-gray-600">Evaluation ID: {evaluation.evaluationId}</span>
          )}
        </div>
      </div>

      {evaluation && (
        <>
          <div className="border rounded p-4">
            <div className="font-semibold mb-3">2) Đánh giá theo tiêu chí</div>
            <CriteriaSection evaluationId={evaluation.evaluationId} />
          </div>

          <div className="border rounded p-4">
            <div className="font-semibold mb-3">3) Danh sách tài liệu (Checklist)</div>
            <ChecklistSection evaluationId={evaluation.evaluationId} />
          </div>

          <div className="border rounded p-4">
            <div className="font-semibold mb-3">4) Chữ ký duyệt</div>
            <SignaturesSection evaluationId={evaluation.evaluationId} />
          </div>
        </>
      )}
    </div>
  );
}

