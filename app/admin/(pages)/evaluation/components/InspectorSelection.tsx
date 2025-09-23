// components/InspectorSelector.tsx
import { InspectorUser } from "../types/evaluation";

interface InspectorSelectorProps {
  inspectors: InspectorUser[];
  selectedBUsers: number[];
  onSelectBUsers: (users: number[]) => void;
}

export default function InspectorSelector({
  inspectors,
  selectedBUsers,
  onSelectBUsers,
}: InspectorSelectorProps) {
  const handleInspectorToggle = (userId: number, checked: boolean) => {
    if (checked) {
      onSelectBUsers(Array.from(new Set([...selectedBUsers, userId])));
    } else {
      onSelectBUsers(selectedBUsers.filter((id) => id !== userId));
    }
  };

  return (
    <div className="mt-4 p-3 border rounded bg-white">
      <div className="mb-2 font-medium text-gray-700">
        Danh sách Giám định viên (INSPECTOR)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 max-h-64 overflow-auto">
        {inspectors.map((inspector) => (
          <label
            key={inspector.userId}
            className="flex items-center gap-2 text-gray-700"
          >
            <input
              type="checkbox"
              checked={selectedBUsers.includes(inspector.userId)}
              onChange={(e) =>
                handleInspectorToggle(inspector.userId, e.target.checked)
              }
            />
            <span>{inspector.fullName}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
