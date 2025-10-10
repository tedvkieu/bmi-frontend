"use client";
import { useEffect, useMemo, useState } from "react";
import { TeamMember, InspectorUser } from "../types/evaluation";

interface TeamMembersTableProps {
  teamMembers: TeamMember[];
  inspectors: InspectorUser[];
  showBSelector: boolean; // Keep for now, but might be removed if the new button replaces its functionality
  selectedBUsers: number[];
  onToggleBSelector: () => void; // Keep for now, but might be removed
  onSelectBUsers: (users: number[]) => void;
  onAssignB: (
    members: {
      userId: number;
      roleCode: string;
    }[]
  ) => Promise<void>;
}

export default function TeamMembersTable({
  teamMembers,
  inspectors,
  selectedBUsers, // Prop này được kiểm soát từ component cha, nên chúng ta cần điều chỉnh cách tương tác
  onSelectBUsers, // Prop này để gửi cập nhật về component cha
  onAssignB,
}: TeamMembersTableProps) {
  const [rolesByRow, setRolesByRow] = useState<Record<number, string>>({});

  // Danh sách role từ BE (combobox)
  const [allRoles, setAllRoles] = useState<
    { roleId: number; roleCode: string; roleName: string }[]
  >([]);

  useEffect(() => {
    // Lấy toàn bộ role cho mỗi user (không ràng buộc trưởng nhóm)
    const loadRoles = async () => {
      try {
        const res = await fetch(`/api/evaluations/roles/all`);
        if (!res.ok) return;
        const data = await res.json();
        setAllRoles(
          (data || []).map((r: any) => ({
            roleId: r.roleId,
            roleCode: r.roleCode,
            roleName: r.roleName,
          }))
        );
      } catch (e) {
        console.error("Error fetching roles:", e);
      }
    };
    loadRoles();
  }, []);
  const [numRows, setNumRows] = useState(4); // Start with 4 rows by default

  // Đồng bộ từ dữ liệu teamMembers mỗi khi backend trả về (khởi tạo hoặc sau khi lưu)
  useEffect(() => {
    const bMembers = teamMembers
      .filter((m) =>
        (m.assignTask || "")
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .includes("B")
      )
      .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));

    const initialNumRows = Math.max(4, bMembers.length);
    setNumRows(initialNumRows);

    const preUsers: number[] = new Array(initialNumRows).fill(0);
    const preRoles: Record<number, string> = {};

    bMembers.forEach((m, idx) => {
      if (idx < initialNumRows) {
        preUsers[idx] = m.userId as number;
        preRoles[idx] = m.roleCode || "MEMBER";
      }
    });

    onSelectBUsers(preUsers);
    setRolesByRow(preRoles);
  }, [teamMembers, onSelectBUsers]);

  // Nếu số user được chọn lớn hơn số hàng hiện tại, mở rộng số hàng
  useEffect(() => {
    if (selectedBUsers.length > numRows) {
      setNumRows(selectedBUsers.length);
    }
  }, [selectedBUsers, numRows]);

  const handleSelectChange = (rowIndex: number, inspectorId: number) => {
    const newSelection = [...selectedBUsers];
    // Đảm bảo mảng đủ lớn để chứa rowIndex
    while (newSelection.length <= rowIndex) {
      newSelection.push(0);
    }
    newSelection[rowIndex] = inspectorId;
    onSelectBUsers(newSelection); // Cập nhật trạng thái ở component cha

    // Nếu chọn một inspector mới và chưa có vai trò, gán vai trò mặc định
    if (inspectorId && !rolesByRow[rowIndex]) {
      // Ưu tiên MEMBER nếu tồn tại, ngược lại lấy role đầu tiên
      const defaultRole =
        allRoles.find((r) => r.roleCode === "MEMBER")?.roleCode ||
        allRoles[0]?.roleCode ||
        "MEMBER";
      setRolesByRow((prev) => ({
        ...prev,
        [rowIndex]: defaultRole,
      }));
    } else if (!inspectorId) {
      // Nếu bỏ chọn giám định viên, có thể xóa vai trò hoặc đặt về mặc định
      setRolesByRow((prev) => {
        const newRoles = { ...prev };
        delete newRoles[rowIndex]; // Xóa vai trò khi không có giám định viên
        return newRoles;
      });
    }
  };

  const setRoleForRow = (rowIndex: number, role: string) => {
    setRolesByRow((prev) => ({ ...prev, [rowIndex]: role }));
  };

  const selectedMembersPayload = useMemo(() => {
    const seen = new Set<number>();
    const result: {
      userId: number;
      roleCode: string;
    }[] = [];

    // Lặp qua số hàng hiện tại thay vì độ dài của selectedBUsers
    for (let i = 0; i < numRows; i++) {
      const uid = selectedBUsers[i];
      if (!uid || seen.has(uid)) continue; // Bỏ qua nếu không có userId hoặc đã chọn

      const role =
        rolesByRow[i] ||
        allRoles.find((r) => r.roleCode === "MEMBER")?.roleCode ||
        allRoles[0]?.roleCode ||
        "MEMBER";
      seen.add(uid);
      result.push({ userId: uid, roleCode: role });
    }
    return result;
  }, [selectedBUsers, rolesByRow, numRows, allRoles]);

  const handleAddRow = () => {
    setNumRows((prev) => prev + 1);
    // Thêm một giá trị mặc định vào mảng selectedBUsers cho hàng mới
    onSelectBUsers([...selectedBUsers, 0]);
    // Không cần thay đổi rolesByRow ở đây, nó sẽ được gán khi người dùng chọn GĐV
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (numRows <= 1) return; // Không cho phép xóa hàng cuối cùng

    setNumRows((prev) => prev - 1);

    // Cập nhật selectedBUsers: lọc bỏ phần tử ở rowIndex
    const newSelectedBUsers = selectedBUsers.filter(
      (_, idx) => idx !== rowIndex
    );
    onSelectBUsers(newSelectedBUsers);

    // Cập nhật rolesByRow: xóa vai trò của hàng bị xóa và điều chỉnh chỉ mục của các hàng phía sau
    setRolesByRow((prev) => {
      const newRoles = { ...prev };
      delete newRoles[rowIndex]; // Xóa vai trò của hàng bị xóa
      const adjustedRoles: Record<number, string> = {};
      Object.entries(newRoles).forEach(([key, value]) => {
        const oldKey = Number(key);
        if (oldKey > rowIndex) {
          adjustedRoles[oldKey - 1] = value; // Điều chỉnh chỉ mục
        } else {
          adjustedRoles[oldKey] = value;
        }
      });
      return adjustedRoles;
    });
  };

  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-600">
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
              STT
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
              Giám định viên thực hiện
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
              Chức vụ
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: numRows }).map((_, row) => {
            // Tạo một tập hợp các userId đã được chọn ở các hàng khác để vô hiệu hóa
            const selectedSet = new Set(
              selectedBUsers.filter((v, i) => i !== row && !!v)
            );
            const currentSelectedUser = selectedBUsers[row] || 0;

            return (
              <tr key={row}>
                <td className="border border-gray-300 text-gray-600 px-4 py-2 text-center">
                  {row + 1}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <select
                    value={currentSelectedUser} // Sử dụng giá trị từ selectedBUsers prop
                    onChange={(e) =>
                      handleSelectChange(row, Number(e.target.value))
                    }
                    className="w-full text-gray-600 border rounded px-2 py-1 text-sm"
                  >
                    <option value={0}>-- Chọn giám định viên --</option>
                    {inspectors.map((inspector) => (
                      <option
                        key={inspector.userId}
                        value={inspector.userId}
                        // Vô hiệu hóa nếu đã được chọn ở hàng khác và không phải là người được chọn hiện tại của hàng này
                        disabled={
                          selectedSet.has(inspector.userId) &&
                          inspector.userId !== currentSelectedUser
                        }
                      >
                        {inspector.fullName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <select
                    value={rolesByRow[row] || ""}
                    onChange={(e) => setRoleForRow(row, e.target.value)}
                    className="w-full text-gray-600 border rounded px-2 py-1 text-sm"
                    disabled={!currentSelectedUser}
                  >
                    <option value="" disabled>
                      -- Chọn chức vụ --
                    </option>
                    {allRoles.map((r) => (
                      <option key={r.roleId} value={r.roleCode}>
                        {r.roleName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {numRows > 1 && ( // Chỉ hiển thị nút xóa nếu có nhiều hơn 1 hàng
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAddRow}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thêm thành viên
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Đã chọn: {selectedMembersPayload.length} giám định viên
          </span>
          <button
            type="button"
            onClick={async () => {
              // Kiểm tra xem payload có rỗng không
              if (selectedMembersPayload.length === 0) {
                alert("Vui lòng chọn ít nhất một giám định viên.");
                return;
              }

              await onAssignB(selectedMembersPayload);
            }}
            disabled={selectedMembersPayload.length === 0}
            className={`px-4 py-2 text-white rounded ${
              selectedMembersPayload.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Lưu phân công B
          </button>
        </div>
      </div>
    </div>
  );
}
