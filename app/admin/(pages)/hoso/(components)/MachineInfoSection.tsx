"use client";

import React, { useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { MachineDetails } from "@/app/types/machines";
import { dossierApi } from "@/app/admin/services/dossierApi";
import { PlusCircle, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";

interface MachineDetailProps {
  dossierId?: string | null;
  isActive: boolean;
}

function autoResizeTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export default function MachineInfoSection({ dossierId, isActive }: MachineDetailProps) {
  const [machines, setMachines] = useState<MachineDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = useCallback(async () => {
    if (!dossierId) return;
    setLoading(true);
    try {
      const response = await dossierApi.getMachinesByDossier(dossierId);
      setMachines(response as MachineDetails[]);
    } catch (err) {
      console.error("Lỗi tải máy móc:", err);
      setError("Không thể tải thông tin máy móc.");
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => {
    if (isActive && dossierId) fetchMachines();
  }, [isActive, dossierId, fetchMachines]);

  const handleInputChange = (index: number, field: keyof MachineDetails, value: string) => {
    setMachines((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]:
          field === "manufactureYear" || field === "quantity"
            ? Number(value) || 0
            : value,
      };
      return updated;
    });
  };

  const handleAddMachine = () => {
    const newMachine: Partial<MachineDetails> = {
      machineId: `temp-${Date.now()}`,
      registrationNo: machines[0]?.registrationNo || "",
      itemName: "",
      brand: "",
      model: "",
      serialNumber: "",
      manufactureCountry: "",
      manufacturerName: "",
      manufactureYear: "",
      quantity: 1,
      usage: "",
      note: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMachines((prev) => [...prev, newMachine as MachineDetails]);
  };

  const handleDeleteMachine = (index: number) => {
    setMachines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveMachines = async () => {
    if (!dossierId) return toast.error("Thiếu dossierId!");

    setSaving(true);
    try {
      // await dossierApi.saveMachines(dossierId, machines);
      toast.success("Đã lưu thông tin máy móc!");
      await fetchMachines(); // reload để sync dữ liệu từ server
    } catch (err) {
      console.error("Lỗi lưu máy móc:", err);
      toast.error("Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const editableAreaClass =
    "w-full border-none bg-transparent text-[#1e3a8a] text-sm leading-snug focus:outline-none overflow-hidden resize-none";

  const tableHeaderClass =
    "border border-gray-400 bg-[#e8edf7] text-[#1e3a8a] font-semibold text-center text-sm px-2 py-2";
  const tableCellClass = "border border-gray-400 text-sm px-2 py-1 align-top text-gray-800";

  if (loading)
    return <div className="text-center p-4 text-gray-700">Đang tải thông tin máy móc...</div>;

  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="mt-0">
      <h1 className="text-center text-[#1e3a8a] font-bold text-xl mb-4">
        DANH MỤC HÀNG HÓA YÊU CẦU GIÁM ĐỊNH
      </h1>

      {/* Header action */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[#1e3a8a] font-semibold text-base">Danh sách máy móc</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAddMachine}
            className="flex items-center gap-1 px-3 py-1 bg-[#1e3a8a] text-white rounded-md text-sm hover:bg-[#324cb0] transition"
          >
            <PlusCircle size={16} /> Thêm máy
          </button>
          <button
            onClick={handleSaveMachines}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-400 border-collapse text-gray-800">
        <thead>
          <tr>
            <th className={classNames(tableHeaderClass, "w-[3%]")}>STT</th>
            <th className={classNames(tableHeaderClass, "w-[25%]")}>Tên hàng hóa</th>
            <th className={classNames(tableHeaderClass, "w-[8%]")}>Nhãn hiệu</th>
            <th className={classNames(tableHeaderClass, "w-[8%]")}>Model</th>
            <th className={classNames(tableHeaderClass, "w-[10%]")}>Số hiệu</th>
            <th className={classNames(tableHeaderClass, "w-[10%]")}>Nước sản xuất</th>
            <th className={classNames(tableHeaderClass, "w-[15%]")}>Tên nhà sản xuất</th>
            <th className={classNames(tableHeaderClass, "w-[6%]")}>Năm SX</th>
            <th className={classNames(tableHeaderClass, "w-[5%]")}>Số lượng</th>
            <th className={classNames(tableHeaderClass, "w-[10%]")}>Công dụng</th>
            <th className={classNames(tableHeaderClass, "w-[15%]")}>Ghi chú</th>
            <th className={classNames(tableHeaderClass, "w-[4%]")}></th>
          </tr>
        </thead>

        <tbody>
          {machines.map((machine, index) => (
            <tr key={machine.machineId}>
              <td className={classNames(tableCellClass, "text-center align-middle")}>
                {index + 1}
              </td>

              {[
                "itemName",
                "brand",
                "model",
                "serialNumber",
                "manufactureCountry",
                "manufacturerName",
                "manufactureYear",
                "quantity",
                "usage",
                "note",
              ].map((field) => (
                <td
                  key={field}
                  className={classNames(
                    tableCellClass,
                    field === "note" ? "min-w-[150px]" : "",
                  )}
                >
                  <textarea
                    value={(machine[field as keyof MachineDetails] as string | number) ?? ""}
                    onChange={(e) =>
                      handleInputChange(index, field as keyof MachineDetails, e.target.value)
                    }
                    className={classNames(
                      editableAreaClass,
                      field === "note" ? "text-[13px]" : ""
                    )}
                    style={{
                      fontSize: field === "note" ? "13px" : undefined,
                      minHeight: field === "note" ? "48px" : "28px",
                    }}
                    ref={(el) => autoResizeTextarea(el)}
                    onInput={(e) => autoResizeTextarea(e.currentTarget)}
                  />
                </td>
              ))}

              <td className={classNames(tableCellClass, "text-center align-middle")}>
                <button
                  onClick={() => handleDeleteMachine(index)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Xóa máy"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-center border border-gray-400 border-t-0 text-sm italic text-[#1e3a8a] py-2">
        - Hết -
      </div>
    </div>
  );
}
