// components/TeamMembersTable.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { TeamMember, InspectorUser } from "../types/evaluation";

interface TeamMembersTableProps {
  teamMembers: TeamMember[];
  inspectors: InspectorUser[];
  showBSelector: boolean;
  selectedBUsers: number[];
  onToggleBSelector: () => void;
  onSelectBUsers: (users: number[]) => void;
  onAssignB: (
    members: {
      userId: number;
      roleCode: "TEAM_LEADER" | "MEMBER" | "TRAINEE";
    }[]
  ) => Promise<void>;
}

export default function TeamMembersTable({
  teamMembers,
  inspectors,
  selectedBUsers,
  onSelectBUsers,
  onAssignB,
}: TeamMembersTableProps) {
  // const getRoleDisplayInfo = (roleCode: string) => {
  //   switch (roleCode) {
  //     case "TEAM_LEADER":
  //       return { role: "Trưởng nhóm giám định", code: "GĐV", isLeader: true };
  //     case "MEMBER":
  //       return { role: "GĐV - thành viên", code: "", isLeader: false };
  //     case "TRAINEE":
  //       return { role: "GĐV Tập sự", code: "", isLeader: false };
  //     default:
  //       return { role: "", code: "", isLeader: false };
  //   }
  // };

  // Roles by fixed row index (0..3)
  const [rolesByRow, setRolesByRow] = useState<
    Record<number, "TEAM_LEADER" | "MEMBER" | "TRAINEE">
  >({});

  // Initialize from teamMembers who have B in assignTask, leader first, limit 4 rows
  useEffect(() => {
    const bMembers = teamMembers
      .filter((m) =>
        (m.assignTask || "")
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .includes("B")
      )
      .sort((a, b) => {
        const aLeader = a.roleCode === "TEAM_LEADER" ? 1 : 0;
        const bLeader = b.roleCode === "TEAM_LEADER" ? 1 : 0;
        if (aLeader !== bLeader) return bLeader - aLeader; // leader first
        return (a.fullName || "").localeCompare(b.fullName || "");
      })
      .slice(0, 4);

    const preUsers: number[] = [0, 0, 0, 0];
    const preRoles: Record<number, "TEAM_LEADER" | "MEMBER" | "TRAINEE"> = {};
    bMembers.forEach((m, idx) => {
      preUsers[idx] = m.userId as number;
      preRoles[idx] = (m.roleCode as any) || "MEMBER";
    });
    // Ensure row 0 hosts the leader if exists
    const leaderIdx = Object.entries(preRoles).find(
      ([r]) => r === "TEAM_LEADER"
    )?.[0];
    if (leaderIdx && Number(leaderIdx) !== 0) {
      const li = Number(leaderIdx);
      const tmpUser = preUsers[0];
      const tmpRole = preRoles[0];
      preUsers[0] = preUsers[li];
      preRoles[0] = preRoles[li];
      preUsers[li] = tmpUser;
      preRoles[li] = tmpRole || "MEMBER";
    }
    onSelectBUsers(preUsers);
    setRolesByRow(preRoles);
  }, [teamMembers, onSelectBUsers]);

  const handleSelectChange = (rowIndex: number, inspectorId: number) => {
    const newSelection = [...selectedBUsers];
    newSelection[rowIndex] = inspectorId;
    onSelectBUsers(newSelection);
    if (inspectorId && !rolesByRow[rowIndex]) {
      // Default role per row: row0 default leader, others default member
      setRolesByRow((prev) => ({
        ...prev,
        [rowIndex]: rowIndex === 0 ? "TEAM_LEADER" : "MEMBER",
      }));
    }
  };

  const setRoleForRow = (
    rowIndex: number,
    role: "TEAM_LEADER" | "MEMBER" | "TRAINEE"
  ) => {
    setRolesByRow((prev) => ({ ...prev, [rowIndex]: role }));
  };

  const selectedMembersPayload = useMemo(() => {
    const seen = new Set<number>();
    const result: {
      userId: number;
      roleCode: "TEAM_LEADER" | "MEMBER" | "TRAINEE";
    }[] = [];
    selectedBUsers.forEach((uid, idx) => {
      if (!uid || seen.has(uid)) return;
      const role = rolesByRow[idx] || (idx === 0 ? "TEAM_LEADER" : "MEMBER");
      seen.add(uid);
      result.push({ userId: uid, roleCode: role });
    });
    return result;
  }, [selectedBUsers, rolesByRow]);

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
            {/* <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
              Thành viên hiện tại
            </th> */}
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
              Chức vụ
            </th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3].map((row) => {
            const selectedSet = new Set(
              selectedBUsers.filter((v, i) => i !== row && !!v)
            );
            return (
              <tr key={row}>
                <td className="border border-gray-300 text-gray-600 px-4 py-2 text-center">
                  {row + 1}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <select
                    value={selectedBUsers[row] || ""}
                    onChange={(e) =>
                      handleSelectChange(row, Number(e.target.value))
                    }
                    className="w-full text-gray-600 border rounded px-2 py-1 text-sm"
                  >
                    <option value="">-- Chọn giám định viên --</option>
                    {inspectors.map((inspector) => (
                      <option
                        key={inspector.userId}
                        value={inspector.userId}
                        disabled={selectedSet.has(inspector.userId)}
                      >
                        {inspector.fullName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {row === 0 ? (
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            (rolesByRow[row] || "TEAM_LEADER") === "TEAM_LEADER"
                          }
                          onChange={() => setRoleForRow(row, "TEAM_LEADER")}
                          className="mr-2"
                        />
                        <span className="text-gray-600 font-medium">
                          Trưởng nhóm giám định
                        </span>
                      </label>
                      <label className="flex text-gray-600 items-center">
                        <input
                          type="checkbox"
                          checked={rolesByRow[row] === "MEMBER"}
                          onChange={() => setRoleForRow(row, "MEMBER")}
                          className="mr-2"
                        />
                        <span> GĐV</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(rolesByRow[row] || "MEMBER") === "MEMBER"}
                          onChange={() => setRoleForRow(row, "MEMBER")}
                          className="mr-2"
                        />
                        <span className="text-gray-600 font-medium">
                          GĐV - thành viên
                        </span>
                      </label>
                      <label className="flex text-gray-600 items-center">
                        <input
                          type="checkbox"
                          checked={rolesByRow[row] === "TRAINEE"}
                          onChange={() => setRoleForRow(row, "TRAINEE")}
                          className="mr-2"
                        />
                        <span>GĐV Tập sự</span>
                      </label>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between">
        {/* <button
          type="button"
          onClick={onToggleBSelector}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showBSelector
            ? "Đóng chọn nhân viên (B)"
            : "Chọn nhân viên thực hiện (B)"}
        </button> */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Đã chọn: {selectedBUsers.length} giám định viên
          </span>
          <button
            type="button"
            onClick={async () => {
              // Enforce exactly one TEAM_LEADER and that it is on row 0
              const leaders = selectedMembersPayload.filter(
                (m) => m.roleCode === "TEAM_LEADER"
              );
              const row0User = selectedBUsers[0];
              const row0IsLeader =
                (rolesByRow[0] || "TEAM_LEADER") === "TEAM_LEADER" &&
                !!row0User;
              if (!row0IsLeader || leaders.length !== 1) {
                alert("Hàng 1 phải là Trưởng nhóm (và chỉ có 1 Trưởng nhóm)");
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

      {/* {showBSelector && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Chọn nhanh tất cả giám định viên:
          </h4>
          <InspectorSelector
            inspectors={inspectors}
            selectedBUsers={selectedBUsers}
            onSelectBUsers={onSelectBUsers}
          />
        </div>
      )} */}
    </div>
  );
}
