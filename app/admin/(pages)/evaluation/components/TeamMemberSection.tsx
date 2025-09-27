// // components/TeamMembersTable.tsx
// "use client";
// import { useEffect, useMemo, useState } from "react";
// import { TeamMember, InspectorUser } from "../types/evaluation";

// interface TeamMembersTableProps {
//   teamMembers: TeamMember[];
//   inspectors: InspectorUser[];
//   showBSelector: boolean;
//   selectedBUsers: number[];
//   onToggleBSelector: () => void;
//   onSelectBUsers: (users: number[]) => void;
//   onAssignB: (
//     members: {
//       userId: number;
//       roleCode: "TEAM_LEADER" | "MEMBER" | "TRAINEE";
//     }[]
//   ) => Promise<void>;
// }

// export default function TeamMembersTable({
//   teamMembers,
//   inspectors,
//   selectedBUsers,
//   onSelectBUsers,
//   onAssignB,
// }: TeamMembersTableProps) {
//   // const getRoleDisplayInfo = (roleCode: string) => {
//   //   switch (roleCode) {
//   //     case "TEAM_LEADER":
//   //       return { role: "Trưởng nhóm giám định", code: "GĐV", isLeader: true };
//   //     case "MEMBER":
//   //       return { role: "GĐV - thành viên", code: "", isLeader: false };
//   //     case "TRAINEE":
//   //       return { role: "GĐV Tập sự", code: "", isLeader: false };
//   //     default:
//   //       return { role: "", code: "", isLeader: false };
//   //   }
//   // };

//   // Roles by fixed row index (0..3)
//   const [rolesByRow, setRolesByRow] = useState<
//     Record<number, "TEAM_LEADER" | "MEMBER" | "TRAINEE">
//   >({});

//   // Initialize from teamMembers who have B in assignTask, leader first, limit 4 rows
//   useEffect(() => {
//     const bMembers = teamMembers
//       .filter((m) =>
//         (m.assignTask || "")
//           .split(",")
//           .map((s) => s.trim().toUpperCase())
//           .includes("B")
//       )
//       .sort((a, b) => {
//         const aLeader = a.roleCode === "TEAM_LEADER" ? 1 : 0;
//         const bLeader = b.roleCode === "TEAM_LEADER" ? 1 : 0;
//         if (aLeader !== bLeader) return bLeader - aLeader; // leader first
//         return (a.fullName || "").localeCompare(b.fullName || "");
//       })
//       .slice(0, 4);

//     const preUsers: number[] = [0, 0, 0, 0];
//     const preRoles: Record<number, "TEAM_LEADER" | "MEMBER" | "TRAINEE"> = {};
//     bMembers.forEach((m, idx) => {
//       preUsers[idx] = m.userId as number;
//       preRoles[idx] = (m.roleCode as any) || "MEMBER";
//     });
//     // Ensure row 0 hosts the leader if exists
//     const leaderIdx = Object.entries(preRoles).find(
//       ([r]) => r === "TEAM_LEADER"
//     )?.[0];
//     if (leaderIdx && Number(leaderIdx) !== 0) {
//       const li = Number(leaderIdx);
//       const tmpUser = preUsers[0];
//       const tmpRole = preRoles[0];
//       preUsers[0] = preUsers[li];
//       preRoles[0] = preRoles[li];
//       preUsers[li] = tmpUser;
//       preRoles[li] = tmpRole || "MEMBER";
//     }
//     onSelectBUsers(preUsers);
//     setRolesByRow(preRoles);
//   }, [teamMembers, onSelectBUsers]);

//   const handleSelectChange = (rowIndex: number, inspectorId: number) => {
//     const newSelection = [...selectedBUsers];
//     newSelection[rowIndex] = inspectorId;
//     onSelectBUsers(newSelection);
//     if (inspectorId && !rolesByRow[rowIndex]) {
//       // Default role per row: row0 default leader, others default member
//       setRolesByRow((prev) => ({
//         ...prev,
//         [rowIndex]: rowIndex === 0 ? "TEAM_LEADER" : "MEMBER",
//       }));
//     }
//   };

