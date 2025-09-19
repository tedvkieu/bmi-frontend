"use client";
import React, { useEffect, useState } from "react";
import {
  EvaluationSignatureRequest,
  EvaluationSignatureResponse,
  createSignature,
  getSignaturesByEvaluation,
  updateSignature,
} from "../../services/evaluationApi";
import toast from "react-hot-toast";

type Props = { evaluationId: number };

export default function SignaturesSection({ evaluationId }: Props) {
  const [items, setItems] = useState<Partial<EvaluationSignatureResponse>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await getSignaturesByEvaluation(evaluationId);
        const initialTypes: ("EVALUATOR" | "SUPERVISOR")[] = ["EVALUATOR", "SUPERVISOR"];
        const merged = initialTypes.map((type) => list.find((s) => s.signatureType === type) || { evaluationId, signatureType: type });
        setItems(merged);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [evaluationId]);

  const updateAt = (idx: number, patch: Partial<EvaluationSignatureResponse>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      const tasks = items.map(async (it) => {
        const payload: EvaluationSignatureRequest = {
          evaluationId: evaluationId,
          signatureType: it.signatureType as any,
          userId: it.userId,
          signatureDate: it.signatureDate,
          fullName: it.fullName,
          position: it.position,
          digitalSignature: it.digitalSignature,
        };
        if (it.signatureId) return updateSignature(it.signatureId, payload);
        return createSignature(payload);
      });
      const saved = await Promise.all(tasks);
      setItems(saved);
      toast.success("Đã lưu chữ ký");
    } catch (e) {
      console.error(e);
      toast.error("Lưu chữ ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {items.map((s, idx) => (
        <div key={s.signatureType} className="border rounded p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-2 font-medium">{s.signatureType === "EVALUATOR" ? "Người theo dõi" : "Lãnh đạo"}</div>
          <div className="md:col-span-3">
            <input className="border rounded p-2 w-full" placeholder="Họ tên" value={s.fullName || ""} onChange={(e) => updateAt(idx, { fullName: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <input className="border rounded p-2 w-full" placeholder="Chức vụ" value={s.position || ""} onChange={(e) => updateAt(idx, { position: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <input type="date" className="border rounded p-2 w-full" value={s.signatureDate || ""} onChange={(e) => updateAt(idx, { signatureDate: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <input className="border rounded p-2 w-full" placeholder="User ID" value={s.userId ?? ""} onChange={(e) => updateAt(idx, { userId: Number(e.target.value) })} />
          </div>
        </div>
      ))}
      <div className="text-right">
        <button className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60" onClick={saveAll} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu chữ ký"}
        </button>
      </div>
    </div>
  );
}

