"use client";
import React from "react";

type Props = {
  value: {
    dossierId: number | undefined;
    inspectionNumber: string;
    evaluationDate?: string;
    evaluatorUserId?: number;
    supervisorUserId?: number;
    status?: string;
    notes?: string;
  };
  onChange: (patch: Partial<Props["value"]>) => void;
};

export default function MetaSection({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Dossier ID</span>
          <input
            type="number"
            className="border rounded p-2"
            value={value.dossierId ?? ""}
            onChange={(e) => onChange({ dossierId: Number(e.target.value) })}
            placeholder="Nhập dossierId"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Số phiếu (inspectionNumber)</span>
          <input
            type="text"
            className="border rounded p-2"
            value={value.inspectionNumber}
            onChange={(e) => onChange({ inspectionNumber: e.target.value })}
            placeholder="VD: BMI/2024/001"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Ngày đánh giá</span>
          <input
            type="date"
            className="border rounded p-2"
            value={value.evaluationDate ?? ""}
            onChange={(e) => onChange({ evaluationDate: e.target.value })}
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Evaluator User ID</span>
          <input
            type="number"
            className="border rounded p-2"
            value={value.evaluatorUserId ?? ""}
            onChange={(e) => onChange({ evaluatorUserId: Number(e.target.value) })}
            placeholder="ID người theo dõi"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Supervisor User ID</span>
          <input
            type="number"
            className="border rounded p-2"
            value={value.supervisorUserId ?? ""}
            onChange={(e) => onChange({ supervisorUserId: Number(e.target.value) })}
            placeholder="ID lãnh đạo"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Trạng thái</span>
          <input
            type="text"
            className="border rounded p-2"
            value={value.status ?? ""}
            onChange={(e) => onChange({ status: e.target.value })}
            placeholder="VD: DRAFT/APPROVED"
          />
        </label>
      </div>
      <label className="flex flex-col text-sm">
        <span className="mb-1 font-medium">Ghi chú</span>
        <textarea
          className="border rounded p-2"
          rows={3}
          value={value.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </label>
    </div>
  );
}