//   const setRoleForRow = (
//     rowIndex: number,
//     role: "TEAM_LEADER" | "MEMBER" | "TRAINEE"
//   ) => {
//     setRolesByRow((prev) => ({ ...prev, [rowIndex]: role }));
//   };

//   const selectedMembersPayload = useMemo(() => {
//     const seen = new Set<number>();
//     const result: {
//       userId: number;
//       roleCode: "TEAM_LEADER" | "MEMBER" | "TRAINEE";
//     }[] = [];
//     selectedBUsers.forEach((uid, idx) => {
//       if (!uid || seen.has(uid)) return;
//       const role = rolesByRow[idx] || (idx === 0 ? "TEAM_LEADER" : "MEMBER");
//       seen.add(uid);
//       result.push({ userId: uid, roleCode: role });
//     });
//     return result;
//   }, [selectedBUsers, rolesByRow]);

//   return (
//     <div className="mb-6 bg-gray-50 p-4 rounded-lg">
//       <table className="w-full border border-gray-300">
//         <thead>
//           <tr className="bg-gray-600">
//             <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
//               STT
//             </th>

//             <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
//               Giám định viên thực hiện
//             </th>
//             {/* <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
//               Thành viên hiện tại
//             </th> */}
//             <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-white">
//               Chức vụ
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {[0, 1, 2, 3].map((row) => {
//             const selectedSet = new Set(
//               selectedBUsers.filter((v, i) => i !== row && !!v)
//             );
//             return (
//               <tr key={row}>
//                 <td className="border border-gray-300 text-gray-600 px-4 py-2 text-center">
//                   {row + 1}
//                 </td>
//                 <td className="border border-gray-300 px-4 py-2">
//                   <select
//                     value={selectedBUsers[row] || ""}
//                     onChange={(e) =>
//                       handleSelectChange(row, Number(e.target.value))
//                     }
//                     className="w-full text-gray-600 border rounded px-2 py-1 text-sm"
//                   >
//                     <option value="">-- Chọn giám định viên --</option>
//                     {inspectors.map((inspector) => (
//                       <option
//                         key={inspector.userId}
//                         value={inspector.userId}
//                         disabled={selectedSet.has(inspector.userId)}
//                       >
//                         {inspector.fullName}
//                       </option>
//                     ))}
//                   </select>
//                 </td>
//                 <td className="border border-gray-300 px-4 py-2">
//                   {row === 0 ? (
//                     <div className="flex gap-4">
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={
//                             (rolesByRow[row] || "TEAM_LEADER") === "TEAM_LEADER"
//                           }
//                           onChange={() => setRoleForRow(row, "TEAM_LEADER")}
//                           className="mr-2"
//                         />
//                         <span className="text-gray-600 font-medium">
//                           Trưởng nhóm giám định
//                         </span>
//                       </label>
//                       <label className="flex text-gray-600 items-center">
//                         <input
//                           type="checkbox"
//                           checked={rolesByRow[row] === "MEMBER"}
//                           onChange={() => setRoleForRow(row, "MEMBER")}
//                           className="mr-2"
//                         />
//                         <span> GĐV</span>
//                       </label>
//                     </div>
//                   ) : (
//                     <div className="flex gap-4">
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={(rolesByRow[row] || "MEMBER") === "MEMBER"}
//                           onChange={() => setRoleForRow(row, "MEMBER")}
//                           className="mr-2"
//                         />
//                         <span className="text-gray-600 font-medium">
//                           GĐV - thành viên
//                         </span>
//                       </label>
//                       <label className="flex text-gray-600 items-center">
//                         <input
//                           type="checkbox"
//                           checked={rolesByRow[row] === "TRAINEE"}
//                           onChange={() => setRoleForRow(row, "TRAINEE")}
//                           className="mr-2"
//                         />
//                         <span>GĐV Tập sự</span>
//                       </label>
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       <div className="mt-4 flex items-center justify-between">
//         {/* <button
//           type="button"
//           onClick={onToggleBSelector}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           {showBSelector
//             ? "Đóng chọn nhân viên (B)"
//             : "Chọn nhân viên thực hiện (B)"}
//         </button> */}
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-gray-600">
//             Đã chọn: {selectedBUsers.length} giám định viên
//           </span>
//           <button
//             type="button"
//             onClick={async () => {
//               // Enforce exactly one TEAM_LEADER and that it is on row 0
//               const leaders = selectedMembersPayload.filter(
//                 (m) => m.roleCode === "TEAM_LEADER"
//               );
//               const row0User = selectedBUsers[0];
//               const row0IsLeader =
//                 (rolesByRow[0] || "TEAM_LEADER") === "TEAM_LEADER" &&
//                 !!row0User;
//               if (!row0IsLeader || leaders.length !== 1) {
//                 alert("Hàng 1 phải là Trưởng nhóm (và chỉ có 1 Trưởng nhóm)");
//                 return;
//               }
//               await onAssignB(selectedMembersPayload);
//             }}
//             disabled={selectedMembersPayload.length === 0}
//             className={`px-4 py-2 text-white rounded ${
//               selectedMembersPayload.length === 0
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//           >
//             Lưu phân công B
//           </button>
//         </div>
//       </div>

//       {/* {showBSelector && (
//         <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//           <h4 className="font-medium text-blue-800 mb-2">
//             Chọn nhanh tất cả giám định viên:
//           </h4>
//           <InspectorSelector
//             inspectors={inspectors}
//             selectedBUsers={selectedBUsers}
//             onSelectBUsers={onSelectBUsers}
//           />
//         </div>
//       )} */}
//     </div>
//   );
// }

// components/TeamMembersTable.tsx
"use client";
import { useEffect, useMemo, useState, useRef } from "react";
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
      roleCode: "TEAM_LEADER" | "MEMBER" | "TRAINEE";
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
  const [rolesByRow, setRolesByRow] = useState<
    Record<number, "TEAM_LEADER" | "MEMBER" | "TRAINEE">
  >({});

  const [numRows, setNumRows] = useState(4); // Start with 4 rows by default

  // Ref để theo dõi xem đã khởi tạo từ teamMembers chưa
  const hasInitialized = useRef(false);

  // useEffect để khởi tạo ban đầu hoặc khi teamMembers thay đổi
  useEffect(() => {
    // Chỉ chạy khởi tạo nếu chưa từng khởi tạo hoặc teamMembers thay đổi
    if (!hasInitialized.current || teamMembers.length > 0) {
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
        });

      const initialNumRows = Math.max(4, bMembers.length); // Đảm bảo ít nhất 4 hàng hoặc đủ số lượng thành viên B
      setNumRows(initialNumRows);

      const preUsers: number[] = new Array(initialNumRows).fill(0);
      const preRoles: Record<number, "TEAM_LEADER" | "MEMBER" | "TRAINEE"> = {};

      bMembers.forEach((m, idx) => {
        if (idx < initialNumRows) {
          preUsers[idx] = m.userId as number;
          preRoles[idx] = (m.roleCode as any) || "MEMBER";
        }
      });

      // Đảm bảo hàng 0 là leader nếu có
      let currentLeaderIdx = -1;
      for (let i = 0; i < preUsers.length; i++) {
        if (preUsers[i] !== 0 && preRoles[i] === "TEAM_LEADER") {
          currentLeaderIdx = i;
          break;
        }
      }

      if (currentLeaderIdx !== -1 && currentLeaderIdx !== 0) {
        // Swap nếu leader không ở vị trí 0
        const tmpUser = preUsers[0];
        const tmpRole = preRoles[0];

        preUsers[0] = preUsers[currentLeaderIdx];
        preRoles[0] = preRoles[currentLeaderIdx];

        preUsers[currentLeaderIdx] = tmpUser;
        preRoles[currentLeaderIdx] = tmpRole || "MEMBER";
      } else if (currentLeaderIdx === -1 && bMembers.length > 0) {
        // Nếu không có leader nào được chỉ định, đặt người đầu tiên làm leader
        if (preUsers[0] !== 0) { // Chỉ đặt leader nếu có người được chọn ở hàng 0
            preRoles[0] = "TEAM_LEADER";
        }
      } else if (bMembers.length === 0 && initialNumRows > 0) {
        // Nếu không có thành viên B nào nhưng có hàng, đặt hàng 0 làm leader mặc định
        preRoles[0] = "TEAM_LEADER";
      }


      onSelectBUsers(preUsers);
      setRolesByRow(preRoles);
      hasInitialized.current = true; // Đánh dấu đã khởi tạo
    }
  }, [teamMembers, onSelectBUsers, numRows]); 
  
  // Đồng bộ numRows với độ dài của selectedBUsers nếu có sự thay đổi từ bên ngoài hoặc khi tải dữ liệu
  useEffect(() => {
    if (selectedBUsers.length > numRows) {
      setNumRows(selectedBUsers.length);
    }
  }, [selectedBUsers]);

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
      setRolesByRow((prev) => ({
        ...prev,
        [rowIndex]: rowIndex === 0 ? "TEAM_LEADER" : "MEMBER",
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

    // Lặp qua số hàng hiện tại thay vì độ dài của selectedBUsers
    for (let i = 0; i < numRows; i++) {
      const uid = selectedBUsers[i];
      if (!uid || seen.has(uid)) continue; // Bỏ qua nếu không có userId hoặc đã chọn

      const role = rolesByRow[i] || (i === 0 ? "TEAM_LEADER" : "MEMBER");
      seen.add(uid);
      result.push({ userId: uid, roleCode: role });
    }
    return result;
  }, [selectedBUsers, rolesByRow, numRows]);


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
    const newSelectedBUsers = selectedBUsers.filter((_, idx) => idx !== rowIndex);
    onSelectBUsers(newSelectedBUsers);

    // Cập nhật rolesByRow: xóa vai trò của hàng bị xóa và điều chỉnh chỉ mục của các hàng phía sau
    setRolesByRow((prev) => {
      const newRoles = { ...prev };
      delete newRoles[rowIndex]; // Xóa vai trò của hàng bị xóa
      const adjustedRoles: Record<number, "TEAM_LEADER" | "MEMBER" | "TRAINEE"> = {};
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
                  {/* Logic hiển thị checkbox cho Trưởng nhóm và thành viên */}
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
                          // Vô hiệu hóa nếu hàng này chưa có giám định viên được chọn
                          disabled={!currentSelectedUser}
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
                          disabled={!currentSelectedUser}
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
                          disabled={!currentSelectedUser}
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
                          disabled={!currentSelectedUser}
                        />
                        <span>GĐV Tập sự</span>
                      </label>
                    </div>
                  )}
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

              // Kiểm tra hàng 0 là leader và chỉ có một leader
              const leaders = selectedMembersPayload.filter(
                (m) => m.roleCode === "TEAM_LEADER"
              );

              const row0UserSelected = selectedBUsers[0] !== 0; // Đảm bảo hàng 0 có người được chọn
              const row0IsLeader =
                (rolesByRow[0] || "TEAM_LEADER") === "TEAM_LEADER";


              if (!row0UserSelected || !row0IsLeader || leaders.length !== 1) {
                alert("Hàng 1 phải là Trưởng nhóm giám định (và chỉ có 1 Trưởng nhóm trong danh sách đã chọn).");
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