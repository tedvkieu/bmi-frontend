// components/CategorySection.tsx
import {
  Category,
  Criteria,
  TeamMember,
  EvaluationData,
  InspectorUser,
} from "../types/evaluation";
import CriteriaEvaluation from "./CriteriaEvaluation";
import TeamMembersTable from "./TeamMemberSection";

interface CategorySectionProps {
  category: Category;
  criteria: Criteria[];
  teamMembers: TeamMember[];
  evaluationData: EvaluationData;
  inspectors: InspectorUser[];
  showBSelector: boolean;
  selectedBUsers: number[];
  onEvaluationChange: (criteriaId: number, value: "YES" | "NO") => void;
  onToggleBSelector: () => void;
  onSelectBUsers: (users: number[]) => void;
  onAssignB: (
    members: {
      userId: number;
      roleCode: string;
    }[]
  ) => Promise<void>;
  onAssignTaskLetter?: (
    task: "A" | "C" | "D",
    userId: number | null
  ) => Promise<void>;
  selectedAssigneesByTask?: Record<string, number | undefined | null>;
  teamReadyForACD?: boolean;
}

export default function CategorySection({
  category,
  criteria,
  teamMembers,
  evaluationData,
  inspectors,
  showBSelector,
  selectedBUsers,
  onEvaluationChange,
  onToggleBSelector,
  onSelectBUsers,
  onAssignB,
  onAssignTaskLetter,
  selectedAssigneesByTask,
  teamReadyForACD,
}: CategorySectionProps) {
  // Map category order to letter A/B/C/D
  const categoryLetter = String.fromCharCode(
    64 + (category.categoryOrder || 0)
  ) as "A" | "B" | "C" | "D";

  // Prepare assignees for this section based on assignTask

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 p-3 bg-blue-50 rounded-lg">
        {category.categoryName}
      </h3>

      {/* Assigned staff selector for sections A, C, D (single select) */}
      {categoryLetter !== "B" && (
        <div className="mb-4 flex items-center gap-3 text-sm text-gray-700">
          <span className="font-medium">Nhân viên thực hiện:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedAssigneesByTask?.[categoryLetter] || ""}
            disabled={!teamReadyForACD}
            onChange={(e) =>
              onAssignTaskLetter &&
              onAssignTaskLetter(
                categoryLetter,
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">-- Chọn 1 người --</option>
            {inspectors.map((ins) => (
              <option key={ins.userId} value={ins.userId}>
                {ins.fullName}
              </option>
            ))}
          </select>
          {!teamReadyForACD && (
            <span className="text-red-600">
              (Vui lòng phân công mục B trước)
            </span>
          )}
        </div>
      )}

      {/* Team Members Table for Category B (Preparation) */}
      {category.categoryCode === "PREPARATION" && (
        <TeamMembersTable
          teamMembers={teamMembers}
          inspectors={inspectors}
          showBSelector={showBSelector}
          selectedBUsers={selectedBUsers}
          onToggleBSelector={onToggleBSelector}
          onSelectBUsers={onSelectBUsers}
          onAssignB={onAssignB}
        />
      )}

      <CriteriaEvaluation
        criteria={criteria}
        evaluationData={evaluationData}
        onEvaluationChange={onEvaluationChange}
      />
    </div>
  );
}
