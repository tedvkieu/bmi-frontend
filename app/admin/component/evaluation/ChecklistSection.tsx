"use client";
import React, { useEffect, useState } from "react";
import {
  DossierDocumentTypeResponse,
  DossierDocumentsChecklistRequest,
  DossierDocumentsChecklistResponse,
  getAllDocumentTypes,
  getChecklistByEvaluation,
  createChecklistItem,
  updateChecklistItem,
} from "../../services/evaluationApi";
import toast from "react-hot-toast";

type Props = { evaluationId: number };

type Item = DossierDocumentsChecklistResponse & { _isNew?: boolean };

export default function ChecklistSection({ evaluationId }: Props) {
  const [types, setTypes] = useState<DossierDocumentTypeResponse[]>([]);
  const [items, setItems] = useState<Record<number, Item>>({}); // key by documentTypeId
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [t, list] = await Promise.all([
          getAllDocumentTypes(),
          getChecklistByEvaluation(evaluationId),
        ]);
        const active = t.filter((d) => d.isActive !== false).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        setTypes(active);
        const map: Record<number, Item> = {};
        list.forEach((i) => (map[i.documentTypeId] = i));
        setItems(map);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [evaluationId]);

  const toggle = (documentTypeId: number, field: keyof Pick<Item, "hasPhysicalCopy" | "hasElectronicCopy">, value: boolean) => {
    setItems((prev) => {
      const current = prev[documentTypeId] || ({} as any);
      return {
        ...prev,
        [documentTypeId]: {
          ...current,
          evaluationId,
          documentTypeId,
          [field]: value,
        } as Item,
      };
    });
  };

  const setNotes = (documentTypeId: number, notes: string) => {
    setItems((prev) => {
      const current = prev[documentTypeId] || ({} as any);
      return { ...prev, [documentTypeId]: { ...current, evaluationId, documentTypeId, notes } as Item };
    });
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      const tasks = types.map(async (t) => {
        const data = items[t.documentTypeId];
        const payload: DossierDocumentsChecklistRequest = {
          evaluationId,
          documentTypeId: t.documentTypeId,
          hasPhysicalCopy: data?.hasPhysicalCopy ?? false,
          hasElectronicCopy: data?.hasElectronicCopy ?? false,
          electronicFilePath: data?.electronicFilePath,
          notes: data?.notes,
        };
        if (data && data.checklistId) {
          return updateChecklistItem(data.checklistId, payload);
        } else {
          return createChecklistItem(payload);
        }
      });
      const saved = await Promise.all(tasks);
      const map: Record<number, Item> = {};
      saved.forEach((s) => (map[s.documentTypeId] = s));
      setItems(map);
      toast.success("Đã lưu checklist tài liệu");
    } catch (e) {
      console.error(e);
      toast.error("Lưu checklist thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {types.map((t) => (
        <div key={t.documentTypeId} className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 border rounded p-3">
          <div className="md:col-span-6">
            <div className="font-medium">{t.typeCode} - {t.typeName}</div>
            <div className="text-xs text-gray-500">{t.category}</div>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4"
                checked={Boolean(items[t.documentTypeId]?.hasPhysicalCopy)}
                onChange={(e) => toggle(t.documentTypeId, "hasPhysicalCopy", e.target.checked)} />
              Bản giấy
            </label>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4"
                checked={Boolean(items[t.documentTypeId]?.hasElectronicCopy)}
                onChange={(e) => toggle(t.documentTypeId, "hasElectronicCopy", e.target.checked)} />
              Bản điện tử
            </label>
          </div>
          <div className="md:col-span-2">
            <input
              className="border rounded p-2 w-full"
              placeholder="Ghi chú"
              value={items[t.documentTypeId]?.notes ?? ""}
              onChange={(e) => setNotes(t.documentTypeId, e.target.value)}
            />
          </div>
        </div>
      ))}
      <div className="text-right">
        <button className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60" onClick={saveAll} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu checklist"}
        </button>
      </div>
    </div>
  );
}

