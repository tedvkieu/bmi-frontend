// components/CriteriaEvaluation.tsx
import { Criteria, EvaluationData } from "../types/evaluation";

interface CriteriaEvaluationProps {
  criteria: Criteria[];
  evaluationData: EvaluationData;
  onEvaluationChange: (criteriaId: number, value: "YES" | "NO") => void;
}

export default function CriteriaEvaluation({
  criteria,
  evaluationData,
  onEvaluationChange,
}: CriteriaEvaluationProps) {
  return (
    <div className="space-y-6">
      {criteria.map((criterion) => (
        <div
          key={criterion.criteriaId}
          className="border-l-4 border-gray-200 pl-4"
        >
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium mr-2">
              {criterion.criteriaCode}
            </span>
            <span className="text-gray-900">{criterion.criteriaText}</span>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={evaluationData[criterion.criteriaId] === "YES"}
                onChange={() => onEvaluationChange(criterion.criteriaId, "YES")}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-green-700 font-medium">Có</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={evaluationData[criterion.criteriaId] === "NO"}
                onChange={() => onEvaluationChange(criterion.criteriaId, "NO")}
                className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-red-700 font-medium">Không</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
