"use client";

import React, { useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { MachineDetails } from "@/app/types/machines";
import { dossierApi } from "@/app/admin/services/dossierApi";

interface MachineDetailProps {
  dossierId?: string | null;
  registrationNo?: string | null;
  declarationPlace?: string | null;
  isActive: boolean;
}

export default function MachineInfoSectionView({ dossierId, isActive, registrationNo, declarationPlace }: MachineDetailProps) {
  const [machines, setMachines] = useState<MachineDetails[]>([]);
  const [loading, setLoading] = useState(false);
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

  const tableHeaderClass =
    "border border-gray-400 bg-[#e8edf7] text-[#1e3a8a] font-semibold text-center text-sm px-2 py-2";
  const tableCellClass = "border border-gray-400 text-sm px-2 py-1 align-top text-gray-800";

  if (loading)
    return <div className="text-center p-4 text-gray-700">Đang tải thông tin máy móc...</div>;

  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="mt-0 overflow-auto max-h-[400px] ">
      <h1 className="text-center text-[#1e3a8a] font-bold text-xl mb-4">
        DANH MỤC HÀNG HÓA YÊU CẦU GIÁM ĐỊNH
      </h1>
 <div className="border border-gray-400 grid grid-cols-2 text-sm mb-4">
        <div className="border-r border-gray-400 px-2 py-1 text-[#1e3a8a] font-semibold flex items-center">
          THUỘC SỐ YÊU CẦU
        </div>
        <div className="px-2 py-1 bg-blue-50 flex items-center">
          <input
            type="text"
            value={registrationNo || ""}
            readOnly
            className="w-full text-red-500 font-bold bg-transparent outline-none border-none text-sm text-gray-800"
          />
        </div>

        <div className="border-t border-r border-gray-400 px-2 py-1 text-[#1e3a8a] font-semibold flex items-center">
          HẢI QUAN MỞ TỜ KHAI
        </div>
        <div className="border-t px-2 py-1 bg-blue-50 flex items-center">
          <input
            type="text"
            value={declarationPlace || ""}
            readOnly
            className="w-full bg-transparent outline-none border-none text-sm text-gray-800"
          />
        </div>
      </div>
      <table className="w-full border border-gray-400 border-collapse text-gray-800">
        <thead>
          <tr>
            <th className={classNames(tableHeaderClass, "w-[2%]")}>STT</th>
            <th className={classNames(tableHeaderClass, "w-[20%]")}>Tên hàng hóa</th>
            <th className={classNames(tableHeaderClass, "w-[8%]")}>Nhãn hiệu</th>
            <th className={classNames(tableHeaderClass, "w-[8%]")}>Model</th>
            <th className={classNames(tableHeaderClass, "w-[10%]")}>Số hiệu</th>
            <th className={classNames(tableHeaderClass, "w-[5%]")}>Nước sản xuất</th>
            <th className={classNames(tableHeaderClass, "w-[15%]")}>Tên nhà sản xuất</th>
            <th className={classNames(tableHeaderClass, "w-[6%]")}>Năm SX</th>
            <th className={classNames(tableHeaderClass, "w-[2%]")}>Số lượng</th>
            <th className={classNames(tableHeaderClass, "w-[10%]")}>Công dụng</th>
            <th className={classNames(tableHeaderClass, "w-[30%]")}>Ghi chú</th>
          </tr>
        </thead>

        <tbody>
          {machines.map((machine, index) => (
            <tr key={machine.machineId}>
              <td className={classNames(tableCellClass, "text-center")}>{index + 1}</td>
              <td className={tableCellClass}>{machine.itemName}</td>
              <td className={tableCellClass}>{machine.brand}</td>
              <td className={tableCellClass}>{machine.model}</td>
              <td className={tableCellClass}>{machine.serialNumber}</td>
              <td className={tableCellClass}>{machine.manufactureCountry}</td>
              <td className={tableCellClass}>{machine.manufacturerName}</td>
              <td className={classNames(tableCellClass, "text-center")}>{machine.manufactureYear}</td>
              <td className={classNames(tableCellClass, "text-center")}>{machine.quantity}</td>
              <td className={tableCellClass}>{machine.usage}</td>
              <td className={tableCellClass}>{machine.note}</td>
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
