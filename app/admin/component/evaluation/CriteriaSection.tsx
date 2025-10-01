"use client";
import React, { useEffect, useState } from "react";
import {
  EvaluationCategoryResponse,
  EvaluationCriteriaResponse,
  EvaluationResultRequest,
  EvaluationResultResponse,
  getAllCategories,
  getCriteriaByCategory,
  getResultsByEvaluation,
  createResult,
  updateResult,
} from "../../services/evaluationApi";
import toast from "react-hot-toast";

type Props = { evaluationId: number };

type ResultMap = Record<number, EvaluationResultResponse>; // key = criteriaId

export default function CriteriaSection({ evaluationId }: Props) {
  const [categories, setCategories] = useState<EvaluationCategoryResponse[]>(
    []
  );
  const [criteriaByCat, setCriteriaByCat] = useState<
    Record<number, EvaluationCriteriaResponse[]>
  >({});
  const [results, setResults] = useState<ResultMap>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getAllCategories();
        const active = cats
          .filter((c) => c.isActive !== false)
          .sort((a, b) => (a.categoryOrder ?? 0) - (b.categoryOrder ?? 0));
        setCategories(active);
        const res = await getResultsByEvaluation(evaluationId);
        const map: ResultMap = {};
        res.forEach((r) => (map[r.criteriaId] = r));
        setResults(map);
        // fetch criteria per category
        const byCat: Record<number, EvaluationCriteriaResponse[]> = {};
        for (const c of active) {
          byCat[c.categoryId] = (await getCriteriaByCategory(c.categoryId))
            .filter((it) => it.isActive !== false)
            .sort((a, b) => (a.criteriaOrder ?? 0) - (b.criteriaOrder ?? 0));
        }
        setCriteriaByCat(byCat);
      } catch (e: any) {
        toast.error("Tải tiêu chí thất bại");
        console.error(e);
      }
    })();
  }, [evaluationId]);

  const handleChange = (criteria: EvaluationCriteriaResponse, value: any) => {
    setResults((prev) => {
      const current: EvaluationResultResponse | undefined =
        prev[criteria.criteriaId];
      const base: EvaluationResultResponse =
        current ??
        ({ evaluationId, criteriaId: criteria.criteriaId, resultId: 0 } as any);
      const patch: Partial<EvaluationResultResponse> = {};
      switch (criteria.inputType) {
        case "CHECKBOX":
          patch.checkboxValue = Boolean(value);
          break;
        case "NUMBER":
          patch.numberValue = value === "" ? undefined : Number(value);
          break;
        case "DATE":
          patch.dateValue = value || undefined;
          break;
        case "SELECT":
          patch.selectValue = value || undefined;
          break;
        default:
          patch.textValue = value || undefined;
      }
      return {
        ...prev,
        [criteria.criteriaId]: {
          ...base,
          ...patch,
        } as EvaluationResultResponse,
      };
    });
  };

  const saveAll = async () => {
    try {
      setLoading(true);
      const tasks = Object.values(results).map(async (r) => {
        const payload: EvaluationResultRequest = {
          evaluationId: r.evaluationId,
          criteriaId: r.criteriaId,
          checkboxValue: r.checkboxValue,
          textValue: r.textValue,
          numberValue: r.numberValue,
          dateValue: r.dateValue,
          selectValue: r.selectValue,
          notes: r.notes,
        };
        if (r.resultId && r.resultId > 0) {
          const updated = await updateResult(r.resultId, payload);
          return updated;
        } else {
          const created = await createResult(payload);
          return created;
        }
      });
      const saved = await Promise.all(tasks);
      const map: ResultMap = {};
      saved.forEach((s) => (map[s.criteriaId] = s));
      setResults(map);
      toast.success("Đã lưu kết quả tiêu chí");
    } catch (e: any) {
      toast.error("Lưu thất bại");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (criteria: EvaluationCriteriaResponse) => {
    const r = results[criteria.criteriaId];
    switch (criteria.inputType) {
      case "CHECKBOX":
        return (
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={Boolean(r?.checkboxValue)}
            onChange={(e) => handleChange(criteria, e.target.checked)}
          />
        );
      case "NUMBER":
        return (
          <input
            type="number"
            className="border rounded p-2 w-full"
            value={r?.numberValue ?? ""}
            onChange={(e) => handleChange(criteria, e.target.value)}
          />
        );
      case "DATE":
        return (
          <input
            type="date"
            className="border rounded p-2 w-full"
            value={r?.dateValue ?? ""}
            onChange={(e) => handleChange(criteria, e.target.value)}
          />
        );
      case "SELECT":
        return (
          <input
            type="text"
            className="border rounded p-2 w-full"
            value={r?.selectValue ?? ""}
            onChange={(e) => handleChange(criteria, e.target.value)}
            placeholder="Nhập giá trị chọn"
          />
        );
      default:
        return (
          <input
            type="text"
            className="border rounded p-2 w-full"
            value={r?.textValue ?? ""}
            onChange={(e) => handleChange(criteria, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat.categoryId} className="border rounded p-4">
          <div className="font-semibold mb-3">
            {cat.categoryCode}. {cat.categoryName}
          </div>
          <div className="space-y-3">
            {(criteriaByCat[cat.categoryId] || []).map((cr) => (
              <div
                key={cr.criteriaId}
                className="grid grid-cols-1 md:grid-cols-12 items-center gap-3"
              >
                <div className="md:col-span-8">
                  <div className="text-sm">
                    <span className="font-medium mr-2">{cr.criteriaCode}</span>
                    {cr.criteriaText}
                    {cr.isRequired ? (
                      <span className="text-red-600 ml-1">*</span>
                    ) : null}
                  </div>
                </div>
                <div className="md:col-span-4 flex items-center gap-2">
                  {renderInput(cr)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="text-right">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={saveAll}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu kết quả đánh giá"}
        </button>
      </div>
    </div>
  );
}
