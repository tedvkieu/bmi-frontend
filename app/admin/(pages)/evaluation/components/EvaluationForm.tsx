// components/EvaluationForm.tsx
import {
  DossierInfo,
  Category,
  Criteria,
  TeamMember,
  DocumentType,
  EvaluationData,
  DocumentCheckData,
  InspectorUser,
} from "../types/evaluation";
import CategorySection from "./CategorySection";
import DocumentChecklist from "./DocumentChecklist";

interface EvaluationFormProps {
  dossierInfo: DossierInfo;
  categories: Category[];
  criteria: Criteria[];
  teamMembers: TeamMember[];
  documentTypes: DocumentType[];
  evaluationData: EvaluationData;
  documentCheckData: DocumentCheckData;
  inspectors: InspectorUser[];
  showBSelector: boolean;
  selectedBUsers: number[];
  saving: boolean;
  // Progress + UX
  criteriaAnswered: number;
  totalCriteria: number;
  documentsCompleted: number;
  totalDocuments: number;
  teamReadyForACD: boolean;
  lastSavedAt?: Date | null;
  onEvaluationChange: (criteriaId: number, value: "YES" | "NO") => void;
  onDocumentCheckChange: (
    documentTypeId: number,
    type: "hasHardCopy" | "hasElectronic",
    value: boolean
  ) => void;
  onToggleBSelector: () => void;
  onSelectBUsers: (users: number[]) => void;
  onAssignB: (
    members: {
      userId: number;
      roleCode: string;
    }[]
  ) => Promise<void>;
  onAssignTaskLetter: (
    task: "A" | "C" | "D",
    userId: number | null
  ) => Promise<void>;
  selectedAssigneesByTask: Record<string, number | undefined | null>;
  onSave: () => Promise<void>;
  onBack: () => void;
}

export default function EvaluationForm({
  categories,
  criteria,
  teamMembers,
  documentTypes,
  evaluationData,
  documentCheckData,
  inspectors,
  showBSelector,
  selectedBUsers,
  saving,
  criteriaAnswered,
  totalCriteria,
  documentsCompleted,
  totalDocuments,
  teamReadyForACD,
  lastSavedAt,
  onEvaluationChange,
  onDocumentCheckChange,
  onToggleBSelector,
  onSelectBUsers,
  onAssignB,
  onAssignTaskLetter,
  selectedAssigneesByTask,
  onSave,
  onBack,
}: EvaluationFormProps) {
  const getCriteriaByCategory = (categoryId: number) => {
    return criteria
      .filter((c) => c.categoryId === categoryId && c.isActive)
      .sort((a, b) => a.criteriaOrder - b.criteriaOrder);
  };

  const criteriaPct =
    totalCriteria > 0
      ? Math.round((criteriaAnswered / totalCriteria) * 100)
      : 0;
  const docsPct =
    totalDocuments > 0
      ? Math.round((documentsCompleted / totalDocuments) * 100)
      : 0;
  const allComplete = teamReadyForACD && criteriaPct === 100 && docsPct === 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-gray-700 font-semibold">
            Biểu mẫu đánh giá
          </h2>
          <div className="text-xs text-green-700">
            {lastSavedAt
              ? `Đã lưu lúc ${new Date(lastSavedAt).toLocaleTimeString(
                  "vi-VN"
                )}`
              : ""}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border rounded">
            <div className="text-xs text-gray-600 mb-1">Tiêu chí</div>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${criteriaPct}%` }}
              />
            </div>
            <div className="text-xs text-gray-700 mt-1">
              {criteriaAnswered}/{totalCriteria} ({criteriaPct}%)
            </div>
          </div>
          <div className="p-3 border rounded">
            <div className="text-xs text-gray-600 mb-1">Hồ sơ</div>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-emerald-600 rounded"
                style={{ width: `${docsPct}%` }}
              />
            </div>
            <div className="text-xs text-gray-700 mt-1">
              {documentsCompleted}/{totalDocuments} ({docsPct}%)
            </div>
          </div>
          <div
            className={`p-3 border rounded ${
              teamReadyForACD ? "bg-green-50" : "bg-yellow-50"
            }`}
          >
            <div className="text-xs text-gray-600 mb-1">Tổ chức (mục B)</div>
            <div
              className={`text-sm ${
                teamReadyForACD ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {teamReadyForACD
                ? "Sẵn sàng (đã có Trưởng nhóm)"
                : "Chưa sẵn sàng (phân công mục B)"}
            </div>
          </div>
        </div>
      </div>

      {categories
        .sort((a, b) => a.categoryOrder - b.categoryOrder)
        .map((category) => {
          const categoryCriteria = getCriteriaByCategory(category.categoryId);
          if (categoryCriteria.length === 0) return null;

          return (
            <CategorySection
              key={category.categoryId}
              category={category}
              criteria={categoryCriteria}
              teamMembers={teamMembers}
              evaluationData={evaluationData}
              inspectors={inspectors}
              showBSelector={showBSelector}
              selectedBUsers={selectedBUsers}
              onEvaluationChange={onEvaluationChange}
              onToggleBSelector={onToggleBSelector}
              onSelectBUsers={onSelectBUsers}
              onAssignB={onAssignB}
              onAssignTaskLetter={onAssignTaskLetter}
              selectedAssigneesByTask={selectedAssigneesByTask}
              teamReadyForACD={teamReadyForACD}
            />
          );
        })}

      <DocumentChecklist
        documentTypes={documentTypes}
        documentCheckData={documentCheckData}
        onDocumentCheckChange={onDocumentCheckChange}
      />

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <button
            onClick={onBack}
            type="button"
            className="w-full text-gray-600 md:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Tìm hồ sơ khác
          </button>
          <div className="flex-1" />
          <button
            onClick={onSave}
            className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold text-white ${
              allComplete
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-60`}
            disabled={saving}
          >
            {saving
              ? "Đang lưu..."
              : allComplete
              ? "Lưu & Hoàn tất"
              : "Lưu đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}
